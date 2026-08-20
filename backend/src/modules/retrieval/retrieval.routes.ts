import { Router } from "express";
import * as retrievalController from "./retrieval.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/search", authenticate, retrievalController.searchSimilarChunks);

export default router;