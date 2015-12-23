var fs = require('fs-extra');
var path = require('path');
var exec = require('child_process').exec;

function copyFiles() {
  var copyDirs = ['images', 'lib', 'module'];
  copyDirs.forEach(function(d) {
    fs.copySync(path.join('..', d), path.join('..', 'firefox', 'data', d));
  });
  var filesReg = new RegExp(/\.(js|css)?$/);
  var copyFiles = fs.readdirSync(path.join('..')).filter(function(f) {
    return filesReg.test(f);
  });
  copyFiles.forEach(function(f) {
    fs.copySync(path.join('..', f), path.join('..', 'firefox', 'data', f));
  });
}

function updateManifest() {
  var manifest = fs.readJsonSync(path.join('..', 'manifest.json'));
  var packag = fs.readJsonSync(path.join('..', 'firefox', 'package.json'));
  packag.version = manifest.version;
  fs.writeJsonSync(path.join('..', 'firefox', 'package.json'), packag);

  var mainPrefix = [
    '// Import the page-mod API',
    'var pageMod = require(\'sdk/page-mod\');',
    '// Import the self API',
    'var self = require(\'sdk/self\');',
    '// Import simple-storage API',
    'var sstorage = require(\'sdk/simple-storage\');',
    'pageMod.PageMod({',
    '  include: [\'*.phxbit.com\'],',
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
    '  contentScriptWhen: \'ready\',',
    '  onAttach: function(worker) {',
    '    worker.port.on(\'storageGet\', function(key) {',
    '      worker.port.emit(\'storageGet\' + key, sstorage.storage[key]);',
    '    });',
    '    worker.port.on(\'storageSet\', function(obj) {',
    '      sstorage.storage[obj.key] = obj.val;',
    '    });',
    '  }',
    '});',
    '',
  ];
  var mainJs = [];
  manifest.content_scripts[0].js.forEach(function(e) {
    mainJs.push('    self.data.url(\'' + e + '\')');
  });
  var mainRes = [];
  manifest.web_accessible_resources.forEach(function(e) {
    mainRes.push('    \'' + e + '\': self.data.url(\'' + e + '\')');
  });

  main = mainPrefix.join('\n') + mainJs.join(',\n') + mainMid.join('\n') + mainRes.join(',\n') + mainSuffix.join('\n');

  fs.outputFileSync(path.join('..', 'firefox', 'index.js'), main);
}

var xpiReg = new RegExp(/\.xpi?$/);

function cleanUp() {
  var xpis = fs.readdirSync(path.join('..', 'firefox')).filter(function(f) {
    return xpiReg.test(f);
  });
  xpis.forEach(function(xpi) {
    fs.removeSync(path.join('..', 'firefox', xpi));
  });
}

function runBuildCommand() {
  process.chdir(path.join('..', 'firefox'));
  var cmd = ['jpm', 'xpi'];
  exec(cmd.join(' '), function(error, stdout, stderr) {
    console.log(stdout);
    var xpis = fs.readdirSync('.').filter(function(f) {
      return xpiReg.test(f);
    });
    xpis.forEach(function(xpi) {
      fs.move(xpi, path.join('..', 'build', 'pbe.xpi'), {
        clobber: true
      }, function(e) {
        if (e) {
          console.log(e);
        } else {
          console.log('Success');
        }
      });
    });
  });
}

function build() {
  console.log('Build firefox');
  copyFiles();
  updateManifest();
  cleanUp();
  runBuildCommand();
}

exports.build = build;
