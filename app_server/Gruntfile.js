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
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('debug', ['browserify:debug']);
  grunt.registerTask('default', ['browserify:dist', 'uglify']);
};
