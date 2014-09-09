"use strict";
var http, obfuscate, unescapeHTML;

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
  var item, req, site, _i, _len, _ref;
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
  site = "www.javascriptobfuscator.com";
  req = http.get({
    hostname: site,
    port: 80,
    path: "/"
  }, function(res) {
    var data;
    res.setEncoding("utf8");
    data = "";
    res.on("data", function(chunk) {
      return data += chunk;
    });
    return res.on("end", function() {
      var eventValidation, qr, req2, viewState;
      viewState = /id=\"__VIEWSTATE\".+value=\"(.+)\"/.exec(data)[1];
      eventValidation = /id=\"__EVENTVALIDATION\".+value=\"(.+)\"/.exec(data)[1];
      qr = require("querystring").stringify({
        __VIEWSTATE: viewState,
        __EVENTVALIDATION: eventValidation,
        TextBox1: source,
        TextBox2: "",
        Button1: "Obfuscate",
        cbEncodeStr: options.encodeString,
        cbEncodeNumber: options.encodeNumber,
        cbMoveStr: options.replaceNames,
        cbReplaceNames: options.moveString,
        TextBox3: options.exclusions.join("\r\n")
      });
      req2 = http.request({
        hostname: site,
        port: 80,
        path: "/",
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
            code = /<textarea([^>]+)>\r\n(.+)<\/textarea>/.exec(data);
            return typeof cb === "function" ? cb(null, unescapeHTML(code[2])) : void 0;
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

//# sourceMappingURL=index.map
