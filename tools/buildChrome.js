var exec = require('child_process').exec;
var path = require('path');

function build() {
  var cmd = [
    '7z',
    'a',
    '-tzip',
    path.join('..', 'build', 'pbe.zip'),
    path.join('..', 'images'),
    path.join('..', 'lib'),
    path.join('..', 'module'),
    path.join('..', '*.js'),
    path.join('..', '*.json'),
    path.join('..', '*.css'),
  ];

  exec(cmd.join(' '), function(error, stdout, stderr) {
    console.log(stdout);
  });
}

exports.build = build;
