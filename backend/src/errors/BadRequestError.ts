import { AppError } from "./AppError.js";

export class BadRequestError extends AppError {
    constructor(message = "Bad request") {
        super(400, message)
    }
}