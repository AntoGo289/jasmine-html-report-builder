// @protractor-helper-template

// @imports
var xmlDocument = require('xmldoc');
var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');

// @class
var HTMLReport = function() {

    // stacked bar chart & execution details data gets captured during input xml parsing 
    var testExecInfo = { testStartedOn: undefined, totalTests: 0, passRate: 0.0, execTime: 0.0, totalFailures: 0, totalErrors: 0, totalSkips: 0 };

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

    // Only used for overview to compile results
    var compileBarData = function() {
        dataSeries = '';
        if (compiledResults.chrome.startTime !== undefined) {
            // Chrome
            dataSeries += '["' + compiledResults.chrome.browser + '",' + compiledResults.chrome.passed + ',' + compiledResults.chrome.failed + ',';
            dataSeries += compiledResults.chrome.skipped + '],';
        }

        if (compiledResults.firefox.startTime !== undefined) {
            // Firefox
            dataSeries += '["' + compiledResults.firefox.browser + '",' + compiledResults.firefox.passed + ',' + compiledResults.firefox.failed + ',';
            dataSeries += compiledResults.firefox.skipped + '],';
        }

        if (compiledResults.explorer.startTime !== undefined) {
            // IE11
            dataSeries += '["' + compiledResults.explorer.browser + '",' + compiledResults.explorer.passed + ',' + compiledResults.explorer.failed + ',';
            dataSeries += compiledResults.explorer.skipped + '],';
        }

        if (compiledResults.safari.startTime !== undefined) {
            // Safari
            dataSeries += '["' + compiledResults.safari.browser + '",' + compiledResults.safari.passed + ',' + compiledResults.safari.failed + ',';
            dataSeries += compiledResults.safari.skipped + '],';
        }
    }

    // @private-function
    var generateTSTable = function(testConfig) {
        var testSummaryTable = '<tr id="tr-ts-table"><th colspan=2><div id="div-ts-table">';
        var testReportTitle = testConfig['reportTitle'] == undefined ? 'Test Execution Report' : testConfig['reportTitle'];
        testSummaryTable += testReportTitle + '</div></th></tr>';
        testSummaryTable += '<tr id="tr-ts-table"><td id="td-ts-table"><div>';
        for (var testConfigParam in testConfig) {
            console.log(testConfigParam)
            if (testConfigParam != 'reportTitle' && testConfigParam != 'outputPath') {
                testSummaryTable += '<li><b>' + testConfigParam + ' :</b> ' + testConfig[testConfigParam] + '</li>';
            }
        }
        testSummaryTable += '<li><b>Test Start:</b> ' + testExecInfo['testStartedOn'] + '</li>';
        testSummaryTable += '<li><b>Total Tests:</b> ' + testExecInfo['totalTests'] + '</li>';
        testSummaryTable += '<li><b>Pass Rate:</b> ' + testExecInfo['passRate'] * 100 + '% </li>';
        testSummaryTable += '<li><b>Execution Duration:</b> ' + testExecInfo['execTime'] + ' Secs</li>';
        testSummaryTable += '</ul></div></td><td id="td-ts-table" rowspan=6>';
        testSummaryTable += '<div id="stacked-bar-chart"></div></td></tr>';
        return testSummaryTable;
    }

    // @public-function
    this.from = function(reportXml, testConfig, type) {
        var path = require("path");
        var testDetails = '';

        if (reportXml instanceof Array) {
            for (var i = 0; i < reportXml.length; i++) {
                testDetails += generateTDTable(reportXml[i], testConfig);
            }
        } else {
            testDetails = generateTDTable(reportXml, testConfig);
        }

        dataSeries = dataSeries.slice(0, -1);
        var testSummary = generateTSTable(testConfig);

        var htmlReportBody = '';
        if (type.toLowerCase() === 'overview') {
            compileBarData();
            htmlReportBody += '<button type="button" class="buttonScreenshots" onClick="location.href=\'./screenshots\'">Failed Test Screenshots</button>';
            htmlReportBody += '<button type="button" class="buttonRESTAPI" onClick="location.href=\'./api\'">REST API Results</button>';
            htmlReportBody += '<button type="button" class="buttonUnitTestsReport" onClick="location.href=\'./unitTestsReport\'">Unit Test Report</button>';
            htmlReportBody += '<button type="button" class="buttonUnitTestsCoverage" onClick="location.href=\'./unitTestsCoverage\'">Unit Test Coverage</button>';
            htmlReportBody += '<select id=browserSelect class="pageSelect" onChange="location.href=this.value"><option value=\"./chrome\">Google Chrome</option><option value=\"./firefox\">Mozilla Firefox</option><option value=\"./ie\">Internet Explorer</option><option value=\"../safari\">Safari</option><option value=\"./\" selected>Overview</option></select>';

            var overviewStatus = 'Status: ';
            if (testExecInfo['totalFailures'] > 0 || testExecInfo['totalErrors'] > 0) {
                overviewStatus += 'FAILED: ';
            } else {
                overviewStatus += 'PASSED: ';
            }

            overviewStatus += 'Total Tests: ' + testExecInfo['totalTests'] + ', Total Errors: ' + testExecInfo['totalErrors'] + ', Total Skips: ' +
                testExecInfo['totalSkips'] + ', Total Failures: ' + testExecInfo['totalFailures'] + ', Pass Rate: ' + testExecInfo['passRate'] +
                ', Total Executon Time: ' + testExecInfo['execTime'];

            var fs = require('fs');
            var statusFile = filePath.join(__dirname, '/../../../result/status.txt');
            if (fs.existsSync(statusFile)) {
                fs.appendFileSync(statusFile, overviewStatus);
            } else {
                fs.writeFileSync(statusFile, overviewStatus);
            }
        } else {
            var screenshotFolder = '';
            if (type.toLowerCase() === 'google chrome') {
                screenshotFolder += '/chrome';
            } else
            if (type.toLowerCase() === 'mozilla firefox') {
                screenshotFolder += '/firefox';
            } else
            if (type.toLowerCase() === 'internet explorer 11') {
                screenshotFolder += '/internet explorer';
            } else
            if (type.toLowerCase() === 'safari') {
                screenshotFolder += '/safari';
            }

            htmlReportBody += '<button type="button" class="buttonScreenshots" onClick="location.href=\'../screenshots' + screenshotFolder + '\'">Failed Test Screenshots</button>';
            htmlReportBody += '<button type="button" class="buttonRESTAPI" onClick="location.href=\'../api\'">REST API Results</button>';
            htmlReportBody += '<button type="button" class="buttonUnitTestsReport" onClick="location.href=\'../unitTestsReport\'">Unit Test Report</button>';
            htmlReportBody += '<button type="button" class="buttonUnitTestsCoverage" onClick="location.href=\'../unitTestsCoverage\'">Unit Test Coverage</button>';

            if (type.toLowerCase() === 'google chrome') {
                htmlReportBody += '<select id=browserSelect class="pageSelect" onChange="location.href=this.value"><option value=\"../chrome\" selected>Google Chrome</option><option value=\"../firefox\">Mozilla Firefox</option><option value=\"../ie\">Internet Explorer 11</option><option value=\"../safari\">Safari</option><option value=\"../\">Overview</option></select>';
            } else
            if (type.toLowerCase() === 'mozilla firefox') {
                htmlReportBody += '<select id=browserSelect class="pageSelect" onChange="location.href=this.value"><option value=\"../chrome\">Google Chrome</option><option value=\"../firefox\" selected>Mozilla Firefox</option><option value=\"../ie\">Internet Explorer 11</option><option value=\"../safari\">Safari</option><option value=\"../\">Overview</option></select>';
            } else
            if (type.toLowerCase() === 'internet explorer 11') {
                htmlReportBody += '<select id=browserSelect class="pageSelect" onChange="location.href=this.value"><option value=\"../chrome\">Google Chrome</option><option value=\"../firefox\">Mozilla Firefox</option><option value=\"../ie\" selected>Internet Explorer 11</option><option value=\"../safari\">Safari</option><option value=\"../\">Overview</option></select>';
            } else
            if (type.toLowerCase() === 'safari') {
                htmlReportBody += '<select id=browserSelect class="pageSelect" onChange="location.href=this.value"><option value=\"../chrome\">Google Chrome</option><option value=\"../firefox\">Mozilla Firefox</option><option value=\"../ie\">Internet Explorer 11</option><option value=\"../safari\" selected>Safari</option><option value=\"../\">Overview</option></select>';
            } else {
                htmlReportBody += '<select id=browserSelect class="pageSelect" onChange="location.href=this.value"><option selected hidden>Select Page Here</option><option value=\"../chrome\">Google Chrome</option><option value=\"../firefox\">Mozilla Firefox</option><option value=\"../ie\">Internet Explorer 11</option><option value=\"../safari\">Safari</option><option value=\"../\">Overview</option></select>';
            }
        }

        // Feed data to stacked bar chart 
        reportScript = reportScript.replace('<dataSeries>', dataSeries);

        // Prepare for html file content
        var htmlReportHead = '<html><head>' + reportTitle + reportCss + reportScript + '</head>';
        var htmlReportSummary = '<body>' + '<table id="ts-table">' + testSummary + '</table>';

        htmlReportBody += '<table id="td-table">' + testDetails + '</table>';
        htmlReportBody += '</body>';
        if (type.toLowerCase() === 'overview') {
            htmlReportBody += '<footer><a class="downloadHyperlink" href = "./archive/BVTResultsCompilation.7z">Download Past 7 Days Results 7zip File</a></footer></html>';
        } else {
            htmlReportBody += '<footer><a class="downloadHyperlink" href = "../archive/BVTResultsCompilation.7z">Download Past 7 Days Results 7zip File</a></footer></html>';
        }

        var htmlReport = htmlReportHead + htmlReportSummary + htmlReportBody;

        var testOutputPath = './test_output';
        if (testConfig['outputPath']) {
            var testOutputPath = testConfig['outputPath'];
        } else {
            if (!fileSystem.existsSync(testOutputPath)) {
                fileSystem.mkdirSync(testOutputPath);
            }
        }
        // Write report
        fileSystem.writeFileSync(path.join(testOutputPath, '/index.html'), htmlReport);
    }

};

