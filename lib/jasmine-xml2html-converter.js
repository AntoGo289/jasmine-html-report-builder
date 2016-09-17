// @protractor-helper-template

// @imports
var xmlDocument = require('xmldoc');
var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');

// @class
var HTMLReport = function() {
    // Global config
    var config = null;

    // html report file headers
    var reportTitle = '<title>Protractor Test Report</title>';
    var reportCss = '<style> #td-table, tr, td { \
    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; \
    width: 95%; \
    text-align: left; \
    border-collapse: collapse; \
    font-size: small; \
    border: 1px solid #000000; \
    padding: 9px; \
    background-color: #CFD8DC; \
    margin: 10px auto; \
  } \
  #td-table-header { \
    font-size: 1em; \
    border: 1px solid #000000; \
    padding: 9px; \
    background-color: #607D8B; \
    color: white;\
  } \
  #td-table-spec { \
    background-color: #90A4AE; \
    color: black; \
  } \
  #td-table-test-pass { \
    background-color: #009688; \
    color: white; \
  } \
  #td-table-test-fail { \
    background-color: #F7464A; \
    color: white; \
  } \
  #td-table-test-skip { \
    background-color: #FFEB3B; \
    color: black; \
  } \
  #ts-table, #tr-ts-table, #td-ts-table { \
    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; \
    width: 95%; \
    text-align: left; \
    font-size: small; \
    border: none; \
    padding: 9px; \
    margin: 10px auto; \
    background-color: white \
  } \
  #div-ts-table { \
    text-align: center; \
    outline: thin solid; \
    padding: 9px; \
    background: #CFD8DC; \
    font-size: medium; \
  } \
  #stacked-bar-chart { \
    width: 800px; \
    height: 300px; \
  } \
  li { \
    padding-top:0px; \
    list-style-type: none; \
    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; \
    font-size: small; \
    padding: 7px; \
  } \
  select { \
     -webkit-appearance: none; \
     text-align: centre; \
     vertical-align: middle; \
     padding: 0px; \
  } \
  .buttonScreenshots { \
     border: none; \
     display: inline-block; \
     text-align: center; \
     padding: 4px 8px; \
     background-color: #F7464A; \
     border-radius: 8px; \
     border: 1px solid black; \
     transition: all 0.5s; \
     cursor: pointer; \
     margin-left: 38px; \
     float: left; \
     margin-bottom: 3px; \
     font-size: 16px; \
  } \
  .buttonRESTAPI { \
     border: none; \
     display: inline-block; \
     text-align: center; \
     padding: 4px 8px; \
     background-color: #008CBA; \
     border-radius: 8px; \
     border: 1px solid black; \
     transition: all 0.5s; \
     cursor: pointer; \
     margin-right: 38px; \
     margin-bottom: 3px; \
     float: right; \
     font-size: 16px; \
  } \
  .buttonUnitTestsReport {  \
     border: none; \
     display: inline-block; \
     text-align: center; \
     padding: 4px 8px; \
     background-color: #ff9933; \
     border-radius: 8px; \
     border: 1px solid black; \
     transition: all 0.5s; \
     cursor: pointer; \
     margin-right: 8px; \
     margin-bottom: 3px; \
     float: right; \
     font-size: 16px; \
  } \
  .buttonUnitTestsCoverage {  \
     border: none; \
     display: inline-block; \
     text-align: center; \
     padding: 4px 8px; \
     background-color: #9999ff; \
     border-radius: 8px; \
     border: 1px solid black; \
     transition: all 0.5s; \
     cursor: pointer; \
     margin-right: 8px; \
     margin-bottom: 3px; \
     float: right; \
     font-size: 16px; \
  } \
  .downloadHyperlink { \
    margin-left: 38px; \
    margin-top: 3px; \
  } \
  \
  .pageSelect { \
     border: none; \
     display: inline-block; \
     text-align: center; \
     padding: 4px 8px; \
     background-color: #4CAF50; \
     border-radius: 8px; \
     border: 1px solid black; \
     transition: all 0.5s; \
     cursor: pointer; \
     margin-left: 8px; \
     margin-bottom: 3px; \
     float: left; \
     font-size: 16px; \
  } \
  \
</style>'

    var reportScript = '<script type="text/javascript" src="https://www.google.com/jsapi"></script> \
  <script type="text/javascript"> \
    google.load("visualization", "1", {packages:["corechart"]}); \
    google.setOnLoadCallback(drawChart); \
    function drawChart() { \
      var data = google.visualization.arrayToDataTable([ \
        ["Genre", "Passed", "Failed", "Skipped"], <dataSeries>]); \
      var options = { \
        chartArea: {width: "50%"}, \
        height: 300, \
        legend: { position: "top", maxLines: 3 }, \
        bar: { groupWidth: "50%" }, \
        isStacked: true, \
        colors: [ "#009688", "#B71C1C", "#FFEB3B"] \
      }; \
    var chart = new google.visualization.BarChart(document.getElementById("stacked-bar-chart")); \
    chart.draw(data, options); \
    } \
  </script>';

    // @public-function
    this.from = function(newConfig) {
        // Set global config
        config = newConfig;

        // Complete pre-config for report
        preConfiguration();

        // Generate each individual browser report file
        for (var i = 0; i < config.browsersConfig.length; i++) {
            generateBrowserData(i);
            createBrowserPage(i);
        }

        // Generate overview page
        createOverviewPage();

        //Create status.txt file containing overview results#
        createStatusTextFile();
    }

    // Create the report structure and any attributes required are set here
    var preConfiguration = function() {
        // Make required base directory
        if (!fs.existsSync(config.baseOutputPath)) {
            try {
                fs.mkdirSync(config.baseOutputPath);
            } catch (err) {
                console.log('Failed to create base output path: ' + config.baseOutputPath);
                throw err;
            }
        }

        // Create user defined directories if any and copy over contents for overview page
        if (config.userDefinedDirs !== null) {
            copyDirs(config.userDefinedDirs, config.baseOutputPath);
        }

        // Setup for copying screenshots to their respective new directories
        var screenshots = null;
        if (config.overviewScreenshotsDir !== null) {
            screenshots = [{
                src: config.overviewScreenshotsDir,
                target: config.baseOutputPath + '/screenshots'
            }];
        }

        // Setup the select navigation here and create each browser directory as needed
        config.selectOptions = ['Overview'];
        for (var i = 0; i < config.browsersConfig.length; i++) {
            config.selectOptions.push(config.browsersConfig[i].browserName); // Add seleect options
            config.browsersConfig[i].browserOutputPath = path.join(config.baseOutputPath, '/', config.browsersConfig[i].browserName);
            if (!fs.existsSync()) { // Create each browser dir
                try {
                    fs.mkdirSync(config.browsersConfig[i].browserOutputPath);
                } catch (err) {
                    if (err.code !== 'EEXIST') {
                        throw err;
                    } else {
                        console.log('Directory already exists - continuing');
                    }
                }
            }
            if (config.browsersConfig[i].screenshotsDir !== null) {
                screenshots.push({
                    src: config.browsersConfig[i].screenshotsDir,
                    target: config.browsersConfig[i].browserOutputPath + '/screenshots'
                });
            }
            // Copy userDefinedDirs for each browser
            copyDirs(config.browsersConfig[i].userDefinedDirs, config.browsersConfig[i].browserOutputPath);
        }

        // Copy all screenshots dirs
        copyDirs(screenshots, config.baseOutputPath);

        // Inject any css and html defined by user
        // ### TODO
    }

    // Copies all contents from source in each (src - target) pair into target - if no target provided uses defaultTarget (baseOutputPath or browserOutputPath)
    var copyDirs = function(list, defaultTarget) {
        if (list === null) {
            console.log('Null list detected - returning');
            return;
        }
        for (var j = 0; j < list.length; j++) {
            if (list.target !== null) {
                try {
                    fs.mkdirSync(list[j].target);
                } catch (err) {
                    console.log('Failed to create target directory: ' + list[j].target);
                    if (err.code !== 'EEXIST') {
                        throw err;
                    } else {
                        console.log('Directory already exists - continuing');
                    }
                }
            } else {
                list[j].target = defaultTarget;
            }
            if (list[j].src !== null) {
                try {
                    fse.copySync(list[j].src, list[j].target);
                } catch (err) {
                    console.log('Failed to copy user defined directory to target location');
                    throw err;
                }
            }
        }
    }

    // Generate select html for given page
    var getSelectHTML = function(thisPageValue) {
        var locations = [
            './' // Overview
        ]

        for (var i = 0; i < config.browsersConfig; i++) {
            locations.push('./' + config.browsersConfig[i].browserName); // Add each browser to locations
        }

        if (thisPageValue !== 'Overview') { // Set relative paths
            for (var j = 0; j < locations.length; j++) {
                locations[j] = '.' + locations[j];
            }
        }

        var beginSelect = '<select id=pageSelect class="pageSelect" onChange="location.href=this.value">';
        var options = '';
        for (var k = 0; k < locations.length; k++) {
            options += '<option value=\"' + locations[k] + '\"';
            if (thisPageValue === locations[k]) {
                options += ' selected';
            }
            options += '>' + config.selectOptions[k] + '</option>';
        }
        var endSelect = '</select>'

        return beginSelect + options + endSelect;
    }

    var generateBrowserData = function(configBrowserLocation) {
        var thisConfig = config.browsersConfig[configBrowserLocation];
        var testDetails = '';

        if (thisConfig.specFiles instanceof Array) {
            for (var i = 0; i < reportXml.length; i++) {
                testDetails += generateResultTable(thisConfig.specFiles[i], configBrowserLocation);
            }
        } else {
            testDetails = generateResultTable(thisConfig.specFiles, configBrowserLocation);
        }
        // Set the testDetails for this browser
        thisConfig.testDetails = testDetails;
        // Append this data to overview testDetails if required by user
        config.testDetails += testDetails;
        // Create test summary table
        thisConfig.testSummary = generateTestSummaryTable(thisConfig);
        // Store values in config
        config.browsersConfig[configBrowserLocation] = thisConfig;
    }

    var generateResultTable = function(reportXml, browserConfigLocation) {
        var thisConfig = config.browsersConfig[browserConfigLocation];

        var testDetailsTable = '<tr><th id="td-table-header">' + thisConfig.browserName + ' - Spec Description</th> \
    <th id="td-table-header">Status</th> \
    <th id="td-table-header">Details</th></tr>';

        var xmlData = fs.readFileSync(reportXml, 'utf8');
        var testResultXml = new xmlDocument.XmlDocument(xmlData);
        var testSuites = testResultXml.childrenNamed('testsuite');
        var testStartedOn = testSuites[0].attr.timestamp;
        var totalSuites = testSuites.length;

        // Capture tessuite execution details   
        for (var i = 0; i < totalSuites; i++) {
            var suiteName = testSuites[i].attr.name;
            var suiteTestErrors = parseInt(testSuites[i].attr.errors);
            var suiteTotalTests = parseInt(testSuites[i].attr.tests);
            var suiteTestSkips = parseInt(testSuites[i].attr.skipped);
            var suiteTestFailures = 0;
            var tempTestCases = testSuites[i].childrenNamed('testcase');
            var numTestCases = tempTestCases.length;
            for (var y = 0; y < numTestCases; y++) {
                var failed = tempTestCases[y].childNamed('failure');
                if (failed) {
                    suiteTestFailures += 1;
                }
            }

            var suiteTestTime = parseFloat(testSuites[i].attr.time);
            var suitePassedTests = suiteTotalTests - suiteTestErrors - suiteTestSkips - suiteTestFailures;
            thisConfig.totalTests += suiteTotalTests;
            thisConfig.totalFailures += suiteTestFailures;
            thisConfig.totalPassed += suitePassedTests;
            thisConfig.totalErrors += suiteTestErrors;
            thisConfig.totalSkips += suiteTestSkips;
            thisConfig.totalExecTime += suiteTestTime;
            if (thisConfig.startTime === null || thisConfig.startTime === undefined) {
                thisConfig.startTime = testStartedOn;
            }

            if (thisConfig.dataSeries !== '' && thisConfig.dataSeries !== null) {
                this.config.dataSeries += ','; // Break for next part of dataseries if series already exists
            }
            // Capture data for stacked barchart
            thisConfig.dataSeries += '["' + suiteName + '",' + suitePassedTests + ',' + suiteTestFailures + ',';
            thisConfig.dataSeries += suiteTestSkips + ']';

            testDetailsTable += '<tr><td id="td-table-spec" colspan=3>' + suiteName + '</td></tr>';
            var testcases = testSuites[i].childrenNamed('testcase');

            // Capture tescase execution details for each testsuite
            for (var j in testcases) {
                testDetailsTable += '<tr><td>';

                var testFailed = testcases[j].childNamed('failure');
                var testSkipped = testcases[j].childNamed('skipped');
                if (testFailed) {
                    // testDetailsTable += '<a href="../screenshots">';
                    if (testConfig.screenshotsDir !== null) {
                        testDetailsTable += '<a href="' + thisConfig.screenshotsDir + '">';
                    }
                }

                testDetailsTable += testcases[j].attr.name;
                if (testFailed) {
                    if (testConfig.screenshotsDir !== null) {
                        testDetailsTable += '</a></td>';
                    } else {
                        testDetailsTable += '</td>';
                    }
                } else {
                    testDetailsTable += '</td>';
                }
                var testError = testcases[j].childNamed('error');
                if (testFailed) {
                    testDetailsTable += '<td id="td-table-test-fail">Failed</td><td>' + testFailed + '</td>';
                } else if (testSkipped) {
                    testDetailsTable += '<td id="td-table-test-skip">Skipped</td><td>' + testSkipped + '</td>';
                } else if (testError) {
                    testDetailsTable += '<td id="td-table-test-fail">Error</td><td>' + testError + '</td>';
                } else {
                    testDetailsTable += '<td id="td-table-test-pass">Passed</td><td></td>'
                }
                testDetailsTable += '</tr>';
            }
        }

        thisConfig.passRate = ((thisConfig.totalTests - thisConfig.totalFailures - thisConfig.totalSkips) / thisConfig.totalTests).toFixed(3);

        // Update browser config with new values
        config.browsersConfig[browserConfigLocation] = thisConfig;

        // Return the html for this report
        return testDetailsTable;
    }

    var generateTestSummaryTable = function(testConfig) {
        var testSummaryTable = '<tr id="tr-ts-table"><th colspan=2><div id="div-ts-table">';
        var testReportTitle = testConfig.overviewTitle === undefined ? (testConfig.reportTitle === undefined ? 'Test Execution Report' : testConfig.reportTitle) : testConfig.overviewTitle;
        testSummaryTable += testReportTitle + '</div></th></tr>';
        testSummaryTable += '<tr id="tr-ts-table"><td id="td-ts-table"><div>';
        testSummaryTable += '<li><b>Test Start:</b> ' + testConfig.startTime + '</li>';
        testSummaryTable += '<li><b>Total Tests:</b> ' + testConfig.totalTests + '</li>';
        testSummaryTable += '<li><b>Pass Rate:</b> ' + (testConfig.passRate * 100).toFixed(2) + '% </li>';
        testSummaryTable += '<li><b>Execution Duration:</b> ' + testConfig.totalExecTime + ' Secs</li>';
        testSummaryTable += '</ul></div></td><td id="td-ts-table" rowspan=6>';
        testSummaryTable += '<div id="stacked-bar-chart"></div></td></tr>';
        return testSummaryTable;
    }

    // Only used for overview to compile results
    var compileBarData = function() {
        var dataSeries = '';
        for (var i = 0; i < config.browsersConfig.length; i++) {
            dataSeries += i > 0 ? ',' : '';
            var passed = config.browsersConfig[i].totalPassed;
            var failed = config.browsersConfig[i].totalFailures;
            var skipped = config.browsersConfig[i].totalSkips;
            config.totalPassed += passed;
            config.totalFailures += failed;
            config.totalSkips += skips;
            dataSeries += '["' + config.browsersConfig[i].browserName + '",' + passed + ',' + failed + ',' + skips + ']';
        }
        config.dataSeries = dataSeries;
    }

    var createBrowserPage = function(browserConfigLocation) {
        var thisConfig = config.browsersConfig[browserConfigLocation];
        var htmlReportBody = generatePageButtons(thisConfig.browserName); // Generate browser page buttons
        var thisReportScript = reportScript.replace('<dataSeries>', thisConfig.dataSeries); // Create chart using data

        // Prepare for html file content
        var htmlReportHead = '<html><head>' + thisConfig.reportTitle + reportCss + thisReportScript + '</head>';
        var htmlReportSummary = '<body>' + '<table id="ts-table">' + thisConfig.testSummary + '</table>';
        htmlReportBody += '<table id="td-table">' + testConfig.testDetails + '</table></body></html>';

        // Combine html coponents
        var htmlReport = htmlReportHead + htmlReportSummary + htmlReportBody;

        // Prepare to write new .html file
        var outputPath = thisConfig.browserOutputPath !== null ? './' + thisConfig.browserName : thisConfig.browserOutputPath;
        if (!fs.existsSync(outputPath)) {
            try {
                fs.mkdirSync(outputPath);
            } catch (err) {
                if (err.code !== 'EEXIST') {
                    console.log('Failed to create output directory at overview creation: ' + outputPath);
                    throw err;
                }
            }
        }
        // Write report
        try {
            fs.writeFileSync(path.join(outputPath, '/index.html'), htmlReport);
        } catch (err) {
            console.log('Failed to write new .html file for browser page: ' + testConfig.browserName);
            throw err;
        }
    }

    var createOverviewPage = function() {
        var htmlReportBody = generatePageButtons('Overview'); // Generate overview page buttons
        compileBarData(); // Compile overview page summary chart data
        var thisReportScript = reportScript.replace('<dataSeries>', config.dataSeries); // Create chart using data
        config.testSummary = generateTestSummaryTable(config); // Generate summary table for overview page

        // Prepare for html file content
        var htmlReportHead = '<html><head>' + config.reportTitle + reportCss + thisReportScript + '</head>';
        var htmlReportSummary = '<body>' + '<table id="ts-table">' + config.testSummary + '</table>';

        if (config.includeSpecsInOverview) {
            htmlReportBody += '<table id="td-table">' + config.testDetails + '</table>';
        }
        htmlReportBody += '</body></html>';
        // Combine html coponents
        var htmlReport = htmlReportHead + htmlReportSummary + htmlReportBody;
        // Prepare to write new .html file
        var outputPath = config.baseOutputPath !== null ? './default_output' : config.baseOutputPath;

        if (!fs.existsSync(outputPath)) {
            try {
                fs.mkdirSync(outputPath);
            } catch (err) {
                if (err.code !== 'EEXIST') {
                    console.log('Failed to create output directory at overview creation: ' + outputPath);
                    throw err;
                }
            }
        }

        // Write report
        try {
            fs.writeFileSync(path.join(outputPath, '/index.html'), htmlReport);
        } catch (err) {
            console.log('Failed to write new .html file for overview page');
            throw err;
        }
    }

    var generatePageButtons = function(pageType) {
        var html = getSelectHTML(pageType);

        if (pageType === 'Overview') {
            if (config.overviewScreenshotsDir !== null) {
                html += '<button type="button" class="buttonScreenshots" onClick="location.href=\'./screenshots\'">Failed Test Screenshots</button>';
            }
        } else {
            if (config.screenshotsDir !== null) {
                html += '<button type="button" class="buttonScreenshots" onClick="location.href=\'./screenshots\'">Failed Test Screenshots</button>';
            }
        }
        return html;
    }

    var createStatusTextFile = function() {
        var overviewStatus = 'Status: ';
        if (testExecInfo['totalFailures'] > 0 || testExecInfo['totalErrors'] > 0) {
            overviewStatus += 'FAILED: ';
        } else {
            overviewStatus += 'PASSED: ';
        }
        overviewStatus += 'Total Tests: ' + config.totalTests + ', Total Errors: ' + config.totalErrors + ', Total Skips: ' +
            config.totalSkips + ', Total Failures: ' + config.totalFailures + ', Total Executon Time: ' + config.totalExecTime;

        var fs = require('fs');
        var statusFile = path.join(config.baseOutputPath, '/status.txt');
        if (fs.existsSync(statusFile)) {
            try {
                fs.writeFileSync(statusFile, overviewStatus);
            } catch (err) {
                console.log('Failed to create status.txt file');
                throw err;
            }
        }
    }
};

