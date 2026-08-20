import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
    return bcrypt.hash(password, 12);
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<Boolean> => {
    return bcrypt.compare(password, hashedPassword);
}