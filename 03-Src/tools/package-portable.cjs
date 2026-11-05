'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {build, Platform, Arch} = require('electron-builder');
const root = path.resolve(__dirname, '..');
const pkg = require('../package.json');
const config = require('../electron-builder.cjs');
const name = `上班鼓励器-绿色单文件-v${pkg.version}-win-x64-【codex】.exe`;
const destination = path.resolve(root, '../04-output', name);
(async () => {
  if (fs.existsSync(destination)) throw Error('同版单文件已存在，不覆盖已有交付；请先确认版本。');
  const output = path.resolve(root, '../Codex-Temp', `portable-build-${pkg.version}-${Date.now()}`);
  await build({
    projectDir: root,
    targets: Platform.WINDOWS.createTarget(['portable'], Arch.x64),
    publish: 'never',
    config: {...config, directories: {...config.directories, output}}
  });
  const artifact = path.join(output, name);
  if (!fs.existsSync(artifact)) throw Error('没有生成预期单文件 EXE');
  fs.mkdirSync(path.dirname(destination), {recursive: true});
  fs.copyFileSync(artifact, destination, fs.constants.COPYFILE_EXCL);
  const bytes = fs.readFileSync(destination);
  const receipt = {version: pkg.version, file: destination, bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'), buildDirectory: output};
  fs.writeFileSync(path.resolve(root, `../Codex-Temp/portable-build-${pkg.version}.json`), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt, null, 2));
})().catch(error => {console.error(error.message); process.exitCode = 1;});
