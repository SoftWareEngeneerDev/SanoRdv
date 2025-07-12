export interface Patient {
    id: number;
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  password: string;
   address: string;
    birthDate: Date;
  gender: 'Homme' | 'Femme' | 'Autre';
  createdAt?: Date;
  updatedAt?: Date;
  medicalHistory: MedicalEntry[];
  upcomingAppointments: Appointment[];
}

export interface MedicalEntry {
  date: Date;
  description: string;
}

export interface Appointment {
  date: Date;
  time: string;
  doctor: string;
}
