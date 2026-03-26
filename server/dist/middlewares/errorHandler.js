"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const tsoa_1 = require("tsoa");
const AppError_1 = require("../common/errors/AppError");
const logger_1 = __importDefault(require("../config/logger"));
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    logger_1.default.error({
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
        method: req.method,
        path: req.originalUrl
    });
    if (err instanceof tsoa_1.ValidateError) {
        res.status(400).json({
            message: {
                type: "Field validation",
                fields: err.fields,
            },
            status_code: 400,
        });
        return;
    }
    if (err instanceof AppError_1.AppError) {
        res.status(err.statusCode).json({
            message: err.message,
            status_code: err.statusCode ? err.statusCode : 400
        });
        return;
    }
    res.status(500).json({
        status_code: 500,
        message: err instanceof Error ? err.message : "Unknown internal server error",
    });
}
//# sourceMappingURL=errorHandler.js.map