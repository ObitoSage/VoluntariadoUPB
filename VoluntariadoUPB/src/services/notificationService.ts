import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../types';

// Configurar el handler de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type: 'postulacion_status' | 'nueva_oportunidad' | 'recordatorio';
  oportunidadId?: string;
  postulacionId?: string;
  status?: string;
  [key: string]: any;
}

export class NotificationService {
  
  /**
   * Registrar el dispositivo para recibir notificaciones push
   */
  static async registerForPushNotifications(): Promise<string | null> {
    try {
      // Solo funciona en dispositivos físicos
      if (!Device.isDevice) {
        console.warn('Las notificaciones push solo funcionan en dispositivos físicos');
        return null;
      }

      // Verificar permisos existentes
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Si no tiene permisos, solicitarlos
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // Si no se concedieron permisos
      if (finalStatus !== 'granted') {
        console.warn('No se concedieron permisos para notificaciones');
        return null;
      }

      // Obtener el token de Expo Push
      // IMPORTANTE: Obtén tu projectId en https://expo.dev en tu proyecto
      // O añádelo en app.json bajo "extra.eas.projectId"
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'e54d9d9b-878c-4ca5-a3be-0f41ad533644', // ⚠️ REEMPLAZAR con tu Expo Project ID real
      });

      // Configurar canal de notificaciones para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Notificaciones de VoluntariadoUPB',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#217868',
        });
      }

      return tokenData.data;
    } catch (error) {
      console.error('Error al registrar notificaciones push:', error);
      return null;
    }
  }

  /**
   * Guardar el push token del usuario en Firestore
   */
  static async savePushToken(userId: string, pushToken: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USUARIOS, userId);
      
      // Obtener tokens existentes para evitar duplicados
      const userDoc = await getDoc(userRef);
      const existingTokens = userDoc.data()?.pushTokens || [];
      
      // Agregar el nuevo token solo si no existe
      if (!existingTokens.includes(pushToken)) {
        await updateDoc(userRef, {
          pushTokens: [...existingTokens, pushToken],
          notificationsEnabled: true,
          lastTokenUpdate: new Date(),
        });
      }
    } catch (error) {
      console.error('Error al guardar push token:', error);
      throw error;
    }
  }

  /**
   * Remover el push token del usuario (opt-out)
   */
  static async removePushToken(userId: string, pushToken: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USUARIOS, userId);
      const userDoc = await getDoc(userRef);
      const existingTokens = userDoc.data()?.pushTokens || [];
      
      // Filtrar el token a remover
      const updatedTokens = existingTokens.filter((token: string) => token !== pushToken);
      
      await updateDoc(userRef, {
        pushTokens: updatedTokens,
        notificationsEnabled: updatedTokens.length > 0,
      });
    } catch (error) {
      console.error('Error al remover push token:', error);
      throw error;
    }
  }

  /**
   * Desactivar notificaciones para el usuario
   */
  static async disableNotifications(userId: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USUARIOS, userId);
      await updateDoc(userRef, {
        notificationsEnabled: false,
        pushTokens: [],
      });
    } catch (error) {
      console.error('Error al desactivar notificaciones:', error);
      throw error;
    }
  }

  /**
   * Activar notificaciones para el usuario
   */
  static async enableNotifications(userId: string): Promise<void> {
    try {
      const pushToken = await this.registerForPushNotifications();
      if (pushToken) {
        await this.savePushToken(userId, pushToken);
      }
    } catch (error) {
      console.error('Error al activar notificaciones:', error);
      throw error;
    }
  }

  /**
   * Enviar notificación local (para pruebas)
   */
  static async scheduleLocalNotification(
    title: string,
    body: string,
    data?: NotificationData,
    triggerSeconds: number = 1
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: triggerSeconds > 0 ? { 
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: triggerSeconds,
          repeats: false,
        } : null,
      });
      return notificationId;
    } catch (error) {
      console.error('Error al programar notificación local:', error);
      throw error;
    }
  }

  /**
   * Cancelar todas las notificaciones programadas
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error al cancelar notificaciones:', error);
    }
  }

  /**
   * Obtener badge count (contador de notificaciones)
   */
  static async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error al obtener badge count:', error);
      return 0;
    }
  }

  /**
   * Establecer badge count
   */
  static async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error al establecer badge count:', error);
    }
  }

  /**
   * Verificar si las notificaciones están habilitadas
   */
  static async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error al verificar permisos de notificaciones:', error);
      return false;
    }
  }
}
