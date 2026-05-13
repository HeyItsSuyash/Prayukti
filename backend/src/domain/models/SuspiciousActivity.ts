import mongoose, { Document, Schema } from 'mongoose';

export interface ISuspiciousActivity extends Document {
  id: string;
  userId: mongoose.Types.ObjectId;
  activity: string;
  severity: string;
  createdAt: Date;
}

const SuspiciousActivitySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  activity: { type: String, required: true },
  severity: { type: String, default: 'low' },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const SuspiciousActivity = mongoose.model<ISuspiciousActivity>('SuspiciousActivity', SuspiciousActivitySchema);
