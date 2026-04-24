import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../lib/api';
import { AuthState, Doctor, BookingFormValues } from '../types';

const d = new Date();
const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const bookingSchema = z.object({
  patientName: z.string().min(2, 'Patient name must be at least 2 characters'),
  doctorId: z.string().min(1, 'Please select a doctor'),
  date: z.string().min(1, 'Date is required').refine((d) => d >= today, {
    message: 'Date must not be in the past',
  }),
  startTime: z.string().min(1, 'Start time is required'),
  duration: z.coerce.number().refine((n): n is 15 | 30 | 45 | 60 => [15, 30, 45, 60].includes(n), {
    message: 'Select a valid duration',
  }),
});

const addDoctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AddDoctorValues = z.infer<typeof addDoctorSchema>;
type Tab = 'booking' | 'doctors';

interface Props {
  auth: AuthState;
  onLogout: () => void;
}

export default function AdminPage({ auth, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('booking');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [success, setSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [doctorSuccess, setDoctorSuccess] = useState('');
  const [doctorError, setDoctorError] = useState('');

  const bookingForm = useForm<BookingFormValues>({ resolver: zodResolver(bookingSchema) });
  const doctorForm = useForm<AddDoctorValues>({ resolver: zodResolver(addDoctorSchema) });

  const loadDoctors = () =>
    api.get<Doctor[]>('/appointments/doctors', auth.token).then(setDoctors).catch(() => setDoctors([]));

  useEffect(() => { loadDoctors(); }, [auth.token]);

  const onBookingSubmit = async (values: BookingFormValues) => {
    setSuccess(''); setSubmitError('');
    try {
      await api.post('/appointments', values, auth.token);
      setSuccess('Appointment booked successfully!');
      bookingForm.reset();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to book appointment');
    }
  };

  const onAddDoctor = async (values: AddDoctorValues) => {
    setDoctorSuccess(''); setDoctorError('');
    try {
      const doc = await api.post<Doctor>('/doctors', values, auth.token);
      setDoctorSuccess(`Dr. ${doc.name} added successfully!`);
      doctorForm.reset();
      loadDoctors();
    } catch (err) {
      setDoctorError(err instanceof Error ? err.message : 'Failed to add doctor');
    }
  };

  const be = bookingForm.formState.errors;
  const de = doctorForm.formState.errors;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>ClinicFlow — Admin</h1>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{auth.user.name}</span>
          <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      {/* Tab bar */}
      <div style={styles.tabBar}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'booking' ? styles.tabActive : {}) }}
          onClick={() => { setActiveTab('booking'); setSuccess(''); setSubmitError(''); }}
        >
          Book Appointment
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'doctors' ? styles.tabActive : {}) }}
          onClick={() => { setActiveTab('doctors'); setDoctorSuccess(''); setDoctorError(''); }}
        >
          Manage Doctors ({doctors.length})
        </button>
      </div>

      <main style={styles.main}>

        {/* ── BOOKING TAB ── */}
        {activeTab === 'booking' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Book Appointment</h2>

            {success && <div style={styles.successMsg}>{success}</div>}
            {submitError && <div style={styles.errorMsg}>{submitError}</div>}

            <form onSubmit={bookingForm.handleSubmit(onBookingSubmit)} style={styles.form} noValidate>
              <div style={styles.field}>
                <label style={styles.label}>Patient Name *</label>
                <input
                  {...bookingForm.register('patientName')}
                  style={{ ...styles.input, ...(be.patientName ? styles.inputError : {}) }}
                  placeholder="e.g. John Doe"
                />
                {be.patientName && <span style={styles.fieldError}>{be.patientName.message}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Doctor *</label>
                <select
                  {...bookingForm.register('doctorId')}
                  style={{ ...styles.input, ...(be.doctorId ? styles.inputError : {}) }}
                >
                  <option value="">Select a doctor…</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>{doc.name}</option>
                  ))}
                </select>
                {be.doctorId && <span style={styles.fieldError}>{be.doctorId.message}</span>}
                {doctors.length === 0 && (
                  <span style={styles.hint}>No doctors yet — add one in the Manage Doctors tab.</span>
                )}
              </div>

              <div style={styles.row}>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Date *</label>
                  <input
                    type="date"
                    {...bookingForm.register('date')}
                    min={today}
                    style={{ ...styles.input, ...(be.date ? styles.inputError : {}) }}
                  />
                  {be.date && <span style={styles.fieldError}>{be.date.message}</span>}
                </div>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Start Time *</label>
                  <input
                    type="time"
                    {...bookingForm.register('startTime')}
                    style={{ ...styles.input, ...(be.startTime ? styles.inputError : {}) }}
                  />
                  {be.startTime && <span style={styles.fieldError}>{be.startTime.message}</span>}
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Duration *</label>
                <select
                  {...bookingForm.register('duration')}
                  style={{ ...styles.input, ...(be.duration ? styles.inputError : {}) }}
                >
                  <option value="">Select duration…</option>
                  {[15, 30, 45, 60].map((n) => (
                    <option key={n} value={n}>{n} minutes</option>
                  ))}
                </select>
                {be.duration && <span style={styles.fieldError}>{be.duration.message}</span>}
              </div>

              <button type="submit" disabled={bookingForm.formState.isSubmitting} style={styles.submitBtn}>
                {bookingForm.formState.isSubmitting ? 'Booking…' : 'Book Appointment'}
              </button>
            </form>
          </div>
        )}

        {/* ── DOCTORS TAB ── */}
        {activeTab === 'doctors' && (
          <div style={styles.twoCol}>
            {/* Add doctor form */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Add New Doctor</h2>

              {doctorSuccess && <div style={styles.successMsg}>{doctorSuccess}</div>}
              {doctorError && <div style={styles.errorMsg}>{doctorError}</div>}

              <form onSubmit={doctorForm.handleSubmit(onAddDoctor)} style={styles.form} noValidate>
                <div style={styles.field}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    {...doctorForm.register('name')}
                    style={{ ...styles.input, ...(de.name ? styles.inputError : {}) }}
                    placeholder="e.g. Dr. Priya Sharma"
                  />
                  {de.name && <span style={styles.fieldError}>{de.name.message}</span>}
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    {...doctorForm.register('email')}
                    style={{ ...styles.input, ...(de.email ? styles.inputError : {}) }}
                    placeholder="doctor@clinic.com"
                  />
                  {de.email && <span style={styles.fieldError}>{de.email.message}</span>}
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Password *</label>
                  <input
                    type="password"
                    {...doctorForm.register('password')}
                    style={{ ...styles.input, ...(de.password ? styles.inputError : {}) }}
                    placeholder="Min. 6 characters"
                  />
                  {de.password && <span style={styles.fieldError}>{de.password.message}</span>}
                </div>

                <button type="submit" disabled={doctorForm.formState.isSubmitting} style={styles.submitBtn}>
                  {doctorForm.formState.isSubmitting ? 'Adding…' : 'Add Doctor'}
                </button>
              </form>
            </div>

            {/* Doctors list */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Current Doctors</h2>
              {doctors.length === 0 ? (
                <p style={{ color: '#888', fontSize: '0.9rem' }}>No doctors added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {doctors.map((doc) => (
                    <div key={doc._id} style={styles.doctorRow}>
                      <div style={styles.doctorAvatar}>{doc.name.charAt(0)}</div>
                      <div>
                        <p style={styles.doctorName}>{doc.name}</p>
                        <p style={styles.doctorEmail}>{doc.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f0f4f8', display: 'flex', flexDirection: 'column' },
  header: {
    background: '#1a73e8', color: '#fff', padding: '1rem 2rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  logo: { margin: 0, fontSize: '1.3rem' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userName: { fontSize: '0.95rem' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.2)', color: '#fff',
    border: '1px solid rgba(255,255,255,0.5)', borderRadius: 6,
    padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.875rem',
  },
  tabBar: {
    display: 'flex', background: '#fff',
    borderBottom: '2px solid #e0e8f5', padding: '0 2rem',
  },
  tab: {
    padding: '0.85rem 1.5rem', border: 'none', background: 'none',
    cursor: 'pointer', fontSize: '0.95rem', color: '#666', fontWeight: 500,
    borderBottom: '3px solid transparent', marginBottom: '-2px',
  },
  tabActive: { color: '#1a73e8', borderBottomColor: '#1a73e8', fontWeight: 700 },
  main: { flex: 1, padding: '2rem' },
  twoCol: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem', maxWidth: 900, margin: '0 auto',
  },
  card: {
    background: '#fff', borderRadius: 12, padding: '2rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: 560, margin: '0 auto', width: '100%',
  },
  cardTitle: { margin: '0 0 1.5rem', color: '#222', fontSize: '1.2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  row: { display: 'flex', gap: '1rem' },
  label: { fontWeight: 600, fontSize: '0.875rem', color: '#333' },
  input: {
    padding: '0.65rem 0.8rem', border: '1.5px solid #ddd',
    borderRadius: 8, fontSize: '1rem', outline: 'none', background: '#fff',
  },
  inputError: { borderColor: '#d32f2f' },
  fieldError: { color: '#d32f2f', fontSize: '0.8rem' },
  hint: { color: '#f57c00', fontSize: '0.8rem' },
  submitBtn: {
    padding: '0.8rem', background: '#1a73e8', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: '1rem',
    fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem',
  },
  successMsg: {
    background: '#e6f4ea', color: '#1e7e34', borderRadius: 8,
    padding: '0.75rem 1rem', marginBottom: '1rem', fontWeight: 600,
  },
  errorMsg: {
    background: '#fdecea', color: '#d32f2f', borderRadius: 8,
    padding: '0.75rem 1rem', marginBottom: '1rem', fontWeight: 600,
  },
  doctorRow: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.6rem 0.75rem', background: '#f8faff',
    borderRadius: 8, border: '1px solid #e0e8f5',
  },
  doctorAvatar: {
    width: 38, height: 38, borderRadius: '50%',
    background: '#1a73e8', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '1rem', flexShrink: 0,
  },
  doctorName: { margin: 0, fontWeight: 600, fontSize: '0.95rem', color: '#222' },
  doctorEmail: { margin: 0, fontSize: '0.8rem', color: '#888' },
};