// @exports
module.exports = HTMLReport;


/**
 * config = {
 *  overviewTitle: 'This is the overview Title',
 *  baseOutputPath: 'path/To/Output/To',
 *  overviewScreenshotsDir: 'path/To/Screenshots',
 *  // overviewCustomCSSFile: 'path/To/CustomCSSFile',
 *  // overviewAddHTMLTop: 'file containing html to inject in the top section of report',
 *  // overviewAddHTMLBottom: 'file containing html to inject in the bottom section of report',
 *  includeSpecsInOverview: 'include all specs in overview page boolean' true || false,
 *  overviewFileName: 'give the file a name - defaults to index.js if not specified',
 *  userDefinedDirs: 'A list of src - target dirs (array of objects) for user defined directories to include in overview. If target not specified - defaults to baseOutputPath',
 *  browsersConfig: {[
 *    {
 *      reportTitle: 'browser report title',
 *      browserName: 'name of the browser', // used for folders etc
 *      specFiles: 'can either be a single specified junit xml file or directory'
 *      fileIncludeString: 'sub-string to only use files whose name contains this sub-string i.e. chrome_, firefox_, ie_',
 *      screenshotsDir: 'path to this browsers screenshots folder',
 *      // customCSSFile: 'path to custom css file',
 *      // addHTMLTop: 'file containing html to inject into top of this browser report page',
 *      // addHTMLBottom: 'file containing html to inject into bottom of this browser report page',
 *      fileName: 'name the html file created - defaults to index.html',
 *      userDefinedDirs: 'A list of src - target dirs (array of objects) for user defined directories to include in overview. If target not specified - defaults to browserOutputPath',
 * 
 *      // Throughout report generation - can add new vars here for each browsers totaltests, testtime, failedtests, etc:
 *      startTime: undefined,
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        errored: 0,
        genratedBrowserSpecReport: '<table ....>'
 *      
 *    }
 *  ]}
 * }
 */