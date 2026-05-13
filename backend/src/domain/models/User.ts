import mongoose, { Document, Schema } from 'mongoose';

export enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export interface IUser extends Document {
  id: string; // virtual getter from _id
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
  rollNo?: string;
  enrollmentNo?: string;
  branch?: string;
  year?: number;
  semester?: number;
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  assignedSubjects: mongoose.Types.ObjectId[];
  examsCreated: mongoose.Types.ObjectId[];
  examsAssigned: mongoose.Types.ObjectId[];
  attendanceLogs: mongoose.Types.ObjectId[];
  activities: mongoose.Types.ObjectId[];
  alerts: mongoose.Types.ObjectId[];
  suspicious: mongoose.Types.ObjectId[];
  refreshTokens: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: Object.values(Role), default: Role.STUDENT },
  rollNo: { type: String, unique: true, sparse: true },
  enrollmentNo: { type: String },
  branch: { type: String },
  year: { type: Number },
  semester: { type: Number },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  
  assignedSubjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  examsCreated: [{ type: Schema.Types.ObjectId, ref: 'Exam' }],
  examsAssigned: [{ type: Schema.Types.ObjectId, ref: 'Exam' }],
  attendanceLogs: [{ type: Schema.Types.ObjectId, ref: 'AttendanceLog' }],
  activities: [{ type: Schema.Types.ObjectId, ref: 'ExperimentActivity' }],
  alerts: [{ type: Schema.Types.ObjectId, ref: 'TeacherAlert' }],
  suspicious: [{ type: Schema.Types.ObjectId, ref: 'SuspiciousActivity' }],
  refreshTokens: [{ type: Schema.Types.ObjectId, ref: 'RefreshToken' }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const User = mongoose.model<IUser>('User', UserSchema);
