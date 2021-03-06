jasmine-html-report-builder
=================================

A node module to convert jasmine/junit generated xml reports into formatted html reports. A structured report including an overview page
and an individual browser report page (per specified browser) will be generated. A navigation select button is generated to allow quick and easy navigation between
each page. If the user includes screenshot directories for the Overview page and/or one or more of the browser reports then a button - 
'Failed Test Screenshots' is added to the respective pages. The user can also choose whether or not to include all generated spec reports
on the overview page. 

The overview page contains a summary chart of each set of tests added to the report - i.e. one bar per browser report. This illustrates
an overview of the tests run, passed, failed or skipped for each browser. A summary table to the left hand side of the chart depicts the
date the report was generated, the total number of tests run, pass rate and total amount of execution time. 

Each browser page contains a similar layout to the overview page. Each specs describe block adds its own report bar to the bar chart and
the test starting time is in place of where the 'Report Created' attribute would be on the overview page. All test results are added in
a table (or set of tables) below the report button/link bar.

The config allows the user to add custom buttons/links to user specified content on a per page basis - the content can also be copied into the report directly through the config for each page or simply create a link to where the content will be placed at a later time (by some other user defined process). 

repo : https://github.com/AntoGo289/jasmine-xml2html-converter

How to Use
----------------------------------
* Creating the html report
````Javascript
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
          force: false, // Sets wheter or nor to force build to continue when a failure occurs on file/directory operations
          addSummaryDetails: [{
            tag: 'Testing Application: ',
            value: 'Super Awesome App'
          },
          {
            tag: 'Test Generated By:',
            value: 'Tim Timmington'
          }], // The above 'addSummaryDetails' adds info defined here to the summary for the overview page
          // Add directories with content to navigate to with userDefinedButtons
          userDefinedDirs: [{ src: '/Some/Directory', target: '/Target/Directory/ (optional)' }, { src: '/Other/Directory', target: '...' }], 
          // Note the onClickLocation is the 'Directory' name of the imported directory - if target is specied then you must input the target
          // for the onClickLocation (this is the same for browser added buttons in the below config)
          userDefinedButtons: [{ onClickLocation: 'Directory', buttonText: 'Text on Button'}],
          browsersConfig: [{
              reportTitle: 'Chrome - ' + getDateString(),
              browserName: 'Chrome-v53.0', // Used for folders etc (This can be as specific as required)
              specFiles: createFilePaths('Path/To/JUnit/Files/Directory'), // Send array of absolute paths to files from chrome/other folder
              screenshotsDir: 'Path/To/Screenshots/Directory/For/This/Browser',
              addSummaryDetails: [{
                tag: 'Testing Application: ',
                value: 'Super Awesome App'
              },
              {
                tag: 'Test Generated By:',
                value: 'Tim Timmington'
              }], // // The above 'addSummaryDetails' adds info defined here to the summary for the browser page
              userDefinedDirs: [{ src: '/Some/Directory', target: '/Target/Directory/ (optional)' }, { src: '/Other/Directory', target: '...' }], 
              userDefinedButtons: [{ onClickLocation: 'Directory', buttonText: 'Text on Button'}]
          }, {
              reportTitle: 'Safari - ' + getDateString(),
              browserName: 'Safari-v9.1', // Used for folders etc (This can be as specific as required)
              specFiles: createFilePaths('Path/To/JUnit/Files/Directory'), // Send array of absolute paths to files from safari/other folder
              screenshotsDir: 'Path/To/Screenshots/Directory/For/This/Browser',
              addSummaryDetails: [{
                tag: 'Testing Application: ',
                value: 'Super Awesome App'
              },
              {
                tag: 'Test Generated By:',
                value: 'Tim Timmington'
              }], // Adds info defined here to the summary for the browser page
              userDefinedDirs: [{ src: '/Some/Directory', target: '/Target/Directory/ (optional)' }, { src: '/Other/Directory', target: '...' }], 
              userDefinedButtons: [{ onClickLocation: 'Directory', buttonText: 'Text on Button'}]
          }] // Note that you can add as many browsers as required here
      };
      
      // Generate the report 
      new HTMLReport().from(config);
````
Test Config Object
----------------------------------
````Javascript
  var config = {
      overviewTitle: 'Overview - Test Results - ' + getDateString(),
      baseOutputPath: path.join(__dirname, '/results'),
      overviewScreenshotsDir: 'Path/To/Screenshots/Directory/For/Overview',
      includeSpecsInOverview: true, // Sets whether or not to include all spec report tables in overview page
      addSummaryDetails: [{ // Adds info defined here to the summary for the overview page
        tag: 'Testing Application: ',
        value: 'Super Awesome App'
      },
      {
        tag: 'Test Generated By:',
        value: 'Tim Timmington'
      }], 
      //userDefinedDirs: null, // Not needed yet
      browsersConfig: [{
          reportTitle: 'Chrome - ' + getDateString(),
          browserName: 'Chrome-v53.0', // Used for folders etc (This can be as specific as required)
          specFiles: createFilePaths('Path/To/JUnit/Files/Directory'), // Send array of absolute paths to files from chrome/other folder
          screenshotsDir: 'Path/To/Screenshots/Directory/For/This/Browser',
          addSummaryDetails: [{ // Adds info defined here to the summary for the browser page
            tag: 'Testing Application: ',
            value: 'Super Awesome App'
          },
          {
            tag: 'Test Generated By:',
            value: 'Tim Timmington'
          }],
          //userDefinedDirs: null // Not needed yet
      }, {
          reportTitle: 'Safari - ' + getDateString(),
          browserName: 'Safari-v9.1', // Used for folders etc (This can be as specific as required)
          specFiles: createFilePaths('Path/To/JUnit/Files/Directory'), // Send array of absolute paths to files from safari/other folder
          screenshotsDir: 'Path/To/Screenshots/Directory/For/This/Browser',
          addSummaryDetails: [{ // Adds info defined here to the summary for the browser page
            tag: 'Testing Application: ',
            value: 'Super Awesome App'
          },
          {
            tag: 'Test Generated By:',
            value: 'Tim Timmington'
          }], 
          //userDefinedDirs: null // Not needed yet
      }] // Note that you can add as many browsers as required here
  };
  ````
