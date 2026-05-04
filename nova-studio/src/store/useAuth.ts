import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AuthState {
  customer: Customer | null;
  token: string | null;
  isLoggedIn: boolean;
  setAuth: (customer: Customer, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      customer: null,
      token: null,
      isLoggedIn: false,
      setAuth: (customer: Customer, token: string) => set({ customer, token, isLoggedIn: true }),
      logout: () => set({ customer: null, token: null, isLoggedIn: false }),
    }),
    {
      name: 'nova-customer-auth',
    }
  )
);
