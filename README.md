jasmine-xml2html-converter
=================================

A node module to convert jasmine/junit generated xml reports into formatted html reports. A structured report including an overview page
and an individual browser report page is generated. A navigation select button is generated to allow quick and easy navigation between
each page. If the user includes screenshot directories for the Overview page and/or one or more of the browser reports then a button - 
'Failed Test Screenshots' is added to the respective pages. The user can also choose whether or not to include all generated spec reports
on the overview page. 

The ooverview page contains a summary chart of each set of tests added to the report - i.e. one bar per browser report. This illustrates
an overview of the tests run, passed, failed or skipped for each browser. A summary table to the left hand side of the chart depicts the
date the reprt was generated, the total number of tests run, pass rate and total amount of execution time. 

Each browser page contains a similar layout to the overview page. Each specs describe block adds its own report bar to the bar chart and
the test starting time is in place of where the 'Report Created' attribute would be on the overview page. All test resutls are added in
a table (or set of tables) below the select button (and Failed Test Screenshots button).

repo : https://github.com/AntoGo289/jasmine-xml2html-converter

How to use
----------------------------------
* Creating the html report

  			var HTMLReport = require('jasmine-xml2html-converter');
        var fs = require('fs');
        var fse = require('fs-extra');
        var path = require('path');
        var moment = require('moment');

        // Used to get todays date and time nicely formatted.
        function getDateString() {
            return moment().format('DD/MM/YYYY HH:mm');
        }

        // Use this (or an altered version of this) to generate file path array for each browser being added to the report
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

    		// Create config for report
    		var config = {
            overviewTitle: 'Overview - Test Results - ' + getDateString(),
            baseOutputPath: path.join(__dirname, '/results'),
            overviewScreenshotsDir: 'Path/To/Screenshots/Directory/For/Overview',
            includeSpecsInOverview: true, // Sets whether or not to include all spec report tables in overview page
            //userDefinedDirs: null, // Not needed yet
            browsersConfig: [{
                reportTitle: 'Chrome - ' + getDateString(),
                browserName: 'Chrome-v53.0', // Used for folders etc (This can be as specific as required)
                specFiles: createFilePaths('Path/To/JUnit/Files/Directory'), // Send array of absolute paths to files from chrome/other folder
                screenshotsDir: 'Path/To/Screenshots/Directory/For/This/Browser',
                //userDefinedDirs: null // Not needed yet
            }, {
                reportTitle: 'Safari - ' + getDateString(),
                browserName: 'Safari-v9.1', // Used for folders etc (This can be as specific as required)
                specFiles: createFilePaths('Path/To/JUnit/Files/Directory'), // Send array of absolute paths to files from safari/other folder
                screenshotsDir: 'Path/To/Screenshots/Directory/For/This/Browser',
                //userDefinedDirs: null // Not needed yet
            }] // Note that you can add as many browsers as required here
        };
        
        // Generate the report 
    		new HTMLReport().from(config);

##################################################################################
## TODO : Check that this works with protractor conf.js
##################################################################################

* Using with protractor conf.js file

        // A callback function called once tests are finished.
        onComplete: function() {
          var path = require("path");
          var browserName, browserVersion;
          var reportPath = path.join(__dirname, '..', '/test_out/e2e/');
          var capsPromise = browser.getCapabilities();
          capsPromise.then(function (caps) {
          browserName = caps.caps_.browserName.toLowerCase();
          browserName = browserName.replace(/ /g,"-");
          browserVersion = caps.caps_.version;
          return null;
        });
        
        var HTMLReport = require('jasmine-xml2html-converter');
        reportPath += browserName;

        // Call custom report for html output
        testConfig = {
          reportTitle: 'Test Execution Report',
          outputPath: reportPath,
          seleniumServer: browser.seleniumAddress,
          applicationUrl: browser.baseUrl,
          testBrowser: browserName + ' ' + browserVersion
        };
        new HTMLReport().from(reportPath + '/junitresults.xml', testConfig);
      }

Test config object
----------------------------------
* Defaults : testConfig = {} 
* To override reportTitle & outputPath of the output html file : testConfig = { reportTitle: 'Test Execution Report', outputPath: './test-out' }
* To add data to the report summary of the output html file: testConfig = { Browser: IE }

Sample html report
----------------------------------
![Alt text](https://raw.githubusercontent.com/AntoGo289/jasmine-xml2html-converter/master/sample_test_report.png?raw=true)

