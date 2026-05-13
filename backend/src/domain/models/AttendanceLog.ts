import mongoose, { Document, Schema } from 'mongoose';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  INACTIVE = 'INACTIVE',
  ABSENT = 'ABSENT',
  IN_PROGRESS = 'IN_PROGRESS'
}

export interface IAttendanceLog extends Document {
  id: string;
  userId: mongoose.Types.ObjectId;
  subjectId?: mongoose.Types.ObjectId;
  labId?: string;
  loginTime: Date;
  logoutTime?: Date;
  sessionDuration?: number;
  activityScore?: number;
  status: AttendanceStatus;
  ipAddress?: string;
  date: Date;
  isSuspicious: boolean;
}

const AttendanceLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
  labId: { type: String },
  loginTime: { type: Date, default: Date.now },
  logoutTime: { type: Date },
  sessionDuration: { type: Number, default: 0 },
  activityScore: { type: Number, default: 0 },
  status: { type: String, enum: Object.values(AttendanceStatus), default: AttendanceStatus.IN_PROGRESS },
  ipAddress: { type: String },
  date: { type: Date, default: Date.now },
  isSuspicious: { type: Boolean, default: false },
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const AttendanceLog = mongoose.model<IAttendanceLog>('AttendanceLog', AttendanceLogSchema);
