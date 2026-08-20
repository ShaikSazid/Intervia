import { Router } from "express";

import * as resumeController from "./resume.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = Router();

router.post("/upload", authenticate, upload.single("resume"), resumeController.uploadResume)

export { router };