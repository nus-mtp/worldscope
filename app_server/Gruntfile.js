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
          src: ['*.js', '!*.min.js'],
          ext: '.min.js'
          cwd: './public/js/dist',
          dest: './public/js/dist',
        }]
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['uglify']);
};
