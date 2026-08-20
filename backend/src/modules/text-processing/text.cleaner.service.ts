export const cleanText = (text: string): string => {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/\f/g, "")
        .replace(/\t/g, " ")
        .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "")
        .replace(/[ ]{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};