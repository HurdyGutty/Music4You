import AppError from '../utils/app-error.js';
import User from '../models/user.js';
import Playlist from '../models/playlist.js';
import { verifyAccessToken } from '../services/auth-s.js';

export async function protect(req, res, next) {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token || token.length < 10) {
            throw AppError.unauthorized('NO_TOKEN','You are not logged in! Please log in to get access.');
        }

        const decoded = verifyAccessToken(token);
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            throw AppError.unauthorized('USER_NOT_FOUND','The user belonging to this token does no longer exist.');
        }
        req.user = currentUser;
        next();
    } catch(error) {
        return res.error(error);
    }
}

export async function checkPlaylistOwnership(req, res, next) {
    try {
        const playlistId = req.params.id;
        const playlist = await Playlist.findById(playlistId);
        if (!playlist)
            throw AppError.notFound("PLAYLIST_NOT_FOUND", 'Playlist not found');

        if (playlist.user_id !== req.user.id)
            throw AppError.forbidden("FORBIDDEN", 'You do not have permission to perform this action');

        next();
    } catch (error) {
        return res.error(error);
    }
}

export async function checkPlaylistPublic(req, res, next) {
    try {
        const playlistId = req.params.id;
        const playlist = await Playlist.findById(playlistId);
        if (!playlist)
            throw AppError.notFound("PLAYLIST_NOT_FOUND", 'Playlist not found');
        if (!playlist.is_public) {

            let token;
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
                token = req.headers.authorization.split(' ')[1];
            }
            if (!token || token.length < 10) {
                throw AppError.forbidden("FORBIDDEN", 'You do not have permission to perform this action');
            }

            const decoded = verifyAccessToken(token);
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                throw AppError.unauthorized('USER_NOT_FOUND','The user belonging to this token does no longer exist.');
            }
            
            if (playlist.user_id !== currentUser.id)
                throw AppError.forbidden("FORBIDDEN", 'You do not have permission to perform this action');

            req.user = currentUser;
            return next();
        }
        next();
    } catch (error) {
        return res.error(error);
    }
}

export function restrictTo(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.error(
                AppError.forbidden("FORBIDDEN", 'You do not have permission to perform this action')
            );
        }
        next();
    }
}

export async function optionalAuth(req, res, next) {
    try {
        
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if(token) {
            try {
                const decoded = verifyAccessToken(token);
                const currentUser = await User.findById(decoded.id);
                if (currentUser) req.user = currentUser;
            } catch (error) {
                
            }
        }

        next();
    } catch (error) {
        next();
    }
}