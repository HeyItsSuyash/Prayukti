import mongoose, { Document, Schema } from 'mongoose';

export interface IExperimentActivity extends Document {
  id: string;
  userId: mongoose.Types.ObjectId;
  experimentId: mongoose.Types.ObjectId;
  resultGenerated: boolean;
  score?: number;
  lastRunAt: Date;
}

const ExperimentActivitySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  experimentId: { type: Schema.Types.ObjectId, ref: 'Experiment', required: true },
  resultGenerated: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  lastRunAt: { type: Date, default: Date.now },
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const ExperimentActivity = mongoose.model<IExperimentActivity>('ExperimentActivity', ExperimentActivitySchema);
