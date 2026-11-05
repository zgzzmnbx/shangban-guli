'use strict';
module.exports = {
  appId: 'com.daweiba.workcheer',
  productName: '上班鼓励器',
  asar: true,
  compression: 'normal',
  electronDist: 'node_modules/electron/dist',
  files: ['main.cjs', 'preload.cjs', 'lib/**/*', 'ui/**/*', 'data/**/*', 'assets/**/*', 'package.json'],
  directories: {buildResources: 'build-resources'},
  win: {
    target: [{target: 'portable', arch: ['x64']}],
    icon: 'build-resources/icon.png',
    signExecutable: false
  },
  portable: {
    artifactName: '上班鼓励器-绿色单文件-v${version}-win-x64-【codex】.exe',
    requestExecutionLevel: 'user',
    // electron-builder 26.18.0: true leaves UNPACK_DIR_NAME unset, using per-launch $PLUGINSDIR.
    // Its implementation treats false as a shared build UUID, contrary to the docs.
    unpackDirName: true
  }
};
