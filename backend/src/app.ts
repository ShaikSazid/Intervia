import express from "express";

import { router as userRoute }
    from "./modules/auth/auth.routes.js";

import { router as resumeRoutes }
    from "./modules/resume/resume.routes.js";

import voiceRoutes
    from "./modules/voice/voice.routes.js";

import retrievalRoutes
    from "./modules/retrieval/retrieval.routes.js";

import interviewRoutes
    from "./modules/interview/interview.routes.js";

import { errorHandler }
    from "./middleware/error.middleware.js";

import cookieParser from "cookie-parser";

import cors from "cors";
import { env } from "./config/env.js";


const app = express();


/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
    env.FRONTEND_URL
];


app.use(
    cors({

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH",
            "OPTIONS",
        ],

        credentials: true,

        origin: (
            origin,
            callback
        ) => {

            // Allow requests such as server-to-server requests
            // where the browser does not send an Origin header.
            if (!origin) {
                return callback(
                    null,
                    true
                );
            }


            if (
                allowedOrigins.includes(
                    origin
                )
            ) {

                return callback(
                    null,
                    true
                );
            }


            return callback(
                new Error(
                    `CORS origin not allowed: ${origin}`
                )
            );
        },
    })
);


app.use(
    express.json()
);


app.use(
    cookieParser()
);


/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.get(
    "/health",
    (_req, res) => {
        res.status(200).json({
            status: "ok",
        });
    }
);

app.use(
    "/api/auth",
    userRoute
);


app.use(
    "/api/resumes",
    resumeRoutes
);

app.use(
    "/api/voice",
    voiceRoutes
);

app.use(
    "/api/retrieval",
    retrievalRoutes
);


app.use(
    "/api/interviews",
    interviewRoutes
);


/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use(
    errorHandler
);


export default app;