import { Router } from "express";

import {
    createInterview,
    startInterview,
    submitAnswer,
} from "./interview.controller.js";


const router = Router();

router.post(
    "/",
    createInterview
);


router.post(
    "/:sessionId/start",
    startInterview
);


router.post(
    "/:sessionId/answer",
    submitAnswer
);


export default router;