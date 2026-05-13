import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
  id: string;
  code: string;
  name: string;
  branch?: string;
  createdAt: Date;

  users: mongoose.Types.ObjectId[];
  experiments: mongoose.Types.ObjectId[];
  exams: mongoose.Types.ObjectId[];
  logs: mongoose.Types.ObjectId[];
}

const SubjectSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  branch: { type: String },

  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  experiments: [{ type: Schema.Types.ObjectId, ref: 'Experiment' }],
  exams: [{ type: Schema.Types.ObjectId, ref: 'Exam' }],
  logs: [{ type: Schema.Types.ObjectId, ref: 'AttendanceLog' }],
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);
