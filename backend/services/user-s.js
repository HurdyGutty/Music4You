import AppError from '../utils/app-error.js';
import User from '../models/user.js';

export async function getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) throw AppError.notFound('USER_NOT_FOUND', 'User not found');

    delete user.password;
    return user;
    
}