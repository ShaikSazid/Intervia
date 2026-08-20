import { Request, Response, NextFunction } from "express";
import * as retrievalService from "./retrieval.service.js";

export const searchSimilarChunks = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { resumeId, query, topK, minSimilarity } = req.body;

        const result = await retrievalService.searchSimilarChunks({
            resumeId,
            query,
            topK,
            minSimilarity,
        });

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};