import {
    Router,
} from "express";

import {
    authenticate,
} from "../../middleware/auth.middleware.js";

import {
    voiceUpload,
} from "./voice-upload.middleware.js";

import {
    transcribeVoice,
} from "./voice.controller.js";


const router =
    Router();


router.post(
    "/transcribe",
    authenticate,
    voiceUpload.single("audio"),
    transcribeVoice,
);


export default router;