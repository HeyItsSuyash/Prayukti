import mongoose, { Document, Schema } from 'mongoose';

export interface IExperiment extends Document {
  id: string;
  slug: string;
  title: string;
  description?: string;
  subjectId: mongoose.Types.ObjectId;
  createdAt: Date;

  exams: mongoose.Types.ObjectId[];
  activities: mongoose.Types.ObjectId[];
}

const ExperimentSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },

  exams: [{ type: Schema.Types.ObjectId, ref: 'Exam' }],
  activities: [{ type: Schema.Types.ObjectId, ref: 'ExperimentActivity' }],
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const Experiment = mongoose.model<IExperiment>('Experiment', ExperimentSchema);
