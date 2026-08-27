import OpenAI from "openai";

import { env } from "../config/env.js";

export const openai = new OpenAI({

    apiKey:
        env.GEMINI_API_KEY,

    baseURL:
        "https://generativelanguage.googleapis.com/v1beta/openai/",
});