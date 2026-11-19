import { InferSchemaType, Schema, model } from 'mongoose';

export const ROLES = ['owner', 'admin', 'member', 'viewer'] as const;
export type Role = (typeof ROLES)[number];

const memberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ROLES, required: true },
  },
  { _id: false },
);

const workspaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [memberSchema], default: [] },
  },
  { timestamps: true },
);

workspaceSchema.index({ 'members.user': 1 });

export type IWorkspace = InferSchemaType<typeof workspaceSchema>;
export const Workspace = model('Workspace', workspaceSchema);