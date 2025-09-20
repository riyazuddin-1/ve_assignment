import dotenv from 'dotenv';
dotenv.config();

import { transporter } from "../config/mail.js";

const Mail = {
    send({ email, subject, body }) {
        try {
            if(!email || !subject || !body) throw new Error("Missing required for sending mail.");
            let mailOptions = {
                from: process.env.MAILER_UID,
                to: email,
                subject: subject,
                html: body
            }
            
            transporter.sendMail(mailOptions, (error, info)=> {
                if (error) {
                    throw new Error(error);
                }
            })
        } catch(err) {
            throw new Error(err);
        }
    }
};

export default Mail;