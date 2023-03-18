import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  company: String,
  activate: Boolean,
  theme: String,
  messages: Array,
  password: String
});

const User = mongoose.model('User', userSchema);
