import bycrypt from "bcryptjs";
import crypto from "crypto";
import mongoose, { model, Schema, Document } from "mongoose";
import { IRole } from "./role.model";
import dayjs from "dayjs";
import Token, { IToken } from "./token.model";

export interface IUser extends Document {
    username: string;
    password: string;
    matchPassword(password: string): boolean | PromiseLike<boolean>;
    email: string;
    avatarseed: number;
    avatarstyle: string;
    roles: IRole[];
    token: IToken;
    validateEmailToken: string | undefined;
    validateEmailExpire: string | undefined;
    getValidateEmailToken(): string;
    resetPasswordToken: string | undefined;
    resetPasswordExpire: string | undefined;
    getResetPasswordToken(): string;
    active: boolean;
}

const UserSchema: Schema = new Schema(
    {
        username: {
            type: String,
            unique: true,
            required: [true, "Can't be blank"],
            index: true,
        },
        password: {
            type: String,
            required: true,
            select: false, // not shown in doc unless specified
            minlength: [8, "Please use minimum of 8 characters"], // TODO: request more secure password
        },
        email: {
            type: String,
            lowercase: true,
            required: [true, "Can't be blank"],
            match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please use a valid address"],
            unique: true,
            index: true,
        },
        avatarseed: {
            type: Number,
            default: 0,
        },
        avatarstyle: {
            type: String,
            default: "identicon",
        },
        token: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Token",
        },
        roles: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Role",
                },
            ],
            default: ["64394f2f1e2213231f85396f"], // role 'user'
        },

        validateEmailToken: String,
        validateEmailExpire: String,
        resetPasswordToken: String,
        resetPasswordExpire: String,

        active: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        toObject: {
            transform: function (doc, ret) {
                delete ret._id;
                delete ret.password;
                delete ret.token;
            },
        },
    }
);

// if user is deleted, delete dependent token as well
UserSchema.pre<IUser>("deleteOne", { document: true, query: false }, async function (next) {
    const token: IToken | null = await Token.findOne({ userId: this.id });
    if (token) await token.deleteOne();
    next();
});

// if a user saves a new password, we encrypt it before saving it
UserSchema.pre<IUser>("save", async function (next: any) {
    if (!this.isModified("password")) {
        return next();
    }

    const salt = await bycrypt.genSalt(10);
    this.password = bycrypt.hashSync(this.password, 10);
    next();
});

UserSchema.methods.matchPassword = async function (password: string) {
    return await bycrypt.compare(password, this.password);
};

UserSchema.methods.getValidateEmailToken = function () {
    const validateEmailToken = crypto.randomBytes(20).toString("hex");
    this.validateEmailToken = crypto.createHash("sha256").update(validateEmailToken).digest("hex");
    this.validateEmailExpire = dayjs().add(1, "day").format();
    return validateEmailToken;
};

UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = dayjs().add(10, "minute").format();
    return resetToken;
};

const User = model<IUser>("User", UserSchema);

export default mongoose.models.User || User;
