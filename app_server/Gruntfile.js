module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      all: {
        files: [{
          expand: true,
          cwd: './public/js/dist',
          src: ['*.js'],
          dest: './public/js/dist',
          ext: '.js'
        }]
      }
    },

    browserify: {
      debug: {
        options: {
          browserifyOptions: {
            debug: true
          },
          transform: [
              ['babelify']
          ]
        },
        files: {
          './public/js/dist/app.js': ['./public/js/modules/app.js']
        }
      },
      dist: {
        options: {
          transform: [
            ['babelify']
          ]
        },
        files: {
          './public/js/dist/app.js': ['./public/js/modules/app.js']
        }
      }
    },

    sass: {
      debug: {
        options: {
          outputStyle: 'expanded',
          sourceMap: true
        },
        files: {
          './public/css/style.css': './public/css/style.scss'
        }
      },
      dist: {
        options: {
          outputStyle: 'compressed'
        },
        files: {
          './public/css/style.css': './public/css/style.scss'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-sass');

  grunt.registerTask('debug', ['browserify:debug', 'sass:debug']);
  grunt.registerTask('default', ['browserify:dist', 'uglify', 'sass:dist']);
};
