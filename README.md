# gulp-javascriptobfuscator

Obfuscate JavasScript via javascriptobfuscator.com. Please DO NOT include any sensitive data.

Installation
----
    npm install gulp-javascriptobfuscator
Usage
====
<pre><code>
var javascriptobfuscator = require('gulp-javascriptobfuscator');

gulp.task('scripts', function() {
    gulp.src('./lib/*.js')
    .pipe(javascriptobfuscator({
        encodeString: true, // (Optional - default: true)
        encodeNumber: true, // (Optional - default: true)
        replaceNames: true, // (Optional - default: true)
        moveString: true,   // (Optional - default: true)
        exclusions: ["^_get_", "^_set_", "^_mtd_"] // (Optional)
    }))
    .pipe(gulp.dest('./dist/'));
});
</code></pre>

# License

MIT
