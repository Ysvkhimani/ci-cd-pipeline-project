require('dotenv').config();

const nodemailer = require("nodemailer");
const fs = require("fs");
const archiver = require("archiver");
const path = require("path");

function getLatestReportFolder() {

    const reportsPath = './reports';

    const folders = fs.readdirSync(reportsPath)
        .filter(file =>
            fs.statSync(path.join(reportsPath, file)).isDirectory()
        )
        .map(file => ({
            name: file,
            time: fs.statSync(path.join(reportsPath, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

    if (!folders.length) {

        throw new Error('No report folder found inside reports/');
    }

    return path.join(reportsPath, folders[0].name);
}

async function zipReport(reportFolder) {

    return new Promise((resolve, reject) => {

        const zipFileName =
            `${path.basename(reportFolder)}.zip`;

        const output =
            fs.createWriteStream(zipFileName);

        const archive =
            archiver('zip', {
                zlib: { level: 9 }
            });

        output.on('close', () => {

            console.log('Report zipped successfully');

            resolve(zipFileName);
        });

        archive.on('error', err => reject(err));

        archive.pipe(output);

        archive.directory(reportFolder, false);

        archive.finalize();
    });
}

function getExecutionSummary() {

    const jsonData =
        JSON.parse(
            fs.readFileSync(
                'test-results.json',
                'utf8'
            )
        );

    let total = 0;
    let passed = 0;
    let failed = 0;

    let passedTests = [];
    let failedTests = [];

    function processSuites(suites) {

        for (const suite of suites) {

            if (suite.specs) {

                for (const spec of suite.specs) {

                    for (const test of spec.tests) {

                        total++;

                        const result =
                            test.results[0];

                        const status =
                            result?.status;

                        if (status === 'passed') {

                            passed++;

                            passedTests.push(
                                spec.title
                            );

                        } else {

                            failed++;

                            failedTests.push({

                                name: spec.title,

                                error:
                                    result?.error?.message
                                        ?.split('\n')[0] ||
                                    'Unknown Error'
                            });
                        }
                    }
                }
            }

            if (suite.suites) {

                processSuites(
                    suite.suites
                );
            }
        }
    }

    processSuites(jsonData.suites);

    return {
        total,
        passed,
        failed,
        passedTests,
        failedTests
    };
}

async function sendMail() {

    const latestReportFolder =
        getLatestReportFolder();

    const reportName =
        path.basename(
            latestReportFolder
        );

    const zipFile =
        await zipReport(
            latestReportFolder
        );

    const summary =
        getExecutionSummary();

    const executionTime =
        new Date()
            .toLocaleString();

    const overallStatus =
        summary.failed > 0
            ? 'FAILED'
            : 'PASSED';

    const passedList =
        summary.passedTests.length
            ? summary.passedTests
                .map(test =>
                    `<li style="color:green;">${test}</li>`
                )
                .join('')
            : '<li>No Passed Tests</li>';

    const failedList =
        summary.failedTests.length
            ? summary.failedTests
                .map(test => `
                <li style="color:red;">
                    <b>${test.name}</b>
                    <br>
                    ${test.error}
                </li>
            `)
                .join('')
            : '<li>No Failed Tests</li>';

    let transporter =
        nodemailer.createTransport({

            service: 'gmail',

            auth: {

                user:
                    process.env.EMAIL_USER,

                pass:
                    process.env.EMAIL_PASS
            }
        });

    await transporter.sendMail({

        from:
            process.env.EMAIL_USER,

        to:
            'yashvi.khimani@ecosmob.com',

        subject:
            `${reportName} - Automation Execution Report`,

        html: `

        <h2 style="
            color:white;
            background:${summary.failed > 0 ? 'red' : 'green'};
            padding:10px;
        ">
            Execution Status :
            ${overallStatus}
        </h2>

        <h3>Module Executed</h3>

        <p>
            ${reportName}
        </p>

        <p>
            <b>Execution Time:</b>
            ${executionTime}
        </p>

        <p>
            <b>Browser:</b>
            Chromium
        </p>

        <h3>Execution Summary</h3>

        <table border="1" cellpadding="10" cellspacing="0">

            <tr>
                <th>Total</th>
                <th>Passed</th>
                <th>Failed</th>
            </tr>

            <tr>
                <td>${summary.total}</td>

                <td style="color:green;">
                    ${summary.passed}
                </td>

                <td style="color:red;">
                    ${summary.failed}
                </td>
            </tr>

        </table>

        <br>

        <h3>Passed Test Cases</h3>

        <ul>
            ${passedList}
        </ul>

        <h3>Failed Test Cases</h3>

        <ul>
            ${failedList}
        </ul>

        <br>

        <p>
            Attached:
            Complete Playwright HTML Report ZIP
        </p>

        <br>

        <p>
            Regards,
            <br>
            Kaleyra CI/CD Pipeline
        </p>

        `,

        attachments: [
            {
                filename: zipFile,
                path: `./${zipFile}`
            }
        ]
    });

    console.log(
        'Email sent successfully'
    );

    if (fs.existsSync(zipFile)) {

        fs.unlinkSync(zipFile);

        console.log(
            'Temporary ZIP deleted'
        );
    }
}

sendMail();