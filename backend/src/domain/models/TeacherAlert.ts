import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacherAlert extends Document {
  id: string;
  studentId: mongoose.Types.ObjectId;
  message: string;
  resolved: boolean;
  createdAt: Date;
}

const TeacherAlertSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  resolved: { type: Boolean, default: false },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const TeacherAlert = mongoose.model<ITeacherAlert>('TeacherAlert', TeacherAlertSchema);
