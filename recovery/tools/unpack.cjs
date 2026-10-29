// Recover this user's own cached WeChat application packages without executing their code.
// V1MMWX format reference: https://github.com/BlackTrace/pc_wxapkg_decrypt
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const appid = 'wx54427ecbe711c90c';
const input = path.join(root, 'packages');
const output = path.join(root, 'unpacked');
const reports = [];
for (const name of fs.readdirSync(input).filter(n => n.endsWith('.wxapkg'))) {
  let data = fs.readFileSync(path.join(input, name));
  if (data.subarray(0, 6).toString() === 'V1MMWX') {
    const key = crypto.pbkdf2Sync(appid, 'saltiest', 1000, 32, 'sha1');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from('the iv: 16 bytes'));
    decipher.setAutoPadding(false);
    const head = Buffer.concat([decipher.update(data.subarray(6, 1030)), decipher.final()]);
    const tail = Buffer.from(data.subarray(1030));
    for (let i = 0; i < tail.length; i++) tail[i] ^= appid.charCodeAt(appid.length - 2);
    data = Buffer.concat([head.subarray(0, 1023), tail]);
  }
  if (data[0] !== 0xbe || data[13] !== 0xed) throw new Error(`Unrecognized package header: ${name}`);
  const count = data.readUInt32BE(14);
  if (count > 100000) throw new Error(`Invalid file count: ${name}`);
  let cursor = 18;
  const packageOutput = path.resolve(output, path.basename(name, '.wxapkg'));
  const entries = [];
  for (let i = 0; i < count; i++) {
    const length = data.readUInt32BE(cursor); cursor += 4;
    if (length > 10000 || cursor + length + 8 > data.length) throw new Error(`Invalid file name: ${name}`);
    const file = data.subarray(cursor, cursor + length).toString('utf8'); cursor += length;
    const offset = data.readUInt32BE(cursor); cursor += 4;
    const size = data.readUInt32BE(cursor); cursor += 4;
    if (offset + size > data.length) throw new Error(`Invalid file bounds: ${file}`);
    const destination = path.resolve(packageOutput, file.replace(/^[/\\]+/, ''));
    if (!destination.startsWith(packageOutput + path.sep)) throw new Error(`Unsafe file path: ${file}`);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const contents = data.subarray(offset, offset + size);
    if (fs.existsSync(destination)) {
      if (!fs.readFileSync(destination).equals(contents)) throw new Error(`Existing extracted file differs: ${file}`);
    } else fs.writeFileSync(destination, contents, { flag: 'wx' });
    entries.push({ path: file, size, sha256: crypto.createHash('sha256').update(contents).digest('hex') });
  }
  reports.push({ package: name, fileCount: count, entries });
}
fs.writeFileSync(path.join(root, 'unpack-manifest.json'), JSON.stringify(reports, null, 2));
console.log(JSON.stringify(reports.map(({ package: name, fileCount }) => ({ name, fileCount }))));
