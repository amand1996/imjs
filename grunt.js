module.exports = function (grunt) {
  'use strict';

  var banner = '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
               '<%= grunt.template.today("yyyy-mm-dd") %> */'

  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: { banner: banner },
    concat: {
      latest: {
        src: '<json:build-order.json>',
        dest: 'js/im.js'
      },
      "in-version-dir": {
        src: '<json:build-order.json>',
        dest: 'js/<%= pkg.version %>/im.js'
      }
    },
    min: {
      latest: {
        src: 'js/im.js',
        dest: 'js/im.min.js'
      },
      version: {
        src: 'js/<%= pkg.version %>/im.js',
        dest: 'js/<%= pkg.version %>/im.min.js'
      }
    },
    lint: {
      tests: ['test/qunit/t/*.js'],
      grunt: ['tasks/*.js', 'grunt.js']
    },
    coffeelint: {
      source: ['src/*.coffee'],
      mocha: ['test/mocha/*.coffee']
    },
    compile: {
      source: {
        src: 'src/*',
        dest: 'build'
      }
    },
    coffeelintOptions: '<json:coffeelint.json>',
    jshint: {
      // Follow github's style guidelines and Crockford's where those are not sufficient
      // * https://github.com/styleguide/javascript
      // * http://javascript.crockford.com/code.html
      options: {
        laxcomma: true,
        asi: true,
        curly: true,
        maxparams: 5
      },
      grunt: {
        options: {
          asi: true,
          curly: true,
          maxparams: 5,
          indent: 2,
          node: true
        }
      },
      tests: {
        options: {
          asi: true,
          curly: true,
          maxparams: 5,
          indent: 2,
          browser: true,
          devel: true,
          jquery: true
        },
        globals: {
          TestCase: true,
          _: true,
          test: true,
          asyncTest: true,
          start: true,
          ok: true,
          equal: true,
          notEqual: true,
          module: true,
          deepEqual: true,
          intermine: true
        }
      }
    },
    qunit: { index: ['test/qunit/build/*-qunit.html'] },
    buildqunit: {
      unified: false,
      template: "test/qunit/templates/index.html",
      dest: "test/qunit/build/<%= idx %>-<%= file %>-qunit.html",
      tests: ["test/qunit/t/*.js"],
      setup: ["test/qunit/t/index.js"],
      tested: ["js/im.js"]
    },
    clean: {
      qunit: 'test/qunit/build',
      build: 'build'
    },
    simplemocha: {
      all: {
        src: 'test/mocha/*.coffee',
        options: '<json:mocha-opts.json>'
      }
    }
  })

  grunt.loadNpmTasks('grunt-coffeelint')
  grunt.loadNpmTasks('grunt-simple-mocha')
  grunt.loadNpmTasks('grunt-clean')
  grunt.loadTasks('tasks')

  grunt.registerTask('-load-test-globals', function () {
    global.should = require('should')
  })

  grunt.registerTask('docs', 'Generate API documentation', function () {
    var done = this.async();
    var cmd = 'codo';
    var args = ['-n', 'imjs', 'src'];
    var child = require('child_process').spawn(cmd, args, {stdio: 'inherit'});
    child.on('exit', function (code) {
      done(code === 0);
    });
  });

  grunt.registerTask('test-node', 'Run tests in the nodejs VM', function () {
    var grep = grunt.option('grep');
    var reporter = grunt.option('reporter');
    if (grep) {
      grunt.config('simplemocha.all.options.grep', grep);
    }
    if (reporter) {
      grunt.config('simplemocha.all.options.reporter', reporter);
    }
    grunt.task.run('simplemocha:all');
  });

  grunt.registerTask('build', 'clean:build compile concat min')
  grunt.registerTask('test-browser', 'build clean:qunit buildqunit qunit')
  grunt.registerTask('-test-node', 'build -load-test-globals simplemocha:all')
  grunt.registerTask('justtest', 'build -load-test-globals -testglob');
  grunt.registerTask('default', 'lint coffeelint test-node')

}
