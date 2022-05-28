import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String},
  email: { type: String},
  password: { type: String },
  grades: [
    {
      grade: { type: Number },
      subject: { type: String },
      date: { timestamps: true, type: Date }
    }
  ],
});
export default mongoose.model("user", userSchema)
