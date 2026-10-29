const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');
const dependencies = createRequire(path.join(__dirname, '../tool-dependencies/package.json'));
const parser = dependencies('@babel/parser');
const generate = dependencies('@babel/generator').default;
const root = path.resolve(__dirname, '..');
const input = path.join(root, 'unpacked');
const output = path.join(root, 'recovered-code');
const modules = new Map();
const warnings = [];
function filesIn(directory) {
  return fs.readdirSync(directory, {withFileTypes:true}).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  });
}
for (const file of filesIn(input).filter(file => /(?:appservice\.app|common\.app|chunk_\d+\.appservice)\.js$/.test(file))) {
  const ast = parser.parse(fs.readFileSync(file, 'utf8'), {sourceType:'script'});
  for (const statement of ast.program.body) {
    const call = statement.type === 'ExpressionStatement' && statement.expression;
    if (!call || call.type !== 'CallExpression' || call.callee.type !== 'Identifier' || call.callee.name !== 'define') continue;
    const [id, factory] = call.arguments;
    if (id?.type !== 'StringLiteral' || !['FunctionExpression','ArrowFunctionExpression'].includes(factory?.type)) continue;
    const body = factory.body.body;
    if (!Array.isArray(body)) continue;
    const code = body.map(statement => generate(statement, {comments:true,compact:false}).code).join('\n')+'\n';
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    const previous = modules.get(id.value);
    if (previous) {
      if (previous.sha256 !== hash) warnings.push({module:id.value,first:previous.source,additional:path.relative(root,file)});
      continue;
    }
    const destination = path.resolve(output, id.value.replace(/^[/\\]+/, ''));
    if (!destination.startsWith(output + path.sep)) throw new Error(`Unsafe module path ${id.value}`);
    fs.mkdirSync(path.dirname(destination), {recursive:true});
    if (fs.existsSync(destination)) {
      if (fs.readFileSync(destination,'utf8')!==code) throw new Error('Existing recovered module differs: '+id.value);
    } else fs.writeFileSync(destination, code, {flag:'wx'});
    modules.set(id.value, {module:id.value,source:path.relative(root,file),bytes:Buffer.byteLength(code),sha256:hash});
  }
}
const config = JSON.parse(fs.readFileSync(path.join(input,'__APP__/app-config.json'),'utf8'));
const roots = config.subPackages.map(pack=>pack.root);
const downloadedRoots = fs.readdirSync(input).filter(n=>n!=='__APP__').map(n=>n.replace(/^_|_$/g,'')+'/');
const missingSubPackages = roots.filter(root=>!downloadedRoots.includes(root));
const availablePages=config.pages.filter(page=>modules.has(page+'.js'));
const summary = {moduleCount:modules.size,totalPageCount:config.pages.length,availablePages,missingSubPackages,warnings,modules:[...modules.values()]};
fs.writeFileSync(path.join(root,'module-recovery-manifest.json'),JSON.stringify(summary,null,2));
const assets = path.join(input,'__APP__/assets');
if(fs.existsSync(assets)) fs.cpSync(assets,path.join(output,'assets'),{recursive:true});
fs.writeFileSync(path.join(root,'recovered-app-config.json'),JSON.stringify(config,null,2));
console.log(JSON.stringify({moduleCount:modules.size,availablePages:availablePages.length,totalPageCount:config.pages.length,missingSubPackages,conflictingModules:warnings.length}));
