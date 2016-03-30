module.exports = function (grunt) {
    require("time-grunt")(grunt);

    var today = (function(){
        var zeroPad = function(num, places) {
            var zero = places - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join("0") + num;
        };

        var todayArr = [],
            todayRaw = new Date();
        todayArr.push(todayRaw.getFullYear());
        todayArr.push(todayRaw.getMonth()+1);
        todayArr.push(todayRaw.getDate());
        todayArr.push(zeroPad(todayRaw.getHours(), 2) + "." + zeroPad(todayRaw.getMinutes(), 2));
        return todayArr.join("-");
    })(),
        output = grunt.option('output') || 'www/app',
        svncommitNum = grunt.option('svnrev') || today;

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        requirejs: {
            options: {
                mainConfigFile : "src/ui/scripts/main.js",
                baseUrl : "./src/ui/scripts",
                name: "main",
                dir: output + "/ui/scripts",
                removeCombined: true,
                // findNestedDependencies: true,
                paths: {
                    "addthis":      "empty:",
                    "youtube":      "empty:",
                    "limelight":    "empty:"
                },
                logLevel: 0,
                waitSeconds: 15,
                optimize: "none"
            },
            prod: {
                options: {
                    optimize: "uglify"
                    //, uglify: {
                    //    //beautify: true ,
                    //    no_mangle: true
                    //}
                    , preserveLicenseComments: false
                }
            }
        },

        less: {
            /*
             http://stackoverflow.com/questions/21743160/how-to-configure-sourcemaps-for-less-using-grunt

             Compression notes:
             cleancss: true = will remove sourceMappingURL comment from main.css
             yuicompress: true = will NOT remove sourceMappingURL comment from main.css
             */
            options: {
                paths: ["src/ui/less"],
                compress: true,
                yuicompress: true,
                optimization: 2
                // , cleancss: false // if true, removes src map info from file
                , sourceMap: true
                , sourceMapFilename: 'src/ui/css/styles.css.map' // where file is generated and located
                , sourceMapURL: 'styles.css.map' // the complete url and filename put in the compiled css file
                , outputSourceFiles: true
            },
            dev: {
                files: {
                    "src/ui/css/styles.css": "src/ui/less/styles.less"
                }
            },
            prod: {
                files: {
                    "src/ui/css/styles.css": "src/ui/less/styles.less"
                }
            }
        },

        jshint: {
            options: {
                browser: true,
                devel: true,
                noempty: true,
                plusplus: false,
                supernew: true,
                unused: false,
                evil: false,
                bitwise:true,
                freeze:false,
                laxcomma: true,
                nomen: true,
                debug: true,
                expr: true,
                newcap: true,
                validthis: true,

                globals: {
                    log: true,
                    define: true,
                    TheHartford: true
                }
            },
            dev: {
                src: ["src/ui/scripts/**/*.js", "!src/ui/scripts/libs/**/*.js"]
            }
        },

        jslint: {
            dev: {
                src: ["src/ui/scripts/**/*.js", "!src/ui/scripts/libs/**/*.js"],
                options: {
                    edition: "latest",
                    errorsOnly: false
                },
                directives: {
                    browser: true,
                    devel: true,
                    evil: true,
                    nomen: true,
                    plusplus: true,
                    regexp: true,
                    unparam: true,
                    vars: true,
                    white: true,
                    globals: {
                        require: true,
                        define: true,
                        log: true,
                        Modernizr: true,
                        HIG: true
                    }
                }
            }
        },

        copy: {
            dev: {
                files: [
                    {expand: true, flatten: true, src: ['src/ui/vendor/requirejs/require.js'], dest: 'src/ui/scripts/libs', filter: 'isFile'}
                ]
            },
            main: {
                files: [
                    {expand: true, flatten: true, src: ['src/ui/css/**'], dest: output + '/ui/css', filter: 'isFile'}
                    //, {expand: true, flatten: true, src: ['src/ui/videos/*'], dest: output + '/ui/videos', filter: 'isFile'}
                    //, {expand: true, flatten: true, src: ['src/ui/fonts/*'], dest: output + '/ui/fonts', filter: 'isFile'}
                    , {expand: true, flatten: true, src: ['src/*.html'], dest: output + '/', filter: 'isFile'}
                    , {expand: true, flatten: true, src: ['*.ico'], dest: output + '/', filter: 'isFile'}
                    , {expand: true, flatten: true, src: ['README.txt'], dest: output + '/', filter: 'isFile'}
                ]
            }
        },

        imagemin: {
            default: {                         // Another target
                files: [{
                    expand: true,                       // Enable dynamic expansion
                    cwd: 'src/ui/images',               // Src matches are relative to this path
                    src: ['**/*.{jpg,png,gif,svg}'],    // Actual patterns to match
                    dest: output + '/ui/images'              // Destination path prefix
                }]
            }
        },

        clean: {
            default: [
                output + "/index.html",
                output + "/ui/css",
                output + "/ui/images",
                output + "/ui/scripts"
            ]
        },

        codekit: {
            dev: {
                src: ['src/kitfiles_src/*.kit'],
                dest: 'src'
            }
        },

        replace: {
            blanklines: {
                src: ['src/*.html'],             // source files array (supports minimatch)
                overwrite: true,
                // dest: 'src/',             // destination directory or file, if not using overwrite: true
                replacements: [
                    {
                        from: /[\r\n]{2,}/, // removes beginning empty lines (add 'gm' to end to remove ALL blank lines)
                        to: ''
                    }
                ]
            },
            searchstring: {
                src: ['src/*.html'],
                overwrite: true,
                replacements: [{
                    from: /@@robots@@/gm,
                    to: (output === 'dist') ? "none" : "all"
                },{
                    from: /@@BuildDate@@/gm,
                    to: today
                },{
                    from: /@@SvnNum@@/gm,
                    to: svncommitNum
                }]
            }
        },

        watch: {
            options: {
                livereload: false
            },
            css: {
                files: ["src/ui/less/**/*.less", "!src/ui/css/**/*.css", "!src/ui/css/styles.css", "!src/ui/css/styles.css.map"],
                tasks: ["less:dev", "bless"],
                options: {}
            },
            kit: {
                files: ['src/kitfiles_src/**/*.kit'],
                tasks: ['codekit:dev', "replace", "replaceWithFilename"]
            },
            js: {
                files: ['src/ui/scripts/**/*.js', '!src/ui/scripts/libs/**/*.js'],
                tasks: ["jshint:dev", "jslint:dev"]
            },
            html: {
                files: ['src/kitfiles_src/**'],
                tasks: ["codekit:dev"]
            }
        },

        cacheBust: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 5,
                ignorePatterns:['modernizr', 'oo_style'],
                enableUrlFragmentHint: true,
                filters: {
                    'script' : [
                        function() { return this.attribs['data-main']; }, // for requirejs mains.js
                        function() { return this.attribs['src']; }     // keep default 'src' mapper
                    ],
                    'link[rel="stylesheet"]' : function() { return this.attribs['href']; },
                    'img' : function() { return this.attribs['src']; },
                    'link[rel="icon"], link[rel="shortcut icon"]' : function() { return this.attribs['href']; }
                }
            },
            dev: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['*.html']
                }]
            },
            prod: {
                files: [{
                    expand: true,
                    cwd: output,
                    src: ['*.html']
                }]
            }
        },

        // gzip assets 1-to-1 for production
        compress: {
            main: {
                options: {
                    pretty: true,
                    mode: 'zip',
                    archive: "<%= pkg.name %>-" + output + "-" + today + '.zip'
                },
                expand: true,
                cwd: output + '/',
                src: ['**/*'],
                dest: '/'
            }
        },

        replaceWithFilename: {
            dev: {
                src: ['src/*.html'],
                dest: '/'
            }
        },

        rename: {
            moveThis: {
                src: '*.zip',
                dest: 'deliveries/'
            }
        }
    });

    grunt.registerMultiTask('replaceWithFilename', 'gets file name and find/replaces it', function () {

        var path = require('path')
            , count = 0
            , gtr = require('./node_modules/grunt-text-replace/lib/grunt-text-replace');

        var async = require('async')
            , done = this.async();

        async.each(this.files, function(fileGlob, nextGlob) {
            var destination = fileGlob.dest;

            async.each(fileGlob.src, function(filepath, nextFile) {

                if (grunt.file.exists(filepath)) {
                    if (filepath.match(/\.(html)$/)) {

                        grunt.log.writeln('Putting filename "' + path.basename(filepath) + '" into ' + filepath);

                        gtr.replace({
                            src: filepath,
                            overwrite: true,
                            replacements: [{
                                from: /@@Filename@@/gm,
                                to: path.basename(filepath)
                            }]
                        });

                        count++;

                    } else {
                        nextFile("No handler for filetype: " + filepath);
                        grunt.log.error("No handler for filetype: " + filepath);
                    }
                }

            }, function() {
                // When we are done with all files in this glob
                // continue to the next glob
                nextGlob();
            });
        }, function() {
            // When we are done with all globs
            // call done to tell the Grunt task we are done
            done();
        });
        done();
        grunt.log.ok("Compiled " + count + " files.");
    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


    grunt.registerTask("default", [
        "copy:dev",
        "less:dev",
        "jshint:dev",
        "jslint:dev",
        "codekit:dev",
        "replace",
        "replaceWithFilename"]);

    var buildTasks = [
        "clean",
        "copy:dev",
        "jshint:dev",
        "jslint:dev",
        "codekit:dev",
        "replace",
        "replaceWithFilename",
        "imagemin:default",
        "less:prod",
        "requirejs",
        "copy:main"];

    grunt.registerTask("server", buildTasks);
    grunt.registerTask("dist", buildTasks);

    grunt.registerTask("package", (function(){
        var newList = buildTasks.slice(0);
        newList.push("compress");
        newList.push("rename");
        return newList;
    })());

};

