import {
    Request,
    Response,
    NextFunction,
} from "express";

import * as voiceService
    from "./voice.service.js";


export const transcribeVoice = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {

    try {

        const file =
            req.file;


        if (!file) {

            res.status(400).json({

                success: false,

                message:
                    "Audio file is required.",
            });

            return;
        }


        const transcript =
            await voiceService.transcribeAudio(

                file.buffer,

                file.mimetype,
            );


        res.status(200).json({

            success: true,

            transcript,
        });

    } catch (
        error
    ) {

        next(error);
    }
};