import multer from "multer";


export const voiceUpload =
    multer({

        storage:
            multer.memoryStorage(),

        limits: {

            fileSize:
                10 * 1024 * 1024,
        },

        fileFilter: (
            _req,
            file,
            callback,
        ) => {

            const allowedTypes = [

                "audio/wav",

                "audio/x-wav",

                "audio/wave",

                "audio/mpeg",

                "audio/mp3",

                "audio/ogg",

                "audio/aac",
            ];


            if (
                allowedTypes.includes(
                    file.mimetype
                )
            ) {

                callback(
                    null,
                    true
                );

                return;
            }


            callback(
                new Error(
                    `Unsupported audio type: ${file.mimetype}`
                )
            );
        },
    });