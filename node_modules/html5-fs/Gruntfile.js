'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: './.jshintrc'
      },
      files: {
        src: ['./src/*.js', ]
      }
    },

    karma: {
      browsers: {
        configFile: 'karma.conf.js'
      }
    },

    uglify: {
      mangle: {
        files: {
          './dist/fs.min.js': ['./dist/fs.js']
        }
      }
    },

    shell: {
      options: {
        stderr: true,
        stdout: true,
      },
      linelint: {
        command: './node_modules/.bin/linelint ./src/*.js'
      }
    },

    lintspaces: {
      javascript: {
        src: [
          'src/*.js'
        ],
        options: {
          newline: true,
          trailingspaces: true,
          indentation: 'spaces',
          spaces: 2,
          ignores: ['js-comments']
        }
      }
    },

    browserify: {
      test: {
        files: {
          './cordova/www/test/fs.js': ['./src/api.js'],
        },
        options: {
          bundleOptions: {
            'standalone': 'fs',
            // 'debug': true
          }
        }
      },
      dist: {
        files: {
          './dist/fs.js': ['./src/api.js'],
        },
        options: {
          bundleOptions: {
            'standalone': 'fs'
          }
        }
      }
    },

    cordovacli: {
      options: {
        path: './cordova/'
      },
      build_ios: {
        options: {
          command: 'build',
          platforms: ['ios']
        }
      },
      build_android: {
        options: {
          command: 'build',
          platforms: ['android']
        }
      },
      emulate_android: {
        options: {
          command: 'emulate',
          platforms: ['android']
        }
      },
      emulate_ios: {
        options: {
          command: 'emulate',
          platforms: ['ios']
        }
      }
    }
  });

  // Code quality
  grunt.registerTask('lint', [
    'shell:linelint',
    'jshint',
    'lintspaces:javascript'
    ]);

  // Browser tests
  grunt.registerTask('test', [
    'lint',
    'browserify:test',
    'karma:browsers'
    ]);

  // Cordova application emulation
  grunt.registerTask('test-android', [
    'browserify:test',
    'cordovacli:build_android',
    'cordovacli:emulate_android'
    ]);

  grunt.registerTask('test-ios', [
    'browserify:test',
    'cordovacli:build_ios',
    'cordovacli:emulate_ios'
    ]);

  // Building the library
  grunt.registerTask('build', ['lint', 'browserify:dist', 'uglify:mangle']);
};
