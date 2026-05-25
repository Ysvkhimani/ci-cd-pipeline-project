const nodemailer = require("nodemailer");

async function sendMail() {

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "yashvi.khimani@ecosmob.com",
            pass: "aoddwokowutvkgun"
        }
    });

    let info = await transporter.sendMail({
        from: "YOUR_GMAIL@gmail.com",
        to: "yashvi.khimani@ecosmob.com",
        subject: "CI/CD Pipeline Automation Report",
        text: "Automation execution completed successfully."
    });

    console.log("Email Sent Successfully");
}

sendMail();