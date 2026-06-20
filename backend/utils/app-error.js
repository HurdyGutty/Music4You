class AppError extends Error {
    constructor({message, statusCode = 500, code = "INTERNAL_ERROR", details, cause }) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;
        if (cause) this.cause = cause;
    }   

    static badRequest(code, message, details) {
        return new AppError({ statusCode: 400, code, message, details });
    }
    static unauthorized(code, message, details) {
        return new AppError({ statusCode: 401, code, message, details })
    }
    static forbidden(code, message, details) {
        return new AppError({ statusCode: 403, code, message, details })
    }
    static notFound(code, message, details) {
        return new AppError({ statusCode: 404, code, message, details })
    }
}

export default AppError;