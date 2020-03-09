const path = require('path');
const fs = require('fs');

const argv = require('yargs').argv;

const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const gls = require('gulp-live-server');
const ifCondition = require('gulp-if');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const uglify = require('gulp-uglify-es').default;

const es = require('event-stream');

const cssRoot = './src/css';

function remove(assets) {
    if (!Array.isArray(assets)) throw error('no assets defined to clean');

    return gulp.src(assets, { allowEmpty: true, read: false })
        .pipe(clean());
}

function buildImages() {
    return gulp.src(['./node_modules/purecss-ui/public/images/**'], { allowEmpty: true })
        .pipe(gulp.dest('./wwwroot/images'));
}

function buildFonts() {
    return gulp.src(['./node_modules/@fortawesome/fontawesome-free/webfonts/**'], { allowEmpty: true })
        .pipe(gulp.dest('./wwwroot/fonts'));
}

function buildCssLib(resolve) {
    let isMinified = argv.minify;

    return es.merge([
        gulp
            .src([
                './node_modules/@fortawesome/fontawesome-free/css/all.css'
            ], { allowEmpty: true })
            .pipe(postcss([
                require('postcss-replace')({
                    'pattern': /(webfonts)/g,
                    'data': { 'webfonts': 'fonts' }
                })
            ]))
            .pipe(ifCondition(isMinified, cleanCSS()))
            .pipe(rename('lib.css'))
            .pipe(gulp.dest('./wwwroot/css')),
        gulp
            .src([
                './node_modules/purecss-ui/dist/purecss-ui-default.css',
                './node_modules/purecss-ui/dist/purecss-ui-dark.css'
            ], { allowEmpty: true })
            .pipe(gulp.dest('./wwwroot/css'))
    ]).on('end', resolve);
}

function getThemePath(theme) {
    let themePath = path.join(cssRoot, theme);

    if (fs.existsSync(themePath)) return themePath;
    else return null;
}

function compileThemeStream(theme, isMinified) {
    if (!theme) throw error('theme argument expects a value');

    let themePath = getThemePath(theme);
    if (!fs.existsSync(themePath)) throw error('invalid theme argument');


    return gulp
        .src(path.join(themePath, 'theme.pcss'), { allowEmpty: true })
        .pipe(postcss([
            require('autoprefixer')({ grid: 'autoplace', overrideBrowserslist: ['>1%'] }),
            require('postcss-import-ext-glob'),
            require('postcss-import'),
            require('precss'),
            require('postcss-calc'),
            require('postcss-color-function')
        ]))
        .pipe(rename('purecss-ui-menu-' + theme + '.css'))
        .pipe(ifCondition(isMinified, cleanCSS()))
        .pipe(gulp.dest('./wwwroot/css'));
}

function compileThemes(themes, isMinified) {
    if (!Array.isArray(themes)) throw error('themes argument expects an array');

    let theme = themes.shift();
    if (!theme) Promise.resolve();

    return new Promise((resolve, reject) => {
        compileThemeStream(theme, isMinified)
            .on('end', () => {
                console.log(theme + '.css');

                if (themes.length) {
                    compileThemes(themes, isMinified)
                        .then(() => {
                            resolve();
                        });
                } else {
                    resolve();
                }
            });
    });
}

function findThemes() {
    let themes = [];

    if (fs.existsSync(cssRoot) && fs.statSync(cssRoot).isDirectory()) {
        fs.readdirSync(cssRoot).forEach(theme => {
            let themePath = path.join(cssRoot, theme);
            if (fs.statSync(themePath).isDirectory()) themes.push(theme);
        });
    }

    return themes;
}

function buildTheme(resolve) {
    let themes = argv.theme ? [argv.theme] : findThemes();
    let isMinified = argv.minify;

    compileThemes(themes, isMinified)
        .then(() => {
            resolve();
        })
        .catch((err) => {
            resolve(error(err));
        });
}

function buildJs(resolve) {
    var isMinified = argv.minify;
    var isTranspiled = argv.transpile;

    return es.merge(
        gulp
            .src([
                './node_modules/vanilla-ready/vanilla-ready.js'
            ], { allowEmpty: true })
            .pipe(ifCondition(isTranspiled, babel({ presets: ['@babel/env'] })))
            .pipe(concat('lib.js'))
            .pipe(ifCondition(isMinified, uglify()))
            .pipe(gulp.dest('./wwwroot/js')),
        gulp
            .src([
                './src/js/purecss.ui*.js'
            ], { allowEmpty: true })
            .pipe(ifCondition(isTranspiled, babel({ presets: ['@babel/env'] })))
            .pipe(concat('purecss-ui-menu.js'))
            .pipe(ifCondition(isMinified, uglify()))
            .pipe(gulp.dest('./wwwroot/js'))
    ).on('end', resolve);
}

