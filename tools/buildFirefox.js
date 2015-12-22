var fs = require('fs-extra');
var path = require('path');
var firefoxDir = 'PBe_ff';
var exec = require('child_process').exec;

function copyFiles() {
  var copyDirs = ['images', 'lib', 'module'];
  copyDirs.forEach(function(d) {
    fs.copySync(path.join('..', d), path.join('..', '..', firefoxDir, 'data', d));
  });
  var filesReg = new RegExp(/\.(js|css)?$/);
  var copyFiles = fs.readdirSync(path.join('..')).filter(function(f) {
    return filesReg.test(f);
  });
  copyFiles.forEach(function(f) {
    fs.copySync(path.join('..', f), path.join('..', '..', firefoxDir, 'data', f));
  });
}

function updateManifest() {
  var manifest = fs.readJsonSync(path.join('..', 'manifest.json'));
  var packag = fs.readJsonSync(path.join('..', '..', firefoxDir, 'package.json'));
  packag.version = manifest.version;
  fs.writeJsonSync(path.join('..', '..', firefoxDir, 'package.json'), packag);

  var mainPrefix = [
    '// Import the page-mod API',
    'var pageMod = require("sdk/page-mod");',
    '// Import the self API',
    'var self = require("sdk/self");',
    '// Import simple-storage API',
    'var sstorage = require("sdk/simple-storage");',
    'pageMod.PageMod({',
    '  include: ["*.phxbit.com"],',
    '  contentScriptFile: [',
    '',
  ];
  var mainMid = [
    '',
    '  ],',
    '  contentScriptOptions: {',
    '',
  ];
  var mainSuffix = [
    '',
    '  },',
    '  onAttach: function(worker) {',
    '    worker.port.on("storageGet", function(key) {',
    '      worker.port.emit("storageGet" + key, sstorage.storage[key]);',
    '    });',
    '    worker.port.on("storageSet", function(obj) {',
    '      sstorage.storage[obj.key] = obj.val;',
    '    });',
    '  }',
    '});',
  ];
  var mainJs = [];
  manifest.content_scripts[0].js.forEach(function(e) {
    mainJs.push('    self.data.url("' + e + '")');
  });
  var mainRes = [];
  manifest.web_accessible_resources.forEach(function(e) {
    mainRes.push('    "' + e + '": self.data.url("' + e + '")');
  });

  main = mainPrefix.join('\n') + mainJs.join(',\n') + mainMid.join('\n') + mainRes.join(',\n') + mainSuffix.join('\n');

  fs.outputFileSync(path.join('..', '..', firefoxDir, 'index.js'), main);
}

function runBuildCommand() {
  process.chdir(path.join('..', '..', firefoxDir));
  var cmd = ['jpm', 'xpi'];
  exec(cmd.join(' '), function(error, stdout, stderr) {
    console.log(stdout);
  });
}

function build() {
  copyFiles();
  updateManifest();
  runBuildCommand();
}

exports.build = build;
