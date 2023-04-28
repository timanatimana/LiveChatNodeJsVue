import mongoose, { model, Schema, Document } from "mongoose";

export interface IChatSession extends Document {
    active: Boolean;
    closedAt: string;
}

const ChatSessionSchema: Schema = new Schema(
    {
        active: {
            type: String,
            default: true, // on creation session is set active
        },
        closedAt: String,
    },
    {
        timestamps: true,
        toObject: {
            // include id
            virtuals: true,
            versionKey: false,
            transform: function (doc, ret) {
                delete ret._id;
                delete ret.active;
                delete ret.closedAt;
                delete ret.updated;
            },
        },
    }
);

const ChatSession = model<IChatSession>("ChatSession", ChatSessionSchema);

export default ChatSession;
