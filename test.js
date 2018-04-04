var  o = require('./index.js');
var assert = require('assert');

var source = 'console.log("123", 456)';
var obfuscatedTemplate = 'var __VAR__=["\x31\x32\x33","\x6C\x6F\x67"];console[__VAR__[1]](__VAR__[0],456)'


o.obfuscate('console.log("123", 456)', {}, function(error, data) {
    var obfuscatedString = data.replace(/__VAR__/g, /var\s(.+)=/.exec(data)[1])

    assert.equal(error, null);
    assert.equal(data, obfuscatedString);
});
