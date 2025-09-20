import { logError } from "../utils/logger.js";
import UserService from '../services/users.service.js';

class UserController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if(!email || !password) {
                return res.status(401).send("Missing important fields.");
            }

            const token = await UserService.login({
                email,
                password
            });

            res.status(200).json({
                message: "Logged in successfully!",
                token: token
            })
        } catch(err) {
            logError(err, "Login error");
            res.status(500).send("Server error: Failed to login");
        }
    }

    async register(req, res) {
        try {
            const { name, email, password, contact } = req.body;
            if(!name || !email || !password || !contact_number || !contact_code) {
                return res.status(401).send("Missing important fields.");
            }

            await UserService.register({
                name,
                email,
                password,
                contactNumber: contact_number,
                contactCode: contact_code
            });

            res.status(200).json({
                message: "Registered successfully!"
            });
        } catch(err) {
            logError(err, "Registration error");
            res.status(500).send("Failed to register: ", err);
        }
    }

    async dashboard(req, res) {
        try {
            if(!req.user?.user_id) {
                logError("User ID missing from the unpacked data of token, which is mapped to `req.user`.");
                return res.status(401).send("Autorization error: User ID missing.");
            }

            const data = await UserService.dashboard({
                userId: req.user.user_id
            });

            res.status(200).json({
                message: "Information obtained successfully!",
                data: data
            });
        } catch(err) {
            logError(err, "User information fetch for dashboard");
            res.status(500).send("Failed to fetch user data.");
        }
    }

    /**
     * user verification with a special id
     */
    async verify(req, res) {
        try {
            const { code } = req.params;

            if (!code) {
                return res.status(400).send("Verification code is required.");
            }

            const result = await UserService.verify({ userId: code });

            if (!result) {
                return res.status(404).send("User not found or already verified.");
            }

            res.status(200).json({
                message: "User verified successfully."
            });
        } catch (err) {
            logError(err, "User verification error");
            res.status(500).send("Server error: Verification failed.");
        }
    }
}

export default new UserController();