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
  var packageJson = fs.readJsonSync(path.join('..', 'firefox', 'package.json'));
  packageJson.version = manifest.version;
  fs.writeJsonSync(path.join('..', 'firefox', 'package.json'), packageJson);

  var indexJs = fs.readFileSync(path.join('..', 'firefox', 'index.js'), 'utf8');
  var js = [];
  manifest.content_scripts[0].js.forEach(function(e) {
    js.push('    self.data.url(\'' + e + '\')');
  });
  indexJs = indexJs.replace(/(contentScriptFile: \[\n)[\s\S]*(\n\s*\],)/, '$1' + js.join(',\n') + '$2');

  var resources = [];
  manifest.web_accessible_resources.forEach(function(e) {
    resources.push('    \'' + e + '\': self.data.url(\'' + e + '\')');
  });
  indexJs = indexJs.replace(/(contentScriptOptions: \{\n)[\s\S]*(\n\s*\},)/, '$1' + resources.join(',\n') + '$2');

  fs.outputFileSync(path.join('..', 'firefox', 'index.js'), indexJs);
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

function runBuildCommand(cb) {
  process.chdir(path.join('..', 'firefox'));
  var cmd = ['jpm', 'xpi'];
  exec(cmd.join(' '), function(error, stdout, stderr) {
    console.log(stdout);
    cb();
  });
}

function moveXpi(cb) {
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
        cb();
      }
    });
  });
}

function signXpi() {
  process.chdir(path.join('..', 'build'));
  var firefoxCreds = fs.readJsonSync(path.join('..', 'tools', 'firefox.creds'));
  var cmd = ['jpm', 'sign', '--api-key', firefoxCreds.user, '--api-secret',
  firefoxCreds.secret, '--xpi', 'pbe.xpi'];
  exec(cmd.join(' '), function(error, stdout, stderr) {
    console.log(stdout);
    console.log('Success');
  });
}

function build() {
  console.log('Build firefox');
  copyFiles();
  updateManifest();
  cleanUp();
  runBuildCommand(function() {
    moveXpi(function() {
      signXpi();
    });
  });
}

exports.build = build;