// @exports
module.exports = HTMLReport;

// ###################################################################
// Global config
var config = null;

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
        /*for (var j = 0; j < config.userDefinedDirs.length; j++) {
            if (config.userDefinedDirs[j].target !== null) {
                try {
                    fs.mkdirSync(path.join(config.baseOutputPath, '/', config.userDefinedDirs[j].target));
                } catch (err) {
                    console.log('Failed to create target directory: ' + path.join(config.baseOutputPath, '/', config.userDefinedDirs[j].target));
                    if (err.code !== 'EEXIST') {
                        throw err;
                    } else {
                        console.log('Directory already exists - continuing');
                    }
                }
            } else {
                config.userDefinedDirs[j].target = config.baseOutputPath;
            }
            if (config.userDefinedDirs[j].src !== null) {
                try {
                    fse.copySync(config.userDefinedDirs[j].src, config.userDefinedDirs[j].target);
                } catch (err) {
                    console.log('Failed to copy user defined directory to target location');
                    throw err;
                }
            }
        }*/
    }

    // Setup for copying screenshots to their respective new directories
    var screenshots = null;
    if (config.overviewScreenshotsDir !== null) {
        screenshots = [{
            src: config.overviewScreenshotsDir,
            target: config.baseOutputPath
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
                target: config.browsersConfig[i].browserOutputPath
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

var createBrowserFiles = function(configLocation) {

}

var generateReport = function(newConfig) {
    // Set global config
    config = newConfig;

    // Complete pre-config for report
    preConfiguration();

    // Generate each individual browser report file
    for (var i = 0; i < config.browsersConfig.length; i++) {
        // Generate report for each specified browser
        createBrowserFiles(i);
    }
}

/**
 * config = {
 *  overviewTitle: 'This is the overview Title',
 *  baseOutputPath: 'path/To/Output/To',
 *  overviewScreenshotsDir: 'path/To/Screenshots',
 *  // overviewCustomCSSFile: 'path/To/CustomCSSFile',
 *  // overviewAddHTMLTop: 'file containing html to inject in the top section of report',
 *  // overviewAddHTMLBottom: 'file containing html to inject in the bottom section of report',
 *  overviewFileName: 'give the file a name - defaults to index.js if not specified',
 *  userDefinedDirs: 'A list of src - target dirs (array of objects) for user defined directories to include in overview. If target not specified - defaults to baseOutputPath',
 *  browsersConfig: {[
 *    {
 *      reportTitle: 'browser report title',
 *      browserName: 'name of the browser', // used for folders etc
 *      screenshotsDir: 'path to this browsers screenshots folder',
 *      // customCSSFile: 'path to custom css file',
 *      // addHTMLTop: 'file containing html to inject into top of this browser report page',
 *      // addHTMLBottom: 'file containing html to inject into bottom of this browser report page',
 *      fileName: 'name the html file created - defaults to index.html',
 *      fileIncludeString: 'sub-string to only use files whose name contains this sub-string i.e. chrome_, firefox_, ie_',
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

        //#####################################

        // Capture data for stacked barchart
        thisConfig.dataSeries += '["' + suiteName + '",' + suitePassedTests + ',' + suiteTestFailures + ',';
        thisConfig.dataSeries += suiteTestSkips + '],';
        //dataSeries = (i == totalSuites - 1) ? dataSeries : dataSeries + ',';

        testDetailsTable += '<tr><td id="td-table-spec" colspan=3>' + suiteName + '</td></tr>';
        var testcases = testSuites[i].childrenNamed('testcase');

        // Capture tescase execution details for each testsuite
        for (var j in testcases) {
            testDetailsTable += '<tr><td>';

            var testFailed = testcases[j].childNamed('failure');
            var testSkipped = testcases[j].childNamed('skipped');
            if (testFailed) {
                // testDetailsTable += '<a href="../screenshots">';
                testDetailsTable += '<a href="' + testConfig.screenshots + '">';
            }
            testDetailsTable += testcases[j].attr.name;
            if (testFailed) {
                testDetailsTable += '</a></td>';
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

    // Summary chart data
    if (testExecInfo['testStartedOn'] === undefined) {
        testExecInfo['testStartedOn'] = testStartedOn;
    }
    testExecInfo['totalTests'] += totalTests;
    testExecInfo['totalErrors'] += totalErrors;
    testExecInfo['totalSkips'] += totalSkips;
    testExecInfo['totalFailures'] += totalFailures;
    testExecInfo['passRate'] = ((testExecInfo['totalTests'] - testExecInfo['totalFailures'] - testExecInfo['totalSkips']) / testExecInfo['totalTests']).toFixed(3);
    testExecInfo['execTime'] += totalExecTime;
    return testDetailsTable;
};