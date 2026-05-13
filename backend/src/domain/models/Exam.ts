import mongoose, { Document, Schema } from 'mongoose';

export enum ExamStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export interface IExam extends Document {
  id: string;
  title: string;
  subjectId: mongoose.Types.ObjectId;
  experimentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  durationMinutes: number;
  startTime: Date;
  status: ExamStatus;
  createdAt: Date;

  students: mongoose.Types.ObjectId[];
}

const ExamSchema: Schema = new Schema({
  title: { type: String, required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  experimentId: { type: Schema.Types.ObjectId, ref: 'Experiment', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  durationMinutes: { type: Number, required: true },
  startTime: { type: Date, required: true },
  status: { type: String, enum: Object.values(ExamStatus), default: ExamStatus.UPCOMING },

  students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const Exam = mongoose.model<IExam>('Exam', ExamSchema);
