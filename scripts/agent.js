var library = require(__dirname + '/../package.json');
var replace = require('replace');
replace({
  regex: '%USERAGENT%',
  replacement: library.userAgent + '/' + library.version,
  paths: [__dirname + '/../lib'],
  recursive: true,
  silent: true
});
