// import { createInterview } from "../modules/interview/interview.service.js";

// import {
//     startInterview,
//     submitAnswer,
// } from "../modules/interview-engine/interview-engine.service.js";

// import {
//     InterviewType,
// } from "../modules/interview/interview.enums.js";

// import readline from "node:readline/promises";

// import {
//     stdin as input,
//     stdout as output,
// } from "node:process";


// const rl =
//     readline.createInterface({
//         input,
//         output,
//     });


// const RESUME_ID =
//     "cmt13ftc00001r2t50ohljuwr";

// const TARGET_ROLE =
//     "Backend Developer";

// const DURATION_MINUTES =
//     30;

// const LANGUAGE =
//     "English";


// const main = async () => {

//     try {

//         console.log(
//             "\n========================================"
//         );

//         console.log(
//             "           AI INTERVIEW"
//         );

//         console.log(
//             "========================================\n"
//         );

//         console.log(
//             "Creating interview session...\n"
//         );


//         const interview =
//             await createInterview({

//                 resumeId:
//                     RESUME_ID,

//                 targetRole:
//                     TARGET_ROLE,

//                 interviewType:
//                     InterviewType.TECHNICAL,

//                 durationMinutes:
//                     DURATION_MINUTES,

//                 language:
//                     LANGUAGE,
//             });


//         console.log(
//             `Session created: ${interview.id}\n`
//         );

//         console.log(
//             "Starting interview...\n"
//         );


//         const startResult =
//             await startInterview(
//                 interview.id
//             );

//         if (
//             !startResult.question
//         ) {

//             throw new Error(
//                 "Interview did not generate the first question."
//             );
//         }


//         console.log(
//             `AI: ${startResult.question.question}\n`
//         );

//         while (true) {

//             /*
//              * Candidate answer
//              */

//             const answer =
//                 await rl.question(
//                     "You: "
//                 );


//             /*
//              * Ignore empty answers
//              */

//             if (
//                 answer.trim().length === 0
//             ) {

//                 console.log(
//                     "Please provide an answer.\n"
//                 );

//                 continue;
//             }

//             const result =
//                 await submitAnswer({

//                     sessionId:
//                         interview.id,

//                     answer:
//                         answer.trim(),
//                 });

//             if (
//                 result.interviewCompleted
//             ) {

//                 console.log(
//                     "\n========================================"
//                 );

//                 console.log(
//                     "        INTERVIEW COMPLETED"
//                 );

//                 console.log(
//                     "========================================\n"
//                 );

//                 break;
//             }

//             if (
//                 !result.nextQuestion
//             ) {

//                 throw new Error(
//                     "Interview engine did not return the next question."
//                 );
//             }


//             console.log(
//                 `\nAI: ${result.nextQuestion.question}\n`
//             );
//         }


//     } catch (error) {

//         console.log(
//             "\n========================================"
//         );

//         console.log(
//             "        INTERVIEW FAILED"
//         );

//         console.log(
//             "========================================\n"
//         );


//         if (
//             error instanceof Error
//         ) {

//             console.error(
//                 error.message
//             );

//             if (error.stack) {

//                 console.error(
//                     "\nStack trace:\n"
//                 );

//                 console.error(
//                     error.stack
//                 );
//             }

//         } else {

//             console.error(
//                 error
//             );
//         }

//     } finally {

//         rl.close();
//     }
// };

// main();