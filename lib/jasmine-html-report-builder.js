// @protractor-helper-template

// @imports
var xmlDocument = require('xmldoc');
var path = require('path');
var fse = require('fs-extra');
var moment = require('moment');

// @class
var HTMLReport = function() {
    // Global config
    var config = null;

    // html report file headers
    var reportTitle = '<title><page> Test Report</title>';
    var htmlFooter = '<footer><div class="footerMsg">Report created using <i><b>Jasmine-HTML-Report-Builder</b></i> node module</div></footer>';
    var reportCss = '<style> #td-table, tr, td { \
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; \
            width: 95%; \
            table-layout: fixed; \
            text-align: left; \
            border-collapse: collapse; \
            font-size: small; \
            border: 1px solid #000000; \
            padding: 8px; \
            background-color: #f0ffff; \
            margin: 8px auto; \
        } \
        .status { \
            width: 6%; \
        } \
        .specDescription { \
            width: 35%;\
        } \
        .details { \
            width: 59%; \
        } \
        #td-table-header { \
            font-size: 1em; \
            border: 1px solid #000000; \
            padding: 8px; \
            background-color: steelblue; \
            color: white;\
        } \
        #td-table-spec { \
            background-color: #CFD8DC; \
            color: black; \
        } \
        #td-table-test-pass { \
            background-color: #009688; \
            color: #e6e6e6; \
        } \
        #td-table-test-fail { \
            background-color: #F7464A; \
            color: #e6e6e6; \
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
            padding: 8px; \
            margin: 0px auto; \
            background-color: steelblue; \
            color: white; \
        } \
        #div-ts-table { \
            text-align: center; \
            outline: thin solid; \
            padding: 8px; \
            background: #CFD8DC; \
            font-size: medium; \
            color: black; \
            font-size: 20px; \
        } \
        .pageTitle { \
            backgroundColor: #607D8B\
        } \
        #stacked-bar-chart { \
            height: 310px; \
        } \
        .body { \
            background-color: #f0ffff; \
        } \
        li { \
            padding-top:0px; \
            list-style-type: none; \
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; \
            font-size: small; \
            padding: 7px; \
        } \
        \
        select { \
            -webkit-appearance: none; \
            text-align: centre; \
            vertical-align: middle; \
            padding: 0px; \
        } \
        .buttonPanel { \
            width: 95%; \
            background-color: #7ccae9; \
            margin: auto; \
            overflow: auto; \
            padding-top: 5px; \
            padding-bottom: 2px; \
        } \
        .pageSelect { \
            border: none; \
            display: inline-block; \
            text-align: center; \
            padding: 4px 8px; \
            background-color: #f2f2f2; \
            border-radius: 8px; \
            border: 1px solid black; \
            transition: all 0.3s; \
            cursor: pointer; \
            margin-left: 8px; \
            margin-bottom: 3px; \
            float: left; \
            font-size: 16px; \
            color: black; \
        } \
        .pageSelect:hover { \
            background-color: #83C985;\
            color: white; \
        } \
        .buttonScreenshots { \
            border: none; \
            display: inline-block; \
            text-align: center; \
            padding: 4px 8px; \
            background-color: #f2f2f2; \
            border-radius: 8px; \
            border: 1px solid black; \
            transition: all 0.3s; \
            cursor: pointer; \
            margin-left: 8px; \
            float: left; \
            margin-bottom: 3px; \
            font-size: 16px; \
            color: black; \
        } \
        .buttonScreenshots:active { \
            color: black \
            background-color: #f62326; \
        } \
        .buttonScreenshots:hover { \
            background-color: #f62326; \
            color: white; \
        } \
        \
        .buttonUser { \
            border: none; \
            display: inline-block; \
            text-align: center; \
            padding: 4px 8px; \
            background-color: #f2f2f2; \
            border-radius: 8px; \
            border: 1px solid black; \
            transition: all 0.3s; \
            cursor: pointer; \
            margin-right: 8px; \
            float: right; \
            margin-bottom: 3px; \
            font-size: 16px; \
            color: black; \
        } \
        .buttonUser:active { \
            color: black \
            background-color: #668cff; \
        } \
        .buttonUser:hover { \
            background-color: #668cff; \
            color: white; \
        } \
        \
        .footerMsg { \
            background-color: steelblue;\
            font-size: 16px; \
            color: white; \
            text-align: center; \
            margin-top: 2px; \
            margin-bottom: 1px; \
            padding-top: 3px; \
            padding-bottom: 3px; \
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
                title: "Test Results Chart", \
                chartArea: { width: "50%" }, \
                height: 320, \
                width: 850, \
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

        //Create status.txt file containing overview results
        createStatusTextFile();
    }

    // Create the report structure and any attributes required are set here
    var preConfiguration = function() {
        // Make required base directory
        if (!fse.existsSync(config.baseOutputPath)) {
            try {
                fse.mkdirSync(config.baseOutputPath);
            } catch (err) {
                console.log('Failed to create base output path: ' + config.baseOutputPath);
                if (!config.force) {
                    throw err;
                } else {
                    console.log('Force flag set - continuing build...');
                }
            }
        }

        // Create user defined directories if any and copy over contents for overview page
        if (config.userDefinedDirs !== null && config.userDefinedDirs !== undefined) {
            copyDirs(config.userDefinedDirs, config.baseOutputPath);
        }

        // Setup for copying screenshots to their respective new directories
        var screenshots = [];
        if (config.overviewScreenshotsDir !== null && config.overviewScreenshotsDir !== undefined) {
            screenshots = [{
                src: config.overviewScreenshotsDir,
                target: config.baseOutputPath + '/screenshots'
            }];
        }

        // Setup the select navigation here and create each browser directory as needed
        config.selectOptions = ['Overview'];
        for (var i = 0; i < config.browsersConfig.length; i++) {
            initBrowserVars(i);
            config.selectOptions.push(config.browsersConfig[i].browserName); // Add seleect options
            config.browsersConfig[i].browserOutputPath = path.join(config.baseOutputPath, '/', config.browsersConfig[i].browserName);
            if (!fse.existsSync()) { // Create each browser dir
                try {
                    fse.mkdirSync(config.browsersConfig[i].browserOutputPath);
                } catch (err) {
                    if (err.code !== 'EEXIST') {
                        if (!config.force) {
                            throw err;
                        } else {
                            console.log('Force flag set - continuing build...');
                        }
                    } else {
                        console.log('Directory already exists ' + config.browsersConfig[i].browserOutputPath + ' - continuing');
                    }
                }
            }
            if (config.browsersConfig[i].screenshotsDir !== null && config.browsersConfig[i].screenshotsDir !== undefined) {
                screenshots.push({
                    src: config.browsersConfig[i].screenshotsDir,
                    target: config.browsersConfig[i].browserOutputPath + '/screenshots'
                });
            }
            // Copy userDefinedDirs for each browser
            if (config.browsersConfig[i].userDefinedDirs !== null && config.browsersConfig[i].userDefinedDirs !== undefined) {
                copyDirs(config.browsersConfig[i].userDefinedDirs, config.browsersConfig[i].browserOutputPath);
            }
        }

        // Copy all screenshots dirs
        if (screenshots !== undefined && screenshots !== null) {
            copyDirs(screenshots, config.baseOutputPath);
        }

        // Initialize overview vars
        initOverviewVars();

        // Inject any css and html defined by user
        // ### TODO
    }

    var initBrowserVars = function(configBrowserLocation) {
        thisConfig = config.browsersConfig[configBrowserLocation];
        thisConfig.dataSeries = '';
        thisConfig.totalTests = 0;
        thisConfig.totalErrors = 0;
        thisConfig.totalFailures = 0;
        thisConfig.totalPassed = 0;
        thisConfig.totalExecTime = 0;
        thisConfig.totalSkips = 0;
        thisConfig.startTime = 0;
        config.browsersConfig[configBrowserLocation] = thisConfig;
    }

    var initOverviewVars = function() {
        config.dataSeries = '';
        config.totalTests = 0;
        config.totalErrors = 0;
        config.totalFailures = 0;
        config.totalPassed = 0;
        config.totalExecTime = 0;
        config.totalSkips = 0;
        config.startTime = 0;
        config.testDetails = '';
    }

    // Copies all contents from source in each (src - target) pair into target - if no target provided uses defaultTarget (baseOutputPath or browserOutputPath)
    var copyDirs = function(list, defaultTarget) {
        if (list === undefined || list === null) {
            console.log('Null list detected - returning');
            return;
        }
        for (var i = 0; i < list.length; i++) {
            if (list[i].target === undefined || list[i].target === null) {
                // Saves folder to default path under original folder name if target not specified
                list[i].target = defaultTarget + '/' + list[i].src.replace(/^.*[\\\/]/, '');
                console.log('No target for: ' + list[i].src + ', setting target to: ' + list[i].target);
            }
            try {
                fse.mkdirSync(list[i].target);
            } catch (err) {
                console.log('Cannot create target directory: ' + list[i].target + ', reason: ');
                if (err.code !== 'EEXIST') {
                    if (!config.force) {
                        throw err;
                    } else {
                        console.log('Force flag set - continuing build...');
                    }
                } else {
                    console.log('Directory already exists - continuing');
                }
            }
            if (list[i].src !== undefined && list[i].src !== null) {
                try {
                    fse.copySync(list[i].src, list[i].target);
                } catch (err) {
                    console.log('Failed to copy user defined directory to target location');
                    if (!config.force) {
                        throw err;
                    } else {
                        console.log('Force flag set - continuing build...');
                    }
                }
            }
        }
    }

    // Generate select html for given page
    var getSelectHTML = function(thisPageValue) {
        var locations = [
            './' // Overview
        ]

        for (var i = 0; i < config.browsersConfig.length; i++) {
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
            if (locations[k].indexOf(thisPageValue) !== -1) {
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
            for (var i = 0; i < thisConfig.specFiles.length; i++) {
                testDetails += generateResultTable(thisConfig.specFiles[i], configBrowserLocation);
            }
        } else {
            testDetails = generateResultTable(thisConfig.specFiles, configBrowserLocation);
        }
        // Set the testDetails for this browser
        thisConfig.testDetails = testDetails;
        // Append this data to overview testDetails if required by user (show specs for all browsers on overview page)
        config.testDetails += testDetails;
        // Create test summary table
        thisConfig.testSummary = generateTestSummaryTable(thisConfig);
        // Store values in config
        config.browsersConfig[configBrowserLocation] = thisConfig;
    }

    var generateResultTable = function(reportXml, browserConfigLocation) {
        var thisConfig = config.browsersConfig[browserConfigLocation];

        var testDetailsTable = '<tr><th id="td-table-header" class="specDescription">' + thisConfig.browserName + ' - Spec Description</th> \
            <th id="td-table-header" class="status">Status</th> \
            <th id="td-table-header" class="details">Details</th></tr>';

        var xmlData = fse.readFileSync(reportXml, 'utf8');
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
            for (var j = 0; j < numTestCases; j++) {
                var failed = tempTestCases[j].childNamed('failure');
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
            if (thisConfig.startTime === null || thisConfig.startTime === 0) {
                thisConfig.startTime = testStartedOn;
            }

            // Break for next part of dataseries if series already exists
            thisConfig.dataSeries += (thisConfig.dataSeries !== '' && thisConfig.dataSeries !== null) ? ',' : '';

            // Capture data for stacked barchart
            thisConfig.dataSeries += '["' + suiteName + '",' + suitePassedTests + ',' + suiteTestFailures + ',';
            thisConfig.dataSeries += suiteTestSkips + ']';

            testDetailsTable += '<tr><td id="td-table-spec" colspan=3>' + suiteName + '</td></tr>';
            var testcases = testSuites[i].childrenNamed('testcase');

            // Capture tescase execution details for each testsuite
            for (var k = 0; k < testcases.length; k++) {
                testDetailsTable += '<tr><td class="specDescription">';

                var testFailed = testcases[k].childNamed('failure');
                var testSkipped = testcases[k].childNamed('skipped');

                // ## Removed links in individual test failures to screenshots until new structure is created
                /*if (testFailed) {
                    if (thisConfig.screenshotsDir !== null && thisConfig.screenshotsDir !== undefined) {
                        testDetailsTable += '<a href="' + thisConfig.screenshotsDir + '">';
                    }
                }*/

                testDetailsTable += testcases[k].attr.name;
                if (testFailed) {
                    if (thisConfig.screenshotsDir !== null && thisConfig.screenshotsDir !== undefined) {
                        testDetailsTable += '</a></td>';
                    } else {
                        testDetailsTable += '</td>';
                    }
                } else {
                    testDetailsTable += '</td>';
                }
                var testError = testcases[k].childNamed('error');
                if (testFailed) {
                    testDetailsTable += '<td id="td-table-test-fail" class="status">Failed</td><td class="details">' + testFailed + '</td>';
                } else if (testSkipped) {
                    testDetailsTable += '<td id="td-table-test-skip" class="status">Skipped</td class="details"><td>' + testSkipped + '</td>';
                } else if (testError) {
                    testDetailsTable += '<td id="td-table-test-fail" class="status">Error</td class="details"><td>' + testError + '</td>';
                } else {
                    testDetailsTable += '<td id="td-table-test-pass" class="status">Passed</td class="details"><td></td>'
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

    var getDateString = function() {
        return moment().format('DD/MM/YYYY HH:mm');
    }

    var generateTestSummaryTable = function(thisConfig, isOverview) {
        var testSummaryTable = '<tr id="tr-ts-table"><th colspan=2><div id="div-ts-table">';
        var testReportTitle = thisConfig.overviewTitle === undefined ? (thisConfig.reportTitle === undefined ? 'Test Execution Report' : thisConfig.reportTitle) : thisConfig.overviewTitle;
        testSummaryTable += testReportTitle + '</div></th></tr>';
        testSummaryTable += '<tr id="tr-ts-table"><td id="td-ts-table"><div>';
        testSummaryTable += isOverview ? '<li><b>Report Created: </b> ' + getDateString() + '</li>' : '<li><b>Test Start:</b> ' + thisConfig.startTime + '</li>';
        testSummaryTable += '<li><b>Total Tests:</b> ' + thisConfig.totalTests + '</li>';
        testSummaryTable += '<li><b>Pass Rate:</b> ' + (thisConfig.passRate * 100).toFixed(2) + '% </li>';
        testSummaryTable += '<li><b>Execution Duration:</b> ' + thisConfig.totalExecTime + ' Secs</li>';
        if (thisConfig.addSummaryDetails !== null && thisConfig.addSummaryDetails !== undefined) {
            var addInfo = thisConfig.addSummaryDetails;
            for (var i = 0; i < addInfo.length; i++) {
                if (addInfo[i].tag !== null && addInfo[i].tag !== undefined) {
                    if (addInfo[i].value !== null && addInfo[i].value !== undefined) {
                        testSummaryTable += '<li><b>' + addInfo[i].tag + ' :</b> ' + addInfo[i].value + '</li>';
                    }
                }
            }
        }
        testSummaryTable += '</ul></div></td><td id="td-ts-table" rowspan=6>';
        testSummaryTable += '<div id="stacked-bar-chart"></div></td></tr>';
        return testSummaryTable;
    }

    // Used for overview to compile results for chart and summary data
    var compileBarData = function() {
        var dataSeries = '';
        for (var i = 0; i < config.browsersConfig.length; i++) {
            dataSeries += i > 0 ? ',' : '';
            var passed = config.browsersConfig[i].totalPassed;
            var failed = config.browsersConfig[i].totalFailures;
            var skipped = config.browsersConfig[i].totalSkips;
            // Add summary data
            config.totalPassed += passed;
            config.totalFailures += failed;
            config.totalSkips += skipped;
            config.totalTests += config.browsersConfig[i].totalTests;
            config.totalErrors += config.browsersConfig[i].totalErrors;
            config.totalExecTime += config.browsersConfig[i].totalExecTime;
            dataSeries += '["' + config.browsersConfig[i].browserName + '",' + passed + ',' + failed + ',' + skipped + ']';
        }
        config.dataSeries = dataSeries;
        config.passRate = ((config.totalTests - config.totalFailures - config.totalSkips) / config.totalTests).toFixed(3);
    }

    var createBrowserPage = function(browserConfigLocation) {
        var thisConfig = config.browsersConfig[browserConfigLocation];
        var htmlReportBody = generatePageButtons(thisConfig.browserName, browserConfigLocation); // Generate browser page buttons
        var thisReportScript = reportScript.replace('<dataSeries>', thisConfig.dataSeries); // Create chart using data

        // Prepare for html file content
        var thisReportTitle = reportTitle.replace('<page>', thisConfig.browserName);
        var htmlReportHead = '<html><head>' + thisReportTitle + reportCss + thisReportScript + '</head>';
        var htmlReportSummary = '<body class="body">' + '<table id="ts-table">' + thisConfig.testSummary + '</table>';
        htmlReportBody += '<table id="td-table">' + thisConfig.testDetails + '</table></body>' + htmlFooter + '</html>';

        // Combine html coponents
        var htmlReport = htmlReportHead + htmlReportSummary + htmlReportBody;

        // Prepare to write new .html file
        var outputPath = thisConfig.browserOutputPath === null ? './results/' + thisConfig.browserName : thisConfig.browserOutputPath;
        if (!fse.existsSync(outputPath)) {
            try {
                fse.mkdirSync(outputPath);
            } catch (err) {
                if (err.code !== 'EEXIST') {
                    console.log('Failed to create output directory at overview creation: ' + outputPath);
                    if (!config.force) {
                        throw err;
                    } else {
                        console.log('Force flag set - continuing build...');
                    }
                }
            }
        }
        // Write report
        try {
            fse.writeFileSync(path.join(outputPath, '/index.html'), htmlReport);
        } catch (err) {
            console.log('Failed to write new .html file for browser page: ' + thisConfig.browserName);
            if (!config.force) {
                throw err;
            } else {
                console.log('Force flag set - continuing build...');
            }
        }
    }

    var createOverviewPage = function() {
        var htmlReportBody = generatePageButtons('Overview'); // Generate overview page buttons
        compileBarData(); // Compile overview page summary chart data
        var thisReportScript = reportScript.replace('<dataSeries>', config.dataSeries); // Create chart using data
        config.testSummary = generateTestSummaryTable(config, true); // Generate summary table for overview page (true means its overview page)

        // Prepare for html file content
        var thisReportTitle = reportTitle.replace('<page>', 'Overview');
        var htmlReportHead = '<html><head>' + thisReportTitle + reportCss + thisReportScript + '</head>';
        var htmlReportSummary = '<body class="body">' + '<table id="ts-table">' + config.testSummary + '</table>';
        // If specs are to be included in overview page, add them in, otherwise finish body of page
        htmlReportBody += config.includeSpecsInOverview ? '<table id="td-table">' + config.testDetails + '</table></body>' + htmlFooter + '</html>' : '</body>' + htmlFooter + '</html>';
        // Combine html coponents
        var htmlReport = htmlReportHead + htmlReportSummary + htmlReportBody;
        // Prepare to write new .html file
        var outputPath = config.baseOutputPath === null ? './default_output' : config.baseOutputPath;

        if (!fse.existsSync(outputPath)) {
            try {
                fse.mkdirSync(outputPath);
            } catch (err) {
                if (err.code !== 'EEXIST') {
                    console.log('Failed to create output directory at overview creation: ' + outputPath);
                    if (!config.force) {
                        throw err;
                    } else {
                        console.log('Force flag set - continuing build...');
                    }
                }
            }
        }

        // Write report
        try {
            fse.writeFileSync(path.join(outputPath, '/index.html'), htmlReport);
        } catch (err) {
            console.log('Failed to write new .html file for overview page');
            if (!config.force) {
                throw err;
            } else {
                console.log('Force flag set - continuing build...');
            }
        }
    }

    var generatePageButtons = function(pageType, browserConfigLocation) {
        var html = '<div class="buttonPanel">' + getSelectHTML(pageType);

        if (pageType === 'Overview') { // Overview page
            if (config.overviewScreenshotsDir !== null && config.overviewScreenshotsDir !== undefined) {
                html += createButton('buttonScreenshots', 'screenshots', 'Failed Test Screenshots');
                if (config.userDefinedButtons !== undefined && config.userDefinedButtons !== null) {
                    html += addUserDefinedButtons(config);
                }
                html += '</div>';
            }
        } else {
            if (config.browsersConfig[browserConfigLocation].screenshotsDir !== null && config.browsersConfig[browserConfigLocation].screenshotsDir !== undefined) {
                html += createButton('buttonScreenshots', 'screenshots', 'Failed Test Screenshots');
                if (config.browsersConfig[browserConfigLocation].userDefinedButtons !== undefined && config.browsersConfig[browserConfigLocation].userDefinedButtons !== null) {
                    html += addUserDefinedButtons(config.browsersConfig[browserConfigLocation]);
                }
                html += '</div>';
            }
        }
        return html;
    }

    var createStatusTextFile = function() {
        var overviewStatus = 'Status: ';
        if (config.totalFailures > 0 || config.totalErrors > 0) {
            overviewStatus += 'FAILED: ';
        } else {
            overviewStatus += 'PASSED: ';
        }
        overviewStatus += 'Total Tests: ' + config.totalTests + ', Total Errors: ' + config.totalErrors + ', Total Skips: ' +
            config.totalSkips + ', Total Failures: ' + config.totalFailures + ', Total Execution Time: ' + config.totalExecTime;

        var statusFile = path.join(config.baseOutputPath, '/status.txt');
        try {
            fse.writeFileSync(statusFile, overviewStatus);
        } catch (err) {
            console.log('Failed to create status.txt file');
            if (!config.force) {
                throw err;
            } else {
                console.log('Force flag set - continuing build...');
            }
        }
    }

    var addUserDefinedButtons = function(thisConfig) {
        var buttonsHTML = '';
        if (thisConfig.userDefinedButtons[0] !== undefined && thisConfig.userDefinedButtons[0] !== null) {
            for (var i = 0; i < thisConfig.userDefinedButtons.length; i++) {
                var onClick = thisConfig.userDefinedButtons[i].onClickLocation;
                var btnTxt = thisConfig.userDefinedButtons[i].buttonText;
                buttonsHTML += createButton('buttonUser', (onClick !== undefined && onClick !== null) ? './' + onClick : './', (btnTxt !== undefined && btnTxt !== null) ? btnTxt : 'Default');
            }
        }
        return buttonsHTML;
    }

    var createButton = function(cssClass, onClickLocation, buttonText) {
        return '<button type="button" class="' + cssClass + '" onClick="location.href=\'' + onClickLocation + '\'">' + buttonText + '</button>';
    }
}

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
 *  userDefinedDirs: 'A list of src - target dirs (array of objects) for user defined directories to include in overview. If target not specified - defaults to baseOutputPath',
 *  browsersConfig: {[
 *    {
 *      reportTitle: 'browser report title',
 *      browserName: 'name of the browser', // used for folders etc
 *      specFiles: 'can either be a single specified junit xml file or an array of soec files (full paths only)',
 *      screenshotsDir: 'path to this browsers screenshots folder',
 *      // customCSSFile: 'path to custom css file',
 *      // addHTMLTop: 'file containing html to inject into top of this browser report page',
 *      // addHTMLBottom: 'file containing html to inject into bottom of this browser report page',
 *      userDefinedDirs: 'A list of src - target dirs (array of objects) for user defined directories to include in overview. If target not specified - defaults to browserOutputPath',
 *    }
 *  ]}
 * }
 */