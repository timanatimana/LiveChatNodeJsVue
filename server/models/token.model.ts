import { model, Schema, Document } from "mongoose";

export interface IToken extends Document {
    userId: string;
    token: string;
    refreshToken: string;
}

const TokenSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    token: {
        type: String,
        default: "",
    },
    refreshToken: {
        type: String,
        default: "",
    },
});

const Token = model<IToken>("Token", TokenSchema);

export default Token;
