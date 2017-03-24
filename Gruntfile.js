/**
 * Gruntfile.js
 */

'use strict';

/* globals module */
/* eslint quote-props: ["error", "consistent"] */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint func-style: ["error", "declaration", { "allowArrowFunctions": true }] */
/* eslint-env es6 */

module.exports = (grunt) => {
    // configure project
    grunt.initConfig({
        // make node configurations available
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            gruntfile: {
                files: [ 'Gruntfile.js' ],
                tasks: [ 'eslint:gruntfile' ],
                options: {
                    reload: true,
                }
            },
            loader: {
                files: [ 'scripts/loader-src.js' ],
                tasks: [
                    'eslint:loader',
                    'closurecompiler:loaderDebug',
                    'jsdoc'
                ],
                options: {
                    spawn: false,
                }
            }
        },
        eslint: {
            options: {
                configFile: 'eslintrc.js'
            },
            gruntfile: [ 'Gruntfile.js' ],
            loader: [ 'scripts/loader-src.js' ]
        },
        closurecompiler: {
            loaderDebug: {
                files: {
                    'debug/loader-min.js': [ 'scripts/loader-src.js' ],
                },
                options: {
                    // 'compilation_level': 'WHITESPACE_ONLY',
                    // 'compilation_level': 'SIMPLE_OPTIMIZATIONS',
                    'compilation_level': 'ADVANCED_OPTIMIZATIONS',
                    'language_in': 'ECMASCRIPT6',
                    'language_out': 'ECMASCRIPT5',
                    'externs': 'scripts/externs.js',
                    'define': 'info=true',
                    'formatting': 'PRETTY_PRINT'
                }
            },
            loaderRelease: {
                files: {
                    'release/loader-min.js': [ 'scripts/loader-src.js' ],
                },
                options: {
                    // 'compilation_level': 'WHITESPACE_ONLY',
                    // 'compilation_level': 'SIMPLE_OPTIMIZATIONS',
                    'compilation_level': 'ADVANCED_OPTIMIZATIONS',
                    'language_in': 'ECMASCRIPT6',
                    'language_out': 'ECMASCRIPT3',
                    'externs': 'scripts/externs.js',
                    'define': 'info=false',
                    'formatting': 'SINGLE_QUOTES'
                    // 'formatting': 'PRETTY_PRINT'
                }
            }
        },
        jsdoc : {
            dist : {
                src: [
                    'README.md',
                    'scripts/loader-src.js',
                ],
                jsdoc: 'node_modules/.bin/jsdoc',
                options: {
                    destination: 'doc',
                    configure: 'jsdocrc.json',
                    template: 'node_modules/jsdoc-oblivion/template'
                }
            }
        },
        copy: {
            jsdocCss: {
                src: 'styles/site.oblivion.css',
                dest: 'doc/styles/site.oblivion.css',
            }
        }
    });

    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-closurecompiler');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', [ 'eslint', 'closurecompiler:loaderRelease', 'jsdoccss' ]);
    grunt.registerTask('debug', [ 'eslint', 'closurecompiler:loaderDebug', 'jsdoccss' ]);
    grunt.registerTask('release', [ 'eslint', 'closurecompiler:loaderRelease', 'jsdoccss' ]);
    grunt.registerTask('jsdoccss', [ 'jsdoc', 'copy:jsdocCss' ]);
};
