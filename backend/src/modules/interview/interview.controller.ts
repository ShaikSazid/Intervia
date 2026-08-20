import {
    Request,
    Response,
    NextFunction,
} from "express";

import * as interviewService
    from "./interview.service.js";

import * as interviewEngineService
    from "../interview-engine/interview-engine.service.js";


interface InterviewSessionParams {
    sessionId: string;
}


/*
|--------------------------------------------------------------------------
| Create Interview
|--------------------------------------------------------------------------
|
| POST /api/interviews
|
*/

export const createInterview = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const interview =
            await interviewService.createInterview(
                req.body
            );

        res.status(201).json({

            success: true,

            data: interview,

        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Start Interview
|--------------------------------------------------------------------------
|
| POST /api/interviews/:sessionId/start
|
*/

export const startInterview = async (
    req: Request<InterviewSessionParams>,
    res: Response,
    next: NextFunction
) => {

    try {

        const sessionId =
            req.params.sessionId;


        const result =
            await interviewEngineService
                .startInterview(
                    sessionId
                );


        res.status(200).json({

            success: true,

            data: result,

        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Submit Answer
|--------------------------------------------------------------------------
|
| POST /api/interviews/:sessionId/answer
|
*/

export const submitAnswer = async (
    req: Request<InterviewSessionParams>,
    res: Response,
    next: NextFunction
) => {

    try {

        const sessionId =
            req.params.sessionId;


        const {
            answer,
        } = req.body;


        if (
            typeof answer !== "string" ||
            answer.trim().length === 0
        ) {

            throw new Error(
                "Answer is required."
            );
        }


        const result =
            await interviewEngineService
                .submitAnswer({

                    sessionId,

                    answer,
                });


        res.status(200).json({

            success: true,

            data: result,

        });

    } catch (error) {

        next(error);
    }
};