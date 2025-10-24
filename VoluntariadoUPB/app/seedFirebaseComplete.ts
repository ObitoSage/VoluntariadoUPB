import { collection, addDoc, Timestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase'; // Ajusta la ruta según tu proyecto

// ==================== OPORTUNIDADES ====================
const oportunidadesData = [
  {
    titulo: "Apoyo Escolar en Comunidades Rurales",
    titleLower: "apoyo escolar en comunidades rurales",
    descripcion: "Buscamos voluntarios para brindar apoyo educativo a niños de primaria en comunidades rurales. Ayudarás con tareas, refuerzo en materias básicas y actividades recreativas.",
    organizacion: "Fundación Educación para Todos",
    organizacionId: "org-1",
    campus: "UPB",
    ciudad: "La Paz",
    categoria: "educativo",
    modalidad: "presencial",
    horasSemana: 4,
    deadline: Timestamp.fromDate(new Date('2025-12-31')),
    cupos: 15,
    cuposDisponibles: 8,
    habilidades: ["Trabajo en equipo", "Empatía", "Comunicación"],
    status: "open",
    createdAt: Timestamp.fromDate(new Date('2025-01-15')),
    updatedAt: Timestamp.fromDate(new Date('2025-01-15')),
    createdBy: "admin-1"
  },
  {
    titulo: "Limpieza de Parques y Áreas Verdes",
    titleLower: "limpieza de parques y áreas verdes",
    descripcion: "Únete a nuestra jornada de limpieza mensual en parques públicos. Contribuye al cuidado del medio ambiente y embellecimiento de espacios comunitarios.",
    organizacion: "Verde Urbano",
    organizacionId: "org-2",
    campus: "UMSA",
    ciudad: "La Paz",
    categoria: "ambiental",
    modalidad: "presencial",
    horasSemana: 3,
    deadline: Timestamp.fromDate(new Date('2025-11-30')),
    cupos: 25,
    cuposDisponibles: 18,
    habilidades: ["Trabajo en equipo", "Organización"],
    status: "open",
    createdAt: Timestamp.fromDate(new Date('2025-01-20')),
    updatedAt: Timestamp.fromDate(new Date('2025-01-20')),
    createdBy: "admin-2"
  },
  {
    titulo: "Asistencia en Refugio de Animales",
    titleLower: "asistencia en refugio de animales",
    descripcion: "Ayuda en el cuidado diario de perros y gatos rescatados. Las actividades incluyen alimentación, limpieza, paseos y socialización con los animales.",
    organizacion: "Patitas Felices",
    organizacionId: "org-3",
    campus: "UCB",
    ciudad: "La Paz",
    categoria: "social",
    modalidad: "presencial",
    horasSemana: 5,
    deadline: Timestamp.fromDate(new Date('2025-12-15')),
    cupos: 10,
    cuposDisponibles: 3,
    habilidades: ["Empatía", "Trabajo en equipo", "Primeros auxilios"],
    status: "waitlist",
    createdAt: Timestamp.fromDate(new Date('2025-01-10')),
    updatedAt: Timestamp.fromDate(new Date('2025-01-10')),
    createdBy: "admin-3"
  },
  {
    titulo: "Diseño Gráfico para ONGs",
    titleLower: "diseño gráfico para ongs",
    descripcion: "Ayuda a organizaciones sin fines de lucro con diseño de materiales promocionales, redes sociales y campañas digitales desde la comodidad de tu casa.",
    organizacion: "Diseñadores Solidarios",
    organizacionId: "org-4",
    campus: "EMI",
    ciudad: "La Paz",
    categoria: "cultural",
    modalidad: "remoto",
    horasSemana: 3,
    deadline: Timestamp.fromDate(new Date('2025-11-20')),
    cupos: 8,
    cuposDisponibles: 5,
    habilidades: ["Diseño", "Creatividad", "Tecnología"],
    status: "open",
    createdAt: Timestamp.fromDate(new Date('2025-01-18')),
    updatedAt: Timestamp.fromDate(new Date('2025-01-18')),
    createdBy: "admin-4"
  },
  {
    titulo: "Acompañamiento a Adultos Mayores",
    titleLower: "acompañamiento a adultos mayores",
    descripcion: "Brinda compañía y apoyo a adultos mayores en residencias. Actividades incluyen conversación, lectura, juegos de mesa y paseos.",
    organizacion: "Tercera Edad Activa",
    organizacionId: "org-5",
    campus: "UPSA",
    ciudad: "Santa Cruz",
    categoria: "social",
    modalidad: "presencial",
    horasSemana: 4,
    deadline: Timestamp.fromDate(new Date('2026-01-30')),
    cupos: 20,
    cuposDisponibles: 12,
    habilidades: ["Empatía", "Comunicación", "Trabajo en equipo"],
    status: "open",
    createdAt: Timestamp.fromDate(new Date('2025-01-12')),
    updatedAt: Timestamp.fromDate(new Date('2025-01-12')),
    createdBy: "admin-5"
  },
  {
    titulo: "Clases de Programación para Jóvenes",
    titleLower: "clases de programación para jóvenes",
    descripcion: "Enseña conceptos básicos de programación a jóvenes de secundaria. Comparte tu conocimiento y ayuda a formar la próxima generación de desarrolladores.",
    organizacion: "Code for Bolivia",
    organizacionId: "org-6",
    campus: "UPB",
    ciudad: "Cochabamba",
    categoria: "educativo",
    modalidad: "hibrido",
    horasSemana: 6,
    deadline: Timestamp.fromDate(new Date('2025-12-10')),
    cupos: 5,
    cuposDisponibles: 0,
    habilidades: ["Tecnología", "Comunicación", "Liderazgo"],
    status: "closed",
    createdAt: Timestamp.fromDate(new Date('2025-01-05')),
    updatedAt: Timestamp.fromDate(new Date('2025-01-22')),
    createdBy: "admin-6"
  }
];

// ==================== USUARIOS ====================
const usersData = [
  {
    uid: "user-123",
    name: "Administrator",
    email: "admin@upb.edu",
    avatarUrl: "https://ui-avatars.com/api/?name=Administrator&background=007AFF&color=fff&size=200",
    campus: ["UPB"],
    carrera: "Ingeniería de Sistemas",
    semestre: 7,
    intereses: ["Educación", "Medio Ambiente", "Tecnología"],
    habilidades: ["Liderazgo", "Programación", "Trabajo en equipo"],
    telefono: "+591 70123456",
    biografia: "Estudiante apasionado por el voluntariado y el desarrollo comunitario.",
    horasRegistradas: 150,
    eventosCompletados: 12,
    certificadosObtenidos: 8,
    notificaciones: true,
    visibilidadPerfil: "publico",
    createdAt: Timestamp.fromDate(new Date('2025-01-01')),
    updatedAt: Timestamp.fromDate(new Date('2025-10-23'))
  },
  {
    uid: "user-456",
    name: "María González",
    email: "maria.gonzalez@upb.edu",
    avatarUrl: "https://ui-avatars.com/api/?name=Maria+Gonzalez&background=FF6B6B&color=fff&size=200",
    campus: ["UMSA"],
    carrera: "Medicina",
    semestre: 5,
    intereses: ["Salud", "Social", "Educación"],
    habilidades: ["Empatía", "Primeros auxilios", "Comunicación"],
    telefono: "+591 71234567",
    biografia: "Futura doctora comprometida con la salud comunitaria.",
    horasRegistradas: 80,
    eventosCompletados: 6,
    certificadosObtenidos: 4,
    notificaciones: true,
    visibilidadPerfil: "publico",
    createdAt: Timestamp.fromDate(new Date('2025-02-15')),
    updatedAt: Timestamp.fromDate(new Date('2025-10-23'))
  }
];

// ==================== POSTULACIONES ====================
const postulacionesData = [
  {
    estudianteId: "user-123",
    oportunidadId: "opp-001",
    title: "Sonrisas de Antaño",
    organization: "Club UPB Volunteer",
    applicationDate: Timestamp.fromDate(new Date('2025-10-05')),
    status: "pending",
    location: "Casa Amandita del Adulto Mayor",
    description: "El club UPB Volunteer te invita a ser parte de voluntario por un día: 'sonrisas de antaño', en casa amandita del adulto mayor, para compartir una mañana lúdica y de confraternización con adultos mayores.",
    time: "9:00 a 12:00 hrs",
    date: "Viernes 8 de Octubre",
    imageUrl: "https://placehold.co/400x300/FF6B6B/white?text=Sonrisas+de+Antano",
    createdAt: Timestamp.fromDate(new Date('2025-10-05')),
    updatedAt: Timestamp.fromDate(new Date('2025-10-05'))
  },
  {
    estudianteId: "user-123",
    oportunidadId: "opp-002",
    title: "Voluntario por un Día - Desayunos Solidarios",
    organization: "Club UPB Volunteer",
    applicationDate: Timestamp.fromDate(new Date('2025-10-06')),
    status: "accepted",
    location: "Zona Central de la Ciudad",
    description: "El club UPB Volunteer te invita a ser parte de voluntario por un día, y ayúdanos a repartir desayunos a personas en situación de calle en la zona central de la ciudad.",
    time: "8:00 a 11:00 hrs",
    date: "Sábado 9 de Octubre",
    imageUrl: "https://placehold.co/400x300/51CF66/white?text=Desayunos+Solidarios",
    createdAt: Timestamp.fromDate(new Date('2025-10-06')),
    updatedAt: Timestamp.fromDate(new Date('2025-10-06'))
  },
  {
    estudianteId: "user-123",
    oportunidadId: "opp-003",
    title: "Voluntario por un Día - Albergue Villa Colitas",
    organization: "Club UPB Volunteer",
    applicationDate: Timestamp.fromDate(new Date('2025-10-07')),
    status: "rejected",
    location: "Albergue Villa Colitas",
    description: "El club UPB Volunteer te invita a ser parte de voluntario por un día en el albergue de Villa Colitas.",
    time: "9:00 a 12:30 hrs",
    date: "Domingo 10 de Octubre",
    imageUrl: "https://placehold.co/400x300/4DABF7/white?text=Villa+Colitas",
    createdAt: Timestamp.fromDate(new Date('2025-10-07')),
    updatedAt: Timestamp.fromDate(new Date('2025-10-07'))
  }
];

// ==================== ACTIVIDADES ====================
const actividadesData = [
  {
    estudianteId: "user-123",
    oportunidadId: "mock-1",
    titulo: "Cuidado de animales en refugio",
    fecha: Timestamp.fromDate(new Date('2025-10-10')),
    horasBecarias: 10,
    categoria: "animales",
    estado: "completado",
    certificadoUrl: "https://placehold.co/800x600/34C759/white?text=Certificado+Animales",
    createdAt: Timestamp.fromDate(new Date('2025-10-10')),
    updatedAt: Timestamp.fromDate(new Date('2025-10-10'))
  },
  {
    estudianteId: "user-123",
    oportunidadId: "mock-2",
    titulo: "Educación rural - Apoyo escolar",
    fecha: Timestamp.fromDate(new Date('2025-10-25')),
    horasBecarias: 2,
    categoria: "educacion",
    estado: "completado",
    createdAt: Timestamp.fromDate(new Date('2025-10-25')),
    updatedAt: Timestamp.fromDate(new Date('2025-10-25'))
  },
  {
    estudianteId: "user-123",
    oportunidadId: "mock-3",
    titulo: "Limpieza de parques y plazas",
    fecha: Timestamp.fromDate(new Date('2024-11-18')),
    horasBecarias: 6,
    categoria: "medio-ambiente",
    estado: "completado",
    createdAt: Timestamp.fromDate(new Date('2024-11-18')),
    updatedAt: Timestamp.fromDate(new Date('2024-11-18'))
  },
  {
    estudianteId: "user-456",
    oportunidadId: "mock-4",
    titulo: "Campaña de salud preventiva",
    fecha: Timestamp.fromDate(new Date('2025-09-15')),
    horasBecarias: 8,
    categoria: "salud",
    estado: "completado",
    createdAt: Timestamp.fromDate(new Date('2025-09-15')),
    updatedAt: Timestamp.fromDate(new Date('2025-09-15'))
  }
];

// ==================== FUNCIÓN PRINCIPAL DE SEED ====================
export const seedFirebaseComplete = async () => {
  try {
    console.log('🌱 Iniciando seed completo de Firebase...\n');
    
    let successCount = 0;
    let errorCount = 0;

    // 1. CREAR OPORTUNIDADES
    console.log('📋 Creando oportunidades...');
    for (const oportunidad of oportunidadesData) {
      try {
        const docRef = await addDoc(collection(db, 'oportunidades'), oportunidad);
        console.log(`  ✅ Oportunidad creada: ${oportunidad.titulo} (ID: ${docRef.id})`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Error al crear oportunidad: ${oportunidad.titulo}`, error);
        errorCount++;
      }
    }

    // 2. CREAR USUARIOS
    console.log('\n👤 Creando usuarios...');
    for (const user of usersData) {
      try {
        await setDoc(doc(db, 'users', user.uid), user);
        console.log(`  ✅ Usuario creado: ${user.name} (UID: ${user.uid})`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Error al crear usuario: ${user.name}`, error);
        errorCount++;
      }
    }

    // 3. CREAR POSTULACIONES
    console.log('\n📝 Creando postulaciones...');
    for (const postulacion of postulacionesData) {
      try {
        const docRef = await addDoc(collection(db, 'postulaciones'), postulacion);
        console.log(`  ✅ Postulación creada: ${postulacion.title} (ID: ${docRef.id})`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Error al crear postulación: ${postulacion.title}`, error);
        errorCount++;
      }
    }

    // 4. CREAR ACTIVIDADES
    console.log('\n📊 Creando actividades...');
    for (const actividad of actividadesData) {
      try {
        const docRef = await addDoc(collection(db, 'actividades'), actividad);
        console.log(`  ✅ Actividad creada: ${actividad.titulo} (ID: ${docRef.id})`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Error al crear actividad: ${actividad.titulo}`, error);
        errorCount++;
      }
    }

    // RESUMEN
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Seed completado!');
    console.log('='.repeat(50));
    console.log(`✅ Documentos creados exitosamente: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log('\nColecciones creadas:');
    console.log(`  📋 oportunidades: ${oportunidadesData.length} documentos`);
    console.log(`  👤 users: ${usersData.length} documentos`);
    console.log(`  📝 postulaciones: ${postulacionesData.length} documentos`);
    console.log(`  📊 actividades: ${actividadesData.length} documentos`);
    console.log('='.repeat(50));

    return {
      success: errorCount === 0,
      successCount,
      errorCount,
      total: successCount + errorCount
    };

  } catch (error) {
    console.error('\n💥 Error fatal durante el seed:', error);
    return {
      success: false,
      error
    };
  }
};

// Función para limpiar todas las colecciones (USAR CON CUIDADO)
export const clearAllCollections = async () => {
  console.warn('⚠️  Esta función eliminará TODOS los datos de las colecciones');
  console.warn('⚠️  Implementa esta función solo si es necesario para testing');
  // Implementación pendiente por seguridad
};