import { Appointment } from '../types';

interface Props {
  appointment: Appointment;
  isNew?: boolean;
}

export default function AppointmentCard({ appointment, isNew }: Props) {
  return (
    <div style={{ ...styles.card, ...(isNew ? styles.newCard : {}) }}>
      <div style={styles.timeBox}>
        <span style={styles.time}>{appointment.startTime}</span>
        <span style={styles.duration}>{appointment.duration} min</span>
      </div>
      <div style={styles.info}>
        <p style={styles.patient}>{appointment.patientName}</p>
        <p style={styles.date}>{appointment.date}</p>
      </div>
      {isNew && <span style={styles.badge}>NEW</span>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: '#fff',
    borderRadius: 10,
    padding: '1rem 1.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    border: '1.5px solid #e8eef6',
    transition: 'all 0.3s',
  },
  newCard: {
    border: '1.5px solid #1a73e8',
    background: '#f0f6ff',
    animation: 'fadeIn 0.4s ease',
  },
  timeBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 70,
    background: '#1a73e8',
    borderRadius: 8,
    padding: '0.5rem',
    color: '#fff',
  },
  time: { fontWeight: 700, fontSize: '1.1rem' },
  duration: { fontSize: '0.75rem', opacity: 0.85 },
  info: { flex: 1 },
  patient: { margin: 0, fontWeight: 600, fontSize: '1rem', color: '#222' },
  date: { margin: 0, fontSize: '0.85rem', color: '#666', marginTop: 2 },
  badge: {
    background: '#1a73e8',
    color: '#fff',
    borderRadius: 4,
    padding: '2px 8px',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
};
