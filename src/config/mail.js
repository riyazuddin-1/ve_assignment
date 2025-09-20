import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE,
    host: process.env.MAILER_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAILER_UID,
        pass: process.env.MAILER_PASS
    }
})

export {transporter};