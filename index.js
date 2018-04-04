"use strict";
var http, obfuscate, unescapeHTML;

var _host = "www.javascriptobfuscator.com";
var _path = "/Javascript-Obfuscator.aspx";

http = require("http");

unescapeHTML = function(str) {
  var escapeChars;
  if (str == null) {
    return "";
  }
  escapeChars = {
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    amp: '&'
  };
  return String(str).replace(/\&([^;]+);/g, function(entity, entityCode) {
    var match;
    match = void 0;
    if (entityCode in escapeChars) {
      return escapeChars[entityCode];
    } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
      return String.fromCharCode(parseInt(match[1], 16));
    } else if (match = entityCode.match(/^#(\d+)$/)) {
      return String.fromCharCode(~~match[1]);
    } else {
      return entity;
    }
  });
};

obfuscate = function(source, options, cb) {
  var item, req, _i, _len, _ref;
  if (!options) {
    options = {};
  }
  _ref = ["encodeString", "encodeNumber", "replaceNames", "moveString"];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    item = _ref[_i];
    if (options[item] == null) {
      options[item] = "on";
    } else {
      options[item] = !!options[item] ? "on" : "off";
    }
  }
  if (options.exclusions == null) {
    options.exclusions = ["^_get_", "^_set_", "^_mtd_"];
  }

  req = http.get({
    hostname: _host,
    port: 80,
    path: _path
  }, function(res) {
    var data;
    res.setEncoding("utf8");
    data = "";
    res.on("data", function(chunk) {
      return data += chunk;
    });
    return res.on("end", function() {
      var eventValidation, qr, req2, viewState, viewstategenerator;

      viewState = /id=\"__VIEWSTATE\".+value=\"(.+)\"/.exec(data)[1];
      eventValidation = /id=\"__EVENTVALIDATION\".+value=\"(.+)\"/.exec(data)[1];
      viewstategenerator = /id=\"__VIEWSTATEGENERATOR\".+value=\"(.+)\"/.exec(data)[1];

      qr = require("querystring").stringify({
        __EVENTTARGET: 'ctl00$MainContent$Button1',
        __VIEWSTATE: viewState,
        __VIEWSTATEGENERATOR: viewstategenerator,
        __EVENTVALIDATION: eventValidation,
        ctl00$MainContent$TextBox1: source,
        ctl00$MainContent$TextBox2: "",
        ctl00$MainContent$cbEncodeStr: options.encodeString,
        ctl00$MainContent$cbEncodeNumber: options.encodeNumber,
        ctl00$MainContent$cbMoveStr: options.replaceNames,
        ctl00$MainContent$cbReplaceNames: options.moveString,
        ctl00$MainContent$TextBox3: options.exclusions.join("\r\n")
      });
      req2 = http.request({
        hostname: _host,
        port: 80,
        path: _path,
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }, function(res) {
        res.setEncoding("utf8");
        data = "";
        res.on("data", function(chunk) {
          return data += chunk;
        });

        return res.on("end", function() {
          var code, ex;
          try {
            code = /<textarea[^>]*id="ctl00_MainContent_TextBox2"[^>]*>[\r\n]*(.+)<\/textarea>/.exec(data);
            return typeof cb === "function" ? cb(null, unescapeHTML(code[1])) : void 0;
          } catch (_error) {
            ex = _error;
            return typeof cb === "function" ? cb(ex) : void 0;
          }
        });
      });
      req2.on("error", function(error) {
        return typeof cb === "function" ? cb(error) : void 0;
      });
      req2.write(qr);
      return req2.end();
    });
  });
  req.on("error", function(error) {
    return typeof cb === "function" ? cb(error) : void 0;
  });
  return req.end();
};

module.exports = function(options) {
  return require("through2").obj(function(file, encoding, callback) {
    if (file.isNull()) {
      this.push(file);
      return callback();
    }
    if (file.isStream()) {
      return callback(new Error("gulp-jsobfuscator: Streaming not supported"));
    }
    return obfuscate(file.contents.toString(encoding), options, (function(_this) {
      return function(error, data) {
        if (error != null) {
          return callback(error);
        }
        file.contents = new Buffer(data);
        _this.push(file);
        return callback();
      };
    })(this));
  });
};

module.exports.obfuscate = obfuscate;
