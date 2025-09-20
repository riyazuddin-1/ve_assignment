import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';

const privateKey = process.env.JWT_PRIVATE_KEY;

const Token = {
    create(data) {
        return jwt.sign(
            data, 
            privateKey, 
            {
                expiresIn: process.env.TOKEN_EXPIRY,
            }
        );
    },
    check(token) {
        try {
            const payload = jwt.verify(token, privateKey);
            return {
                valid: true,
                content: payload
            }
        } catch(err) {
            return {
                valid: false,
                content: {
                    name: err.name,
                    message: err.message
                }
            }
        }
    }
};

export default Token;