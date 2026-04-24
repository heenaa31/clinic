import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  patientName: string;
  doctorId: mongoose.Types.ObjectId;
  date: string;
  startTime: string;
  duration: 15 | 30 | 45 | 60;
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientName: { type: String, required: true, minlength: 2, trim: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    duration: { type: Number, enum: [15, 30, 45, 60], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
