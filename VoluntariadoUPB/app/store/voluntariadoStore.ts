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
  status: 'pending' | 'accepted' | 'rejected';
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


const mockVoluntariados: Voluntariado[] = [
  {
    id: '1',
    titulo: 'Cuidado de animales en refugio',
    organizacion: 'Refugio Esperanza Animal',
    descripcion: 'Ayuda en el cuidado diario de perros y gatos rescatados. Actividades incluyen alimentación, limpieza de áreas, socialización y paseos.',
    ubicacion: 'Zona Sur, La Paz',
    fecha: '2025-10-15',
    duracion: '4 horas',
    categoria: 'animales',
    participantesMaximos: 10,
    participantesActuales: 6,
    imagen: '🐕',
    requisitos: [
      'Mayor de 16 años',
      'Amor por los animales',
      'Compromiso de asistencia',
    ],
    beneficios: [
      'Certificado de voluntariado',
      'Refrigerio incluido',
      'Experiencia enriquecedora',
    ],
  },
  {
    id: '2',
    titulo: 'Educación rural - Apoyo escolar',
    organizacion: 'Educación para Todos',
    descripcion: 'Apoyo en actividades educativas para niños de primaria en comunidades rurales. Incluye refuerzo en matemáticas y lectura.',
    ubicacion: 'Comunidad El Alto',
    fecha: '2025-10-20',
    duracion: '6 horas',
    categoria: 'educacion',
    participantesMaximos: 15,
    participantesActuales: 8,
    imagen: '📚',
    requisitos: [
      'Estudiante universitario',
      'Paciencia con niños',
      'Conocimientos básicos de pedagogía',
    ],
    beneficios: [
      'Certificado oficial',
      'Transporte incluido',
      'Almuerzo proporcionado',
    ],
  },
  {
    id: '3',
    titulo: 'Limpieza de parques y plazas',
    organizacion: 'Medio Ambiente Limpio',
    descripcion: 'Jornada de limpieza y reforestación en espacios públicos de la ciudad. Contribuye a un ambiente más saludable.',
    ubicacion: 'Parque Central',
    fecha: '2025-10-25',
    duracion: '3 horas',
    categoria: 'medio-ambiente',
    participantesMaximos: 30,
    participantesActuales: 22,
    imagen: '🌳',
    requisitos: [
      'Mayor de 14 años',
      'Ropa cómoda',
      'Protección solar',
    ],
    beneficios: [
      'Certificado de participación',
      'Kit de limpieza proporcionado',
      'Merienda',
    ],
  },
  {
    id: '4',
    titulo: 'Apoyo en campaña de vacunación',
    organizacion: 'Centro de Salud Municipal',
    descripcion: 'Asistencia en organización y registro de pacientes durante campaña de vacunación comunitaria.',
    ubicacion: 'Centro de Salud Villa Fátima',
    fecha: '2025-11-01',
    duracion: '5 horas',
    categoria: 'salud',
    participantesMaximos: 8,
    participantesActuales: 5,
    imagen: '💉',
    requisitos: [
      'Estudiante de medicina o enfermería',
      'Disponibilidad completa',
      'Responsabilidad y puntualidad',
    ],
    beneficios: [
      'Certificado oficial del ministerio',
      'Experiencia práctica',
      'Refrigerio',
    ],
  },
  {
    id: '5',
    titulo: 'Construcción de viviendas comunitarias',
    organizacion: 'Hábitat Solidario',
    descripcion: 'Participación en construcción de viviendas para familias de bajos recursos. Trabajo en equipo y aprendizaje de técnicas de construcción.',
    ubicacion: 'Comunidad Achocalla',
    fecha: '2025-11-05',
    duracion: '8 horas',
    categoria: 'comunidad',
    participantesMaximos: 20,
    participantesActuales: 12,
    imagen: '🏠',
    requisitos: [
      'Mayor de 18 años',
      'Condición física adecuada',
      'Compromiso de día completo',
    ],
    beneficios: [
      'Certificado de voluntariado',
      'Almuerzo y refrigerios',
      'Transporte desde la universidad',
    ],
  },
  {
    id: '6',
    titulo: 'Taller de lectura para niños',
    organizacion: 'Biblioteca Comunitaria',
    descripcion: 'Conducción de talleres de lectura y cuentacuentos para niños de la comunidad. Fomenta el amor por la lectura.',
    ubicacion: 'Biblioteca Municipal Sopocachi',
    fecha: '2025-10-18',
    duracion: '2 horas',
    categoria: 'educacion',
    participantesMaximos: 5,
    participantesActuales: 3,
    imagen: '📖',
    requisitos: [
      'Habilidad para contar historias',
      'Paciencia con niños',
      'Creatividad',
    ],
    beneficios: [
      'Certificado',
      'Material didáctico proporcionado',
      'Refrigerio',
    ],
  },
];

const mockApplications: Application[] = [
  {
    id: '1',
    title: 'Sonrisas de Antaño',
    organization: 'Club UPB Volunteer',
    applicationDate: '5 Oct 2025',
    status: 'pending',
    location: 'Casa Amandita del Adulto Mayor',
    description: 'El club UPB Volunteer te invita a ser parte de voluntario por un día: "sonrisas de antaño", en casa amandita del adulto mayor, para compartir una mañana lúdica y de confraternización con adultos mayores.',
    time: '9:00 a 12:00 hrs',
    date: 'Viernes 8 de Octubre',
    image: require('../../assets/Eventos/Evento4.png'),
  },
  {
    id: '2',
    title: 'Voluntario por un Día - Desayunos Solidarios',
    organization: 'Club UPB Volunteer',
    applicationDate: '6 Oct 2025',
    status: 'accepted',
    location: 'Zona Central de la Ciudad',
    description: 'El club UPB Volunteer te invita a ser parte de voluntario por un día, y ayúdanos a repartir desayunos a personas en situación de calle en la zona central de la ciudad.',
    time: '8:00 a 11:00 hrs',
    date: 'Sábado 9 de Octubre',
    image: require('../../assets/Eventos/Evento2.png'),
  },
  {
    id: '3',
    title: 'Voluntario por un Día - Albergue Villa Colitas',
    organization: 'Club UPB Volunteer',
    applicationDate: '7 Oct 2025',
    status: 'rejected',
    location: 'Albergue Villa Colitas',
    description: 'El club UPB Volunteer te invita a ser parte de voluntario por un día en el albergue de Villa Colitas.',
    time: '9:00 a 12:30 hrs',
    date: 'Domingo 10 de Octubre',
    image: require('../../assets/Eventos/Evento3.png'),
  },
];

export const useVoluntariadoStore = create<VoluntariadoState>((set, get) => ({
  voluntariados: mockVoluntariados,
  voluntariadoSeleccionado: null,
  applications: mockApplications,
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
