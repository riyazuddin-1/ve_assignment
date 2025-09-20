import User from '../models/users.model.js';
import Hash from './hashing.service.js';
import Token from './jwt.service.js';

class UserService {
    async login({ email, password }) {
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("Invalid email or password.");
        }

        const isValidPassword = await Hash.compare(password, user.password);

        if (!isValidPassword) {
            throw new Error("Invalid email or password.");
        }

        const userData = {
            user_id: user._id,
            name: user.name,
            email: user.email,
            verified: user.verified
        };

        // Create token with essential user data
        const token = Token.create(userData);

        return {
            user,
            token
        };
    }

    async register({ name, email, password, contactNumber, contactCode }) {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new Error("Email already registered.");
        }

        const hashedPassword = await Hash.create(password);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            contact: {
                country_code: contactCode,
                number: contactNumber
            },
            tenants: [],
            verified: false, // default
        });

        await newUser.save();
    }

    async dashboard({ userId }) {
        const user = await User.findById(userId).select('-password');

        if (!user) {
            throw new Error("User not found.");
        }

        return user;
    }

    async verify({ userId }) {
        const user = await User.findById(userId);
    
        if (!user) {
            return null; // User not found
        }
    
        if (user.verified) {
            return null; // Already verified
        }
    
        user.verified = true;
        await user.save();
    
        return true;
    }
}

export default new UserService();