import { create } from 'zustand';

interface Event {
  id: number;
  title: string;
  date: string;
  price: number;
  sold: number;
}

interface Store {
  events: Event[];
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  userAddress: string | null;
  setUserAddress: (address: string | null) => void;
  userRole: 'guest' | 'customer' | 'seller' | 'admin';
  setUserRole: (role: 'guest' | 'customer' | 'seller' | 'admin') => void;
}

export const useStore = create<Store>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  userAddress: null,
  setUserAddress: (address) => set({ userAddress: address }),
  userRole: 'guest',
  setUserRole: (role) => set({ userRole: role }),
}));
