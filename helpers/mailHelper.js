import nodemailer from 'nodemailer';
const EMAIL_USER = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.PASSWORD;
const PANEL = process.env.PANEL_URL;

export const mailSender = (to, token) => {
    const transporter = nodemailer.createTransport({
        host: 'admin.askaastro.com',
        port: 465,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASSWORD
        }
    });

    const subject = 'Forgot Password';
    let emailHtml = `
    <h1 style="text-align: center;">Forgot Password</h1>
    <br/>
    <p>You are requested to reset password. Please <a href="${PANEL}/resetPassword?id=${token}"><b>Click Here </b></a>to reset password.</p>
    <br/>.
    `;
    const mailOptions = {
        from: `Astro <${EMAIL_USER}>`,
        to,
        subject,
        text: subject,
        html: emailHtml
    };
    return transporter.sendMail(mailOptions)
}