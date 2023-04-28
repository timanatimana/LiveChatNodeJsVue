import jwt from "jsonwebtoken";

const generateSignedToken = (id: string, expiresIn: string, secret: string) => {
    const token = jwt.sign({ id: id }, secret, {
        expiresIn: expiresIn,
    });
    return token;
};

export default generateSignedToken;
