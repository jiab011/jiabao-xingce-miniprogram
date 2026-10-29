// Uses the user's existing local upload key for a read-only official API request.
// This script never uploads, previews, deploys, or changes remote configuration.
const path = require('node:path');
const { createRequire } = require('node:module');
const dependencies = createRequire(path.join(__dirname, '../tool-dependencies/package.json'));
const ci = dependencies('miniprogram-ci');
const timer = setTimeout(() => { console.log(JSON.stringify({status:'timeout'})); process.exit(2); }, 35000);
(async () => {
  const project = new ci.Project({
    appid: 'wx54427ecbe711c90c',
    type: 'miniProgram',
    projectPath: path.resolve(__dirname, '../sourcemap-request'),
    privateKeyPath: process.env.WECHAT_CI_PRIVATE_KEY_PATH,
    ignores: ['node_modules/**/*']
  });
  const result = await ci.getDevSourceMap({
    project, robot: 1, streaming: false,
    sourceMapSavePath: path.resolve(__dirname, '../source-map.zip')
  });
  console.log(JSON.stringify({status:'downloaded', bytes:result.length}));
})().catch(error => {
  let message=String(error.message||error);
  message=message.replace(/(?:\d{1,3}\.){3}\d{1,3}/g,'[redacted IP]');
  console.log(JSON.stringify({status:'failed',message}));
  process.exitCode=1;
}).finally(() => clearTimeout(timer));
