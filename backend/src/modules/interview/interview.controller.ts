import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    CreateInterviewDto,
} from "./interview.dto.js";

import * as interviewOrchestrator
    from "./interview.orchestrator.js";


interface InterviewSessionParams {

    sessionId: string;
}


/*
|--------------------------------------------------------------------------
| Start Interview Session
|--------------------------------------------------------------------------
|
| POST /api/interviews
|
*/

// export const startInterview = async (
//     req: Request<
//         Record<string, never>,
//         unknown,
//         CreateInterviewDto
//     >,
//     res: Response,
//     next: NextFunction
// ) => {

//     try {

//         const result =
//             await interviewOrchestrator
//                 .startInterviewSession(
//                     req.body
//                 );


//         res.status(201).json({

//             success: true,

//             data: result,
//         });

//     } catch (error) {

//         next(error);
//     }
// };

export const startInterview = async (
    req: Request<
        Record<string, never>,
        unknown,
        CreateInterviewDto
    >,
    res: Response,
    next: NextFunction
) => {

    try {

        console.log(
            "[Interview] Request body:",
            req.body
        );

        console.log(
            "[Interview] resumeId:",
            req.body?.resumeId
        );

        const result =
            await interviewOrchestrator
                .startInterviewSession(
                    req.body
                );

        res.status(201).json({

            success: true,

            data: result,
        });

    } catch (error) {

        console.error(
            "[Interview] Start failed:",
            error
        );

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Submit Interview Turn
|--------------------------------------------------------------------------
|
| POST /api/interviews/:sessionId/turns
|
*/

export const submitTurn = async (
    req: Request<
        InterviewSessionParams,
        unknown,
        {
    turnId: string;

    answer: string;

    inputMode?:
        | "TEXT"
        | "VOICE"
        | "VIDEO";

    questionId?: string;

    startedAt?: string;

    endedAt?: string;

    transcriptId?: string;
}
    >,
    res: Response,
    next: NextFunction
) => {

    try {

        const result =
    await interviewOrchestrator
        .submitInterviewTurn({

            sessionId:
                req.params.sessionId,

            turnId:
                req.body.turnId,

            answer:
                req.body.answer,

            inputMode:
                req.body.inputMode,

            questionId:
                req.body.questionId,

            startedAt:
                req.body.startedAt,

            endedAt:
                req.body.endedAt,

            transcriptId:
                req.body.transcriptId,
        });

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
| Get Interview Session
|--------------------------------------------------------------------------
|
| GET /api/interviews/:sessionId
|
*/

export const getInterview = async (
    req: Request<InterviewSessionParams>,
    res: Response,
    next: NextFunction
) => {

    try {

        const session =
            await interviewOrchestrator
                .getInterviewSession(
                    req.params.sessionId
                );


        res.status(200).json({

            success: true,

            data: session,
        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| End Interview
|--------------------------------------------------------------------------
|
| POST /api/interviews/:sessionId/end
|
*/

export const endInterview = async (
    req: Request<InterviewSessionParams>,
    res: Response,
    next: NextFunction
) => {

    try {

        const session =
            await interviewOrchestrator
                .endInterviewSession(
                    req.params.sessionId
                );


        res.status(200).json({

            success: true,

            data: session,
        });

    } catch (error) {

        next(error);
    }
};