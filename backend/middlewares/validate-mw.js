import AppError from "../utils/app-error.js";

export const validate = (schema, source = "body") => (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
        const details = result.error.issues.map((i) => ({
            field: i.path.join("."),
            issue: i.message,
        }))
        return next(AppError.badRequest("VALIDATION_ERROR", "Invalid request data", details));
    }

    req.validated ??= {};
    req.validated[source] = result.data;
    next();
}