function buildDistCss(resolve) {
    let themes = findThemes();

    compileThemes(themes, false)
        .then(() => {
            es.merge([
                gulp.src(['./wwwroot/css/purecss-ui-menu-*.css'])
                    .pipe(gulp.dest('./dist')),
                gulp.src(['./wwwroot/css/purecss-ui-menu-*.css'])
                    .pipe(cleanCSS())
                    .pipe(rename(function(path) {
                        return {
                            dirname: path.dirname,
                            basename: path.basename + '.min',
                            extname: '.css'
                        };
                    }))
                    .pipe(gulp.dest('./dist'))
            ]).on('end', resolve);
        })
        .catch((err) => {
            resolve(error(err));
        });
}

function buildDistJs(resolve) {
    return es.merge(
        gulp
            .src([
                './src/js/purecss.ui*.js'
            ], { allowEmpty: true })
            .pipe(babel({ presets: ['@babel/env'] }))
            .pipe(concat('purecss-ui-menu.js'))
            .pipe(gulp.dest('./dist')),
        gulp
            .src([
                './src/js/purecss.ui*.js'
            ], { allowEmpty: true })
            .pipe(babel({ presets: ['@babel/env'] }))
            .pipe(concat('purecss-ui-menu.js'))
            .pipe(uglify())
            .pipe(rename(function(path) {
                return {
                    dirname: path.dirname,
                    basename: path.basename + '.min',
                    extname: '.js'
                };
            }))
            .pipe(gulp.dest('./dist'))
    ).on('end', resolve);
}

function watch() {
    let env = argv.env || 'development';
    let server = gls('app.js', { env: { NODE_ENV: env } });

    server.start();

    let views = ['./index.html'];
    gulp.watch(views, function reloadHTML() {
        return gulp.src(views, { allowEmpty: true }).pipe(server.notify());
    });

    let css = ['./src/css/**/*'];
    gulp.watch(css, function reloadCSS() {
        return es.merge(compileThemeStream('default'), compileThemeStream('dark')).pipe(server.notify());
    });

    let js = './src/**/purecss.ui*.js';
    gulp.watch([js], function reloadJS() {
        return gulp.src([js], { allowEmpty: true })
            .pipe(concat('purecss-ui-menu.js'))
            .pipe(gulp.dest('./wwwroot/js'))
            .pipe(server.notify());
    });

    let app = ['./app.js'];
    gulp.watch(app, function reloadApp() {
        server.start.bind(server)();
    });
}

function error(err) {
    return new Error(err);
}

exports['clean:dev'] = remove.bind(this, ['wwwroot/*']);
exports['clean:dist'] = remove.bind(this, ['dist/*']);

exports['clean'] = gulp.parallel(
    remove.bind(this, ['wwwroot/*']),
    remove.bind(this, ['dist/*'])
);

exports['build:images'] = buildImages;
exports['build:fonts'] = buildFonts;

exports['build:csslib'] = buildCssLib;
exports['build:theme'] = buildTheme;

exports['build:css'] = gulp.series(
    buildCssLib,
    buildTheme
);

exports['build:js'] = buildJs;

exports['build:dev'] = gulp.series(
    remove.bind(this, ['wwwroot/*']),
    buildImages,
    buildFonts,
    buildCssLib,
    buildTheme,
    buildJs
);

exports['build:dist'] = gulp.series(
    remove.bind(this, ['dist/*']),
    buildDistCss,
    buildDistJs
);

exports['watch'] = watch;

function buildGhpages(resolve) {
    return es.merge([
        gulp.src(['./wwwroot/css/*.css'], { allowEmpty: true })
            .pipe(cleanCSS())
            .pipe(gulp.dest('./public/css')),
        gulp.src(['./node_modules/purecss-ui/public/images/**'], { allowEmpty: true })
            .pipe(gulp.dest('./public/images')),
        gulp.src(['./node_modules/@fortawesome/fontawesome-free/webfonts/**'], { allowEmpty: true })
            .pipe(gulp.dest('./public/fonts')),
        gulp.src(['./node_modules/vanilla-ready/vanilla-ready.js'], { allowEmpty: true })
            .pipe(babel({ presets: ['@babel/env'] }))
            .pipe(concat('lib.js'))
            .pipe(uglify())
            .pipe(gulp.dest('./public/js')),
        gulp.src(['./src/js/purecss.ui*.js'], { allowEmpty: true })
            .pipe(babel({ presets: ['@babel/env'] }))
            .pipe(concat('purecss-ui-menu.js'))
            .pipe(uglify())
            .pipe(gulp.dest('./public/js')),
        gulp.src(['./index.html'], { allowEmpty: true })
            .pipe(replace('href="/"', 'href="/purecss-ui-menu/"'))
            .pipe(replace('"css/', '"public/css/'))
            .pipe(replace('"fonts/', '"public/fonts/'))
            .pipe(replace('"images/', '"public/images/'))
            .pipe(replace('"js/', '"public/js/'))
            .pipe(gulp.dest('./'))
    ]).on('end', resolve);
}

exports['build:ghpages'] = gulp.series(
    remove.bind(this, ['wwwroot/*', 'public/*']),
    buildCssLib,
    buildTheme,
    buildGhpages
);