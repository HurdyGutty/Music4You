import { successResponse } from "../utils/response.js"
import AppError from "../utils/app-error.js"

export default function responseFormatter() {
    return (req, res, next) => {
        res.ok = (data, meta = {}) => successResponse(res, data, 200, meta);
        res.created = (data, meta = {}) => successResponse(res, data, 201, meta);
        res.noContent = () => successResponse(res, null, 204);
        res.list = (items, meta = {}) => successResponse(res, items, 200, meta);
        res.error = (error, statusCode = 500) => {
            if (!(error instanceof AppError)) {
                console.error(error);
                error = new AppError(error.message || 'Internal Server Error', statusCode, error.details || null);
            }
            return next(error);
        };

        next();
    };
}