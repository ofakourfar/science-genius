const gulp = require('gulp');
const zip = require('gulp-zip');

gulp.task('default', () => {
	return gulp.src([
		'manifest.xml',
		'icon.png',
		'LICENSE',
		'index.html',
		'nb-2.7.0.js',
		'css/*',
		'js/*',
		'mp3/*',
		'last.html',
		'lyrics.html',
		'quickSetup.html',
		'stamp.html'
	], { 'base': '.' }).pipe(zip('ScienceGenius.addon'))
	.pipe(gulp.dest('.'));
});
