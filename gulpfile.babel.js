'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';

gulp.task('default', [
    'build',
    'watch'
]);

gulp.task('build', () => {
    gulp.src('src/**/*.js')
        .pipe(babel({
            presets: ['es2015', 'stage-0']
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
    gulp.watch('src/**/*.js', ['build']);
});