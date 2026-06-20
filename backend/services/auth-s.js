import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AppError from '../utils/app-error.js';
import User from '../models/user.js';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 12;
const ACCESS_TOKEN_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';

const signAccessToken = (userId) => {
    return jwt.sign(
        { id: userId, type: 'access' }, 
        process.env.JWT_SECRET, 
        {
            expiresIn: ACCESS_TOKEN_EXPIRES
        }
    );
}
const createTokenResponse = (user, expires = ACCESS_TOKEN_EXPIRES) => {
    const accessToken = signAccessToken(user.id);
    delete user.password;
    return {user, accessToken, accessTokenExpiresIn: expires};
}
export async function signup(userData) {
    const existingUser = await User.findByEmail(userData.email);

    if (existingUser) {
        throw AppError.badRequest('USER_EXISTS', 'User with this email already exists');
    }

    delete userData.passwordConfirm;
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
    const newUser = await User.create({ ...userData, password: hashedPassword});
    return createTokenResponse(newUser);
}

export async function login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) throw AppError.unauthorized('INVALID_CREDENTIALS', 'Incorrect email or password');
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) throw AppError.unauthorized('INVALID_CREDENTIALS', 'Incorrect email or password');

    return createTokenResponse(user);
}

export function verifyAccessToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'access'){
            throw AppError.unauthorized('INVALID_TOKEN', 'Incorrect token type');
        }
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') 
            throw AppError.unauthorized('TOKEN_EXPIRED', 'Access token has expired');

        if (error.name === "JsonWebTokenError")
            throw AppError.unauthorized('INVALID_TOKEN', 'Invalid access token');
        
        throw error;
    }
}