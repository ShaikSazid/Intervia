export interface LLMErrorDetails {
    status?: number;
    code?: string;
    type?: string;
    message: string;
    retryAfterSeconds?: number;
    isRateLimitError: boolean;
    isQuotaError: boolean;
}

export const parseLLMError = (
    error: unknown
): LLMErrorDetails => {

    const candidate =
        error as Record<string, any> | null;


    const status =
        typeof candidate?.status === "number"
            ? candidate.status
            : undefined;


    const code =
        typeof candidate?.code === "string"
            ? candidate.code
            : undefined;


    const type =
        typeof candidate?.type === "string"
            ? candidate.type
            : undefined;


    const message =
        typeof candidate?.message === "string"
            ? candidate.message
            : error instanceof Error
                ? error.message
                : "Unknown LLM error";


    /*
     * OpenAI-compatible clients may expose headers.
     */

    let retryAfterSeconds:
        number | undefined;


    const headers =
        candidate?.headers;


    if (headers) {

        let retryAfter:
            string | null = null;


        try {

            if (
                typeof headers.get === "function"
            ) {

                retryAfter =
                    headers.get(
                        "retry-after"
                    );
            }

        } catch {
            // Ignore header parsing failures.
        }


        if (!retryAfter) {

            retryAfter =
                headers["retry-after"]
                ??
                headers["Retry-After"]
                ??
                null;
        }


        if (retryAfter) {

            const parsed =
                Number(
                    retryAfter
                );


            if (
                Number.isFinite(parsed)
            ) {

                retryAfterSeconds =
                    parsed;
            }
        }
    }


    const normalizedMessage =
        message.toLowerCase();


    const isRateLimitError =
        status === 429 ||
        normalizedMessage.includes(
            "rate limit"
        ) ||
        normalizedMessage.includes(
            "too many requests"
        );


    const isQuotaError =
        normalizedMessage.includes(
            "quota"
        ) ||
        normalizedMessage.includes(
            "resource exhausted"
        ) ||
        normalizedMessage.includes(
            "daily"
        );


    return {

        status,

        code,

        type,

        message,

        retryAfterSeconds,

        isRateLimitError,

        isQuotaError,
    };
};


/*
 * ============================================================
 * Human-readable LLM error
 * ============================================================
 */

export const formatLLMError = (
    agentName: string,
    error: unknown
): Error => {

    const details =
        parseLLMError(
            error
        );


    if (
        details.status === 429
    ) {

        let reason =
            "Gemini request was rate-limited or quota was exhausted.";


        if (
            details.isQuotaError
        ) {

            reason =
                "Gemini quota appears to be exhausted.";
        }


        const retryMessage =
            details.retryAfterSeconds !== undefined
                ? ` Retry after approximately ${details.retryAfterSeconds} seconds.`
                : "";


        return new Error(
            `${agentName}: ${reason}${retryMessage} ` +
            `Status: 429. ` +
            `Provider message: ${details.message}`
        );
    }


    if (
        details.status === 401
    ) {

        return new Error(
            `${agentName}: Gemini API key is invalid or missing.`
        );
    }


    if (
        details.status === 403
    ) {

        return new Error(
            `${agentName}: Gemini API access was denied. Check API key, project, and permissions.`
        );
    }


    if (
        details.status === 404
    ) {

        return new Error(
            `${agentName}: Gemini model or endpoint was not found. ` +
            `Provider message: ${details.message}`
        );
    }


    if (
        details.status === 503
    ) {

        return new Error(
            `${agentName}: Gemini service is temporarily unavailable. ` +
            `Retry the request after a short delay. ` +
            `Provider message: ${details.message}`
        );
    }


    return new Error(
        `${agentName}: LLM request failed. ` +
        `Status: ${details.status ?? "unknown"}. ` +
        `Provider message: ${details.message}`
    );
};