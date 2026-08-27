import { openai } from "../lib/openai.js";

try {
    const response =
        await openai.chat.completions.create({
            model: "gemini-2.5-flash",

            messages: [
                {
                    role: "user",
                    content: "Say hello in one sentence.",
                },
            ],
        });

    console.log(
        response.choices[0]?.message?.content
    );
} catch (error) {
    console.error(error);
}