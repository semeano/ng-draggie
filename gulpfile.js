'use strict';

var gulp = require('gulp'),
		connect = require('gulp-connect');

gulp.task('serve', function () {
  connect.server({
  	port: 4000
  });
});

gulp.task('default', ['serve'], function () {});