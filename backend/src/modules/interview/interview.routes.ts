import {
    Router,
} from "express";

import {
    startInterview,
    submitTurn,
    getInterview,
    endInterview,
} from "./interview.controller.js";


const router =
    Router();


/*
|--------------------------------------------------------------------------
| Start Interview
|--------------------------------------------------------------------------
|
| POST /api/interviews
|
*/

router.post(
    "/",
    startInterview
);


/*
|--------------------------------------------------------------------------
| Get Interview Session
|--------------------------------------------------------------------------
|
| GET /api/interviews/:sessionId
|
*/

router.get(
    "/:sessionId",
    getInterview
);


/*
|--------------------------------------------------------------------------
| Submit Interview Turn
|--------------------------------------------------------------------------
|
| POST /api/interviews/:sessionId/turns
|
*/

router.post(
    "/:sessionId/turns",
    submitTurn
);


/*
|--------------------------------------------------------------------------
| End Interview
|--------------------------------------------------------------------------
|
| POST /api/interviews/:sessionId/end
|
*/

router.post(
    "/:sessionId/end",
    endInterview
);


export default router;