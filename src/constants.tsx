
import { Doctor } from './types';

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'doc1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    rating: 4.9,
    education: 'MD, Harvard Medical School',
    experience: 15,
    availability: {
      '2025-01-24': ['09:00', '10:00', '14:00'],
      '2025-01-25': ['11:00', '13:00', '15:00'],
    }
  },
  {
    id: 'doc2',
    name: 'Dr. Michael Chen',
    specialty: 'General Medicine',
    rating: 4.8,
    education: 'MD, Johns Hopkins',
    experience: 12,
    availability: {
      '2025-01-24': ['08:00', '12:00'],
      '2025-01-25': ['09:00', '14:00', '17:00'],
    }
  },
  {
    id: 'doc3',
    name: 'Dr. Emily Roberts',
    specialty: 'Pediatrics',
    rating: 4.9,
    education: 'MD, Stanford University',
    experience: 10,
    availability: {
      '2025-01-25': ['10:30', '13:30'],
      '2025-01-26': ['08:30', '16:30'],
    }
  },
  {
    id: 'doc4',
    name: 'Dr. David Kumar',
    specialty: 'Orthopedics',
    rating: 4.7,
    education: 'MD, Yale School of Medicine',
    experience: 18,
    availability: {
      '2025-01-24': ['10:00', '11:00'],
      '2025-01-25': ['12:30', '14:30'],
    }
  }
];

export const STAFF_CREDENTIALS = {
  email: 'staff@clinic.com',
  password: 'staffpassword'
};

export const DOCTOR_CREDENTIALS = {
  email: 'doctor@clinic.com',
  password: 'doctorpassword'
};
