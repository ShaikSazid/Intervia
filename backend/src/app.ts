import express from "express";

import { router as userRoute }
    from "./modules/auth/auth.routes.js";

import { router as resumeRoutes }
    from "./modules/resume/resume.routes.js";

import retrievalRoutes
    from "./modules/retrieval/retrieval.routes.js";

import interviewRoutes
    from "./modules/interview/interview.routes.js";

import { errorHandler }
    from "./middleware/error.middleware.js";

import cookieParser from "cookie-parser";

import cors from "cors";


const app = express();


/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
    cors({

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
        ],

        credentials: true,

        origin:
            "http://localhost:5173",
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

app.use(
    "/api/auth",
    userRoute
);


app.use(
    "/api/resumes",
    resumeRoutes
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