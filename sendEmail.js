require('dotenv').config();

const nodemailer = require("nodemailer");
const fs = require("fs");
const archiver = require("archiver");

async function zipReport() {

    const output = fs.createWriteStream("playwright-report.zip");

    const archive = archiver("zip", {
        zlib: { level: 9 }
    });

    archive.pipe(output);

    archive.directory("playwright-report/", false);

    await archive.finalize();

    console.log("Report zipped successfully");
}

async function sendMail() {

    await zipReport();

    let transporter = nodemailer.createTransport({

        service: "gmail",

        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let info = await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: "yashvi.khimani@ecosmob.com",

        subject: "CI/CD Pipeline Automation Report",

        html: `

        <h2>CI/CD Automation Execution Report</h2>

        <p>Hello,</p>

        <p>The automation pipeline executed successfully.</p>

        <h3>Execution Details:</h3>

        <ul>
            <li>Framework: Playwright</li>
            <li>Browsers: Chromium, Firefox, Webkit</li>
            <li>Status: Passed</li>
        </ul>

        <p>Please find attached HTML automation report.</p>

        <p>Regards,<br>CI/CD Pipeline Project</p>

        `,

        attachments: [
            {
                filename: "playwright-report.zip",
                path: "./playwright-report.zip"
            }
        ]
    });

    console.log("Email sent successfully");
}

sendMail();