var gulp          = require('gulp'),
		sass          = require('gulp-sass'),
		browsersync   = require('browser-sync'),
		concat        = require('gulp-concat'),
		uglify        = require('gulp-uglify'),
		cleancss      = require('gulp-clean-css'),
		rename        = require('gulp-rename'),
		autoprefixer  = require('gulp-autoprefixer'),
		notify        = require("gulp-notify"),
		spritesmith   = require('gulp.spritesmith'),
		imagemin      = require('gulp-imagemin'),
		imageoptimize = require('gulp-image-optimize'),
		svgmin        = require('gulp-svgmin'),
		cheerio       = require('gulp-cheerio'),
		replace       = require('gulp-replace'),
		svgSprite     = require('gulp-svg-sprite'),
		babel         = require("gulp-babel");


gulp.task('browser-sync', function() {
	browsersync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		//open: false,
		// tunnel: true,
		// tunnel: "projectname", //Demonstration page: http://projectname.localtunnel.me
	})
});

gulp.task('style', function() {
	return gulp.src('app/sass/**/*.sass')
	.pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
	.pipe(gulp.dest('app/css'))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 5 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest('app/css'))
	.pipe(browsersync.reload( {stream: true} ))
});

gulp.task('babel', function() {
	return gulp.src('app/js/babel/common.js')
	.pipe(babel({
		presets: ['env']
	}))
	.pipe(gulp.dest('app/js'))
});

gulp.task('js', function() {
	return gulp.src([
		'app/libs/classie.js/classie.js',
		'app/libs/snap.svg/snap.svg-min.js',
		'app/js/common.js' // Always at the end
		])
	.pipe(concat('scripts.min.js'))
	.pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('app/js'))
	.pipe(browsersync.reload({ stream: true }))
});

gulp.task('sprite', function () {
    var spriteData = gulp.src('app/helper/png_sprites/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: '_sprite.sass',
        padding: 2
    }));
    return spriteData.pipe(gulp.dest('app/sass/helper/sprites'));
});

gulp.task('imagemin', ['sprite'], function(){
	return gulp.src('app/sass/helper/sprites/sprite.png')
    .pipe(imagemin())
    .pipe(gulp.dest('app/img/sprites'))
});

gulp.task('imageoptimize', function(){
	return gulp.src('app/helper/images/*.*')
    .pipe(imageoptimize())
    .pipe(gulp.dest('app/img'))
});

gulp.task('svg', function(){
	return gulp.src('app/helper/svg_sprites/*.svg')
	.pipe(svgmin({
            plugins: [{
                removeDoctype: true
            }, {
                removeComments: true
            }, {
                cleanupNumericValues: {
                    floatPrecision: 2
                }
            }, {
                convertColors: {
                    names2hex: false,
                    rgb2hex: false
                }
            }]
        }))
	//.pipe(cheerio({
    //    run: function () {
    //    	('[fill]').removeAttr('fill');
    //    	('[stroke]').removeAttr('stroke');
    //    	('[style]').removeAttr('style');
    //    },
    //    parserOptions: {
    //    xmlMode: true
    //    }
   //}))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
    	mode: {
            symbol: {
            	sprite: 'sprite.svg'
            }
        }
    }))
    .pipe(gulp.dest('app/helper/svg_sprites'))
});

gulp.task('watch', ['style', 'babel', 'js', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.sass', ['style']);
	gulp.watch(['app/js/babel/common.js'], ['babel']);
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
	gulp.watch('app/*.html', browsersync.reload)
});

gulp.task('default', ['watch']);
