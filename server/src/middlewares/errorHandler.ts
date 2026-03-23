import { Request, Response, NextFunction } from "express";
import { ValidateError} from "tsoa";
import { AppError } from "../common/errors/AppError";
import logger from "../config/logger";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction){
    if(res.headersSent){
        return next(err);
    }

    logger.error({
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
        method: req.method,
        path: req.originalUrl
    });

    if(err instanceof ValidateError){
        res.status(400).json({
            message: {
                type: "Field validation",
                fields: err.fields,
            },
            status_code: 400,
        });
        return
    }
    if(err instanceof AppError){
        res.status(err.statusCode).json({
            message: err.message,
            status_code: err.statusCode ? err.statusCode: 400
        });
        return
    }

    res.status(500).json({
        status_code: 500,
        message: err instanceof Error ? err.message: "Unknown internal server error",
    });
}