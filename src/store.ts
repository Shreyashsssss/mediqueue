
import { Appointment, User, UserRole, MutationState, TriageLevel } from './types';

class Store {
  private users: User[] = []; // Local cache if needed, but mainly relying on API for auth
  private appointments: Appointment[] = [];
  private currentUser: User | null = null;
  private mutation: MutationState = { isVolumeDoubled: false, isStaffShortage: false };

  constructor() {
    // Restore session if exists
    const activeUser = localStorage.getItem('clinic_active_user');
    if (activeUser) {
      this.currentUser = JSON.parse(activeUser);
      this.refreshAppointments(); // Fetch data on load
    }
  }

  async refreshAppointments() {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        this.appointments = await res.json();
      }
    } catch (e) {
      console.error('Failed to fetch appointments', e);
    }
  }

  save() {
    // No-op for localStorage legacy, but maybe we want to persist session
    if (this.currentUser) {
      localStorage.setItem('clinic_active_user', JSON.stringify(this.currentUser));
    }
  }

  async registerUser(user: Omit<User, 'id' | 'role'>): Promise<User | null> {
    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      role: UserRole.PATIENT
    };

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        return newUser;
      }
    } catch (error) {
      console.error("Registration failed", error);
    }
    return null;
  }

  async login(email: string, password?: string): Promise<User | null> {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const user = await res.json();
        this.currentUser = user;
        localStorage.setItem('clinic_active_user', JSON.stringify(user));
        await this.refreshAppointments(); // Fetch for old user "every time"
        return user;
      }
    } catch (error) {
      console.error("Login failed", error);
    }
    return null;
  }

  // Specific method for staff/doctor login injection (mock/demo)
  setSessionUser(user: User) {
    this.currentUser = user;
    localStorage.setItem('clinic_active_user', JSON.stringify(user));
    this.refreshAppointments();
  }

  async addAppointment(app: Omit<Appointment, 'id' | 'registeredAt'>): Promise<Appointment | null> {
    const newApp: Appointment = {
      ...app,
      id: Math.random().toString(36).substr(2, 9),
      registeredAt: new Date().toISOString()
    };

    // Optimistic update
    this.appointments.push(newApp);

    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
      });
      return newApp;
    } catch (e) {
      console.error("Failed to save appointment", e);
      // Rollback if needed
      this.appointments = this.appointments.filter(a => a.id !== newApp.id);
      return null;
    }
  }

  async removeAppointment(id: string) {
    this.appointments = this.appointments.filter(app => app.id !== id);
    try {
      await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error("Failed to delete appointment", e);
    }
  }

  getAppointments() {
    return this.appointments;
  }

  getSortedAppointments() {
    const weights = {
      [TriageLevel.EMERGENCY]: 4,
      [TriageLevel.CRITICAL]: 3,
      [TriageLevel.INTERMEDIATE]: 2,
      [TriageLevel.NORMAL]: 1,
    };

    return [...this.appointments].sort((a, b) => {
      // Primary sort: Triage Level weight
      const weightA = weights[a.triageLevel] || 0;
      const weightB = weights[b.triageLevel] || 0;

      if (weightB !== weightA) {
        return weightB - weightA;
      }

      // Secondary sort: Triage Score (granular AI score)
      if (b.triageScore !== a.triageScore) {
        return b.triageScore - a.triageScore;
      }

      // Tertiary sort: Arrival Time
      return new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
    });
  }

  getCurrentUser() { return this.currentUser; }
  logout() {
    this.currentUser = null;
    localStorage.removeItem('clinic_active_user');
  }

  setMutation(m: Partial<MutationState>) {
    this.mutation = { ...this.mutation, ...m };
  }
  getMutation() { return this.mutation; }
}

export const clinicStore = new Store();
