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
      options: {
        transform: [
          ['babelify']
        ]
      },
      debug: {
        options: {
          browserifyOptions: {
            debug: true
          }
        },
        files: {
          './public/js/dist/app.js': ['./public/js/modules/app.js']
        }
      },
      dist: {
        files: {
          './public/js/dist/app.js': ['./public/js/modules/app.js']
        }
      }
    },

    sass: {
      options: {
        includePaths: ['./node_modules/materialize-css/sass/']
      },
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
    },
    
    copy: {
      main: {
        files: [
          {
            src: './node_modules/jquery/dist/jquery.min.js',
            dest: './public/js/dist/jquery.js'
          },
          {
            src: './node_modules/materialize-css/dist/js/materialize.min.js',
            dest: './public/js/dist/materialize.js'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-sass');

  grunt.registerTask('debug', ['browserify:debug', 'copy', 'sass:debug']);
  grunt.registerTask('default', ['browserify:dist', 'copy', 'uglify', 'sass:dist']);
};
