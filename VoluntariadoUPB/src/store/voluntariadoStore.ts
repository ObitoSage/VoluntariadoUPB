import { create } from 'zustand';

export interface Voluntariado {
  id: string;
  titulo: string;
  organizacion: string;
  descripcion: string;
  ubicacion: string;
  fecha: string;
  duracion: string;
  categoria: 'animales' | 'educacion' | 'medio-ambiente' | 'salud' | 'comunidad';
  participantesMaximos: number;
  participantesActuales: number;
  imagen?: string;
  requisitos: string[];
  beneficios: string[];
}

export interface Application {
  id: string;
  title: string;
  organization: string;
  applicationDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'waitlisted';
  location: string;
  description: string;
  time: string;
  date: string;
  image: any; // Para las imágenes locales con require()
}

type VoluntariadoState = {
  voluntariados: Voluntariado[];
  voluntariadoSeleccionado: Voluntariado | null;
  applications: Application[];
  isLoading: boolean;
  setVoluntariados: (voluntariados: Voluntariado[]) => void;
  setVoluntariadoSeleccionado: (voluntariado: Voluntariado | null) => void;
  setApplications: (applications: Application[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  getVoluntariadoById: (id: string) => Voluntariado | undefined;
};

export const useVoluntariadoStore = create<VoluntariadoState>((set, get) => ({
  voluntariados: [],
  voluntariadoSeleccionado: null,
  applications: [],
  isLoading: false,
  
  setVoluntariados: (voluntariados) => set({ voluntariados }),
  
  setVoluntariadoSeleccionado: (voluntariado) => 
    set({ voluntariadoSeleccionado: voluntariado }),
  
  setApplications: (applications) => set({ applications }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  getVoluntariadoById: (id) => {
    const state = get();
    return state.voluntariados.find((v) => v.id === id);
  },
}));
