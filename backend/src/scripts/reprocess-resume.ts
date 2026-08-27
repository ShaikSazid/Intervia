import { resumeService } from "../modules/resume/resume.service.js";

const resumeId =
    "cmt13ftc00001r2t50ohljuwr";

try {

    const result =
        await resumeService.reprocessResumeChunks(
            resumeId
        );

    console.log(
        JSON.stringify(
            result,
            null,
            2
        )
    );

} catch (error) {

    console.error(
        "Resume reprocessing failed:"
    );

    console.error(error);

    process.exit(1);
}