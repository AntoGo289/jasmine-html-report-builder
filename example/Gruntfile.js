'use strict';

var HTMLReport = require('../lib/jasmine-xml2html-converter');
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var moment = require('moment');

function createFilePaths(target) {
    if (!fs.existsSync(target)) {
        console.log('Target junit directory does not exist: ' + __dirname + '/' + target);
        return [];
    }
    var files = fs.readdirSync(target);
    var filePaths = [];
    for (var i = 0; i < files.length; i++) {
        //var filePath = path.join(__dirname, '/', target, '/', files[i]); // Used to specify just files in dir
        var filePath = path.join(target, '/', files[i]);
        filePaths.push(filePath);
    }
    return filePaths;
}

function getDateString() {
    return moment().format('DD/MM/YYYY HH:mm');
}

module.exports = function(grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.registerTask('genReport', function() {
        // Define fileSets for junit tests
        var fileSets = ['/Users/Anto/Documents/testOutput/result/junitFiles/chrome', '/Users/Anto/Documents/testOutput/result/junitFiles/safari'];
        var screenshotsDirs = ['/Users/Anto/Documents/testOutput/screenshots', '/Users/Anto/Documents/testOutput/screenshots/chrome', '/Users/Anto/Documents/testOutput/screenshots/safari'];

        var config = {
            overviewTitle: 'Overview - Test Results - ' + getDateString(),
            baseOutputPath: path.join(__dirname, '/results'),
            overviewScreenshotsDir: screenshotsDirs[0],
            includeSpecsInOverview: true,
            //userDefinedDirs: null, // Not needed yet
            browsersConfig: [{
                reportTitle: 'Chrome - ' + getDateString(),
                browserName: 'Chrome-v53.0', // Used for folders etc
                specFiles: createFilePaths(fileSets[0]), // Send array of absolute paths to files from chrome folder
                screenshotsDir: screenshotsDirs[1],
                //userDefinedDirs: null
            }, {
                reportTitle: 'Safari - ' + getDateString(),
                browserName: 'Safari-v9.1', // Used for folders etc
                specFiles: createFilePaths(fileSets[1]), // Send array of absolute paths to files from chrome folder
                screenshotsDir: screenshotsDirs[2],
                //userDefinedDirs: null
            }]
        }

        // Generate report with this config
        new HTMLReport().from(config);
    });

    grunt.registerTask('clean', function() {
        var oldResults = path.join(__dirname, 'results');
        if (fs.existsSync(oldResults)) {
            try {
                fse.emptyDirSync(oldResults);
            } catch (err) {
                console.log('Error enptying old results directory');
                throw err;
            }

            try {
                fse.rmdirSync(oldResults);
            } catch (err) {
                console.log('Failed to delete old result directory');
                throw err;
            }
        }
    });

    grunt.registerTask('newResults', ['clean', 'genReport']);
    grunt.registerTask('default', ['newResults']);
};