import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  id: string;
  key: string;
  value: string;
}

const SettingSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const Setting = mongoose.model<ISetting>('Setting', SettingSchema);
