import mongoose, { model, Schema, Document } from "mongoose";
import { IUser } from "./user.model";
import { IChatSession } from "./chatsession.model";

export interface IChatMsg extends Document {
    message: String;
    user: IUser;
    session: IChatSession;
}

const ChatMsgSchema: Schema = new Schema(
    {
        message: String,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        session: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChatSession",
        },
    },
    {
        timestamps: true,
        toObject: {
            // include id
            virtuals: true,
            versionKey: false,
            transform: function (doc, ret) {
                delete ret._id;
                delete ret.session;
                delete ret.updatedAt;
            },
        },
    }
);

const ChatMsg = model<IChatMsg>("ChatMsg", ChatMsgSchema);

export default ChatMsg;
