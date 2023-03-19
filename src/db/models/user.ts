import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

export interface IMessage extends mongoose.Document {
  title: string;
  text: string;
}

export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  activate?: boolean;
  theme?: string;
  messages?: Array<IMessage>;
  password: string;
}

export const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  company: { type: String, required: true },
  activate: Boolean,
  theme: String,
  messages: Array,
  password: { type: String, required: true }
});

export default mongoose.model<IUser>('UserModel', UserSchema);
