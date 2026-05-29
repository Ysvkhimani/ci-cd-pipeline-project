require('dotenv').config();

const nodemailer = require("nodemailer");
const fs = require("fs");
const archiver = require("archiver");
const path = require("path");

function getLatestReportFolder() {

    const reportsPath = './reports';

    const folders = fs.readdirSync(reportsPath)
        .map(file => ({
            name: file,
            time: fs.statSync(path.join(reportsPath, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

    return path.join(reportsPath, folders[0].name);
}

async function zipReport(reportFolder) {

    return new Promise((resolve, reject) => {

        const zipFileName = `${path.basename(reportFolder)}.zip`;

        const output = fs.createWriteStream(zipFileName);

        const archive = archiver('zip', {
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

    const data = JSON.parse(
        fs.readFileSync('test-results.json', 'utf8')
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

                        const result = test.results[0];

                        const status = result?.status;

                        if (status === 'passed') {

                            passed++;

                            passedTests.push(spec.title);

                        } else {

                            failed++;

                            failedTests.push({
                                name: spec.title,
                                error: result?.error?.message || "Unknown Error"
                            });
                        }
                    }
                }
            }

            if (suite.suites) {
                processSuites(suite.suites);
            }
        }
    }

    processSuites(data.suites);

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

    const zipFile =
        await zipReport(latestReportFolder);

    const summary =
        getExecutionSummary();

    let transporter = nodemailer.createTransport({

        service: 'gmail',

        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const passedList = summary.passedTests
        .map(test => `<li style="color:green;">${test}</li>`)
        .join('');

    const failedList = summary.failedTests
        .map(test => `
            <li style="color:red;">
                <b>${test.name}</b><br>
                ${test.error}
            </li>
        `)
        .join('');

    await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: 'yashvi.khimani@ecosmob.com',

        subject: 'Kaleyra Automation Execution Report',

        html: `

        <h2>Kaleyra Automation Execution Summary</h2>

        <table border="1" cellpadding="10">

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

        <h3>Passed Tests</h3>

        <ul>
            ${passedList}
        </ul>

        <h3>Failed Tests</h3>

        <ul>
            ${failedList || '<li>No Failed Tests</li>'}
        </ul>

        <br>

        <p>
        Attached:
        Complete Playwright HTML Report ZIP
        </p>

        `,

        attachments: [
            {
                filename: zipFile,
                path: `./${zipFile}`
            }
        ]
    });

    console.log('Email sent successfully');
}

sendMail();