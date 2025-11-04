import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { collection, query, where, onSnapshot, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Nombre de la tarea en background
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

// Claves para AsyncStorage
const STORAGE_KEYS = {
  LAST_POSTULACION_CHECK: 'lastPostulacionCheck',
  LAST_OPORTUNIDAD_CHECK: 'lastOportunidadCheck',
  NOTIFIED_POSTULACIONES: 'notifiedPostulaciones',
  SCHEDULED_REMINDERS: 'scheduledReminders',
};

interface PostulacionStatus {
  id: string;
  status: string;
  timestamp: number;
}

/**
 * Servicio para programar y gestionar notificaciones locales
 * sin depender de Cloud Functions
 */
export class NotificationScheduler {
  private static instance: NotificationScheduler;
  private userId: string | null = null;
  private unsubscribers: Array<() => void> = [];

  private constructor() {}

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  /**
   * Inicializa el scheduler con el userId
   */
  async initialize(userId: string) {
    this.userId = userId;
    await this.setupRealtimeListeners();
    await this.scheduleAllReminders();
    await this.registerBackgroundTask();
  }

  /**
   * Limpia todos los listeners
   */
  cleanup() {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    this.userId = null;
  }

  /**
   * Configura listeners en tiempo real para cambios en Firestore
   */
  private async setupRealtimeListeners() {
    if (!this.userId) return;

    // Listener para cambios en postulaciones
    const postulacionesQuery = query(
      collection(db, 'postulaciones'),
      where('usuarioId', '==', this.userId)
    );

    const unsubPostulaciones = onSnapshot(postulacionesQuery, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'modified') {
          const data = change.doc.data();
          const prevStatus = await this.getStoredPostulacionStatus(change.doc.id);
          
          if (prevStatus && prevStatus !== data.status) {
            await this.notifyPostulacionStatusChange(
              change.doc.id,
              data.oportunidadId,
              data.status,
              prevStatus
            );
          }
          
          await this.storePostulacionStatus(change.doc.id, data.status);
        }
      }
    });

    this.unsubscribers.push(unsubPostulaciones);

    // Listener para nuevas oportunidades
    const oportunidadesQuery = query(collection(db, 'oportunidades'));
    
    const unsubOportunidades = onSnapshot(oportunidadesQuery, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const hasNotified = await this.hasNotifiedOportunidad(change.doc.id);
          if (!hasNotified) {
            const data = change.doc.data();
            await this.notifyNewOportunidad(change.doc.id, data.titulo, data.categoria);
            await this.markOportunidadAsNotified(change.doc.id);
          }
        }
      }
    });

    this.unsubscribers.push(unsubOportunidades);
  }

  /**
   * Envía notificación de cambio de estado en postulación
   */
  private async notifyPostulacionStatusChange(
    postulacionId: string,
    oportunidadId: string,
    newStatus: string,
    oldStatus: string
  ) {
    let title = '';
    let body = '';

    switch (newStatus) {
      case 'aceptada':
        title = '✅ Postulación Aceptada';
        body = 'Tu postulación ha sido aceptada. ¡Felicitaciones!';
        break;
      case 'rechazada':
        title = '❌ Postulación Rechazada';
        body = 'Lamentablemente tu postulación no fue aceptada.';
        break;
      case 'cancelada':
        title = '🚫 Postulación Cancelada';
        body = 'Tu postulación ha sido cancelada.';
        break;
      case 'completada':
        title = '🎉 Actividad Completada';
        body = '¡Has completado la actividad exitosamente!';
        break;
      default:
        return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: 'postulacion_status',
          postulacionId,
          oportunidadId,
          status: newStatus,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Inmediata
    });
  }

  /**
   * Envía notificación de nueva oportunidad
   */
  private async notifyNewOportunidad(
    oportunidadId: string,
    titulo: string,
    categoria: string
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🆕 Nueva Oportunidad de Voluntariado',
        body: `${titulo} - ${categoria}`,
        data: {
          type: 'nueva_oportunidad',
          oportunidadId,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      },
      trigger: null,
    });
  }

  /**
   * Programa todos los recordatorios de deadlines e inicios
   */
  private async scheduleAllReminders() {
    if (!this.userId) return;

    // Cancelar recordatorios anteriores
    await this.cancelAllScheduledReminders();

    // Obtener postulaciones activas del usuario
    const postulacionesQuery = query(
      collection(db, 'postulaciones'),
      where('usuarioId', '==', this.userId),
      where('status', 'in', ['pendiente', 'aceptada'])
    );

    const postulacionesSnapshot = await getDocs(postulacionesQuery);
    const oportunidadIds = postulacionesSnapshot.docs.map(doc => doc.data().oportunidadId);

    if (oportunidadIds.length === 0) return;

    // Obtener detalles de oportunidades
    const oportunidadesSnapshot = await getDocs(collection(db, 'oportunidades'));
    const scheduledIds: string[] = [];

    for (const oportunidadDoc of oportunidadesSnapshot.docs) {
      if (!oportunidadIds.includes(oportunidadDoc.id)) continue;

      const data = oportunidadDoc.data();
      const now = new Date();

      // Recordatorio de deadline (1 día antes)
      if (data.fechaInscripcion) {
        const fechaInscripcion = data.fechaInscripcion.toDate();
        const oneDayBefore = new Date(fechaInscripcion);
        oneDayBefore.setDate(oneDayBefore.getDate() - 1);
        oneDayBefore.setHours(9, 0, 0, 0); // 9 AM

        if (oneDayBefore > now) {
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: '⏰ Recordatorio: Deadline Mañana',
              body: `La inscripción para ${data.titulo} cierra mañana`,
              data: {
                type: 'recordatorio_deadline',
                oportunidadId: oportunidadDoc.id,
              },
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: oneDayBefore,
            },
          });
          scheduledIds.push(notificationId);
        }
      }

      // Recordatorio de inicio (día del evento)
      if (data.fechaInicio) {
        const fechaInicio = data.fechaInicio.toDate();
        const eventDay = new Date(fechaInicio);
        eventDay.setHours(8, 0, 0, 0); // 8 AM

        if (eventDay > now) {
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: '📅 Recordatorio: Actividad Hoy',
              body: `${data.titulo} comienza hoy${data.horaInicio ? ` a las ${data.horaInicio}` : ''}`,
              data: {
                type: 'recordatorio_inicio',
                oportunidadId: oportunidadDoc.id,
              },
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: eventDay,
            },
          });
          scheduledIds.push(notificationId);
        }
      }
    }

    // Guardar IDs de notificaciones programadas
    await AsyncStorage.setItem(
      STORAGE_KEYS.SCHEDULED_REMINDERS,
      JSON.stringify(scheduledIds)
    );
  }

  /**
   * Cancela todos los recordatorios programados
   */
  private async cancelAllScheduledReminders() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULED_REMINDERS);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        for (const id of ids) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      }
    } catch (error) {
      console.error('Error cancelando recordatorios:', error);
    }
  }

  /**
   * Registra tarea en background para verificar cambios
   */
  private async registerBackgroundTask() {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
        minimumInterval: 60 * 15, // 15 minutos
        stopOnTerminate: false,
        startOnBoot: true,
      });
    } catch (err) {
      console.log('Background fetch ya está registrado');
    }
  }

  // Helpers para AsyncStorage
  private async getStoredPostulacionStatus(postulacionId: string): Promise<string | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFIED_POSTULACIONES);
      if (stored) {
        const statuses: Record<string, PostulacionStatus> = JSON.parse(stored);
        return statuses[postulacionId]?.status || null;
      }
    } catch (error) {
      console.error('Error obteniendo status:', error);
    }
    return null;
  }

  private async storePostulacionStatus(postulacionId: string, status: string) {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFIED_POSTULACIONES);
      const statuses: Record<string, PostulacionStatus> = stored ? JSON.parse(stored) : {};
      
      statuses[postulacionId] = {
        id: postulacionId,
        status,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFIED_POSTULACIONES,
        JSON.stringify(statuses)
      );
    } catch (error) {
      console.error('Error guardando status:', error);
    }
  }

  private async hasNotifiedOportunidad(oportunidadId: string): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LAST_OPORTUNIDAD_CHECK);
      if (stored) {
        const notified: string[] = JSON.parse(stored);
        return notified.includes(oportunidadId);
      }
    } catch (error) {
      console.error('Error verificando oportunidad:', error);
    }
    return false;
  }

  private async markOportunidadAsNotified(oportunidadId: string) {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LAST_OPORTUNIDAD_CHECK);
      const notified: string[] = stored ? JSON.parse(stored) : [];
      
      if (!notified.includes(oportunidadId)) {
        notified.push(oportunidadId);
        // Mantener solo los últimos 100
        if (notified.length > 100) {
          notified.splice(0, notified.length - 100);
        }
        await AsyncStorage.setItem(
          STORAGE_KEYS.LAST_OPORTUNIDAD_CHECK,
          JSON.stringify(notified)
        );
      }
    } catch (error) {
      console.error('Error marcando oportunidad:', error);
    }
  }

  /**
   * Re-programa los recordatorios (llamar periódicamente)
   */
  async refreshReminders() {
    await this.scheduleAllReminders();
  }
}

/**
 * Define la tarea en background
 */
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    // Aquí podrías hacer verificaciones adicionales si es necesario
    // Por ahora, los listeners en tiempo real manejan la mayoría
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Error en background task:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const notificationScheduler = NotificationScheduler.getInstance();
