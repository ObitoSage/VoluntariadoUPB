import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { NotificationService, NotificationData } from '../services/notificationService';
import { notificationScheduler } from '../services/notificationScheduler';

export function useNotifications() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);
  const appState = useRef(AppState.currentState);

  // Registrar y configurar notificaciones
  useEffect(() => {
    if (!user) return;

    const setupNotifications = async () => {
      try {
        // Registrar para notificaciones push
        const token = await NotificationService.registerForPushNotifications();
        
        if (token) {
          setExpoPushToken(token);
          // Guardar el token en Firestore
          await NotificationService.savePushToken(user.uid, token);
        }

        // Inicializar el scheduler de notificaciones locales
        await notificationScheduler.initialize(user.uid);

        // Listener para notificaciones recibidas
        notificationListener.current = Notifications.addNotificationReceivedListener(
          (notification: Notifications.Notification) => {
            setNotification(notification);
            console.log('📬 Notificación recibida:', notification);
          }
        );

        // Listener para cuando el usuario toca la notificación
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
          (response: Notifications.NotificationResponse) => {
            handleNotificationResponse(response);
          }
        );

        // Listener para cambios de estado de la app
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
          subscription.remove();
        };
      } catch (error) {
        console.error('Error al configurar notificaciones:', error);
      }
    };

    setupNotifications();

    // Cleanup
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      notificationScheduler.cleanup();
    };
  }, [user]);

  // Manejar cambios de estado de la app
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // La app volvió al foreground, limpiar badge
      NotificationService.setBadgeCount(0);
      // Refrescar recordatorios programados
      if (user) {
        notificationScheduler.refreshReminders();
      }
    }
    appState.current = nextAppState;
  };

  // Manejar respuesta a notificación (cuando el usuario la toca)
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as NotificationData;

    console.log('👆 Usuario tocó la notificación:', data);

    // Navegar según el tipo de notificación
    switch (data.type) {
      case 'postulacion_status':
        if (data.postulacionId) {
          router.push('/(drawer)/(tabs)/profile');
        }
        break;

      case 'nueva_oportunidad':
        if (data.oportunidadId) {
          router.push(`/(drawer)/(tabs)/opportunities/${data.oportunidadId}`);
        } else {
          router.push('/(drawer)/(tabs)/opportunities');
        }
        break;

      case 'recordatorio':
        if (data.oportunidadId) {
          router.push(`/(drawer)/(tabs)/opportunities/${data.oportunidadId}`);
        }
        break;

      default:
        router.push('/(drawer)/(tabs)');
    }
  };

  // Métodos públicos
  const enableNotifications = async () => {
    if (!user) return;
    try {
      await NotificationService.enableNotifications(user.uid);
      const token = await NotificationService.registerForPushNotifications();
      if (token) {
        setExpoPushToken(token);
      }
    } catch (error) {
      console.error('Error al activar notificaciones:', error);
      throw error;
    }
  };

  const disableNotifications = async () => {
    if (!user) return;
    try {
      await NotificationService.disableNotifications(user.uid);
      setExpoPushToken(null);
    } catch (error) {
      console.error('Error al desactivar notificaciones:', error);
      throw error;
    }
  };

  const checkPermissions = async () => {
    return await NotificationService.areNotificationsEnabled();
  };

  return {
    expoPushToken,
    notification,
    enableNotifications,
    disableNotifications,
    checkPermissions,
  };
}
