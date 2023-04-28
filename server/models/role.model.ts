import { model, Schema, Document } from "mongoose";

export interface IRole extends Document {
    name: string;
    description: string;
}

const RoleSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
});

const Role = model<IRole>("Role", RoleSchema);

export default Role;
