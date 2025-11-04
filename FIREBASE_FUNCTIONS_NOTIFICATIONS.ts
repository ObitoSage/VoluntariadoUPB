// Firebase Cloud Functions para enviar notificaciones push
// Este archivo debe estar en tu proyecto de Firebase Functions

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const EXPO_API_URL = 'https://exp.host/--/api/v2/push/send';

interface NotificationPayload {
  to: string[];
  title: string;
  body: string;
  data?: any;
  sound?: string;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
}

/**
 * Enviar notificación push usando Expo Push API
 */
async function sendPushNotification(payload: NotificationPayload) {
  try {
    const messages = payload.to.map(token => ({
      to: token,
      sound: payload.sound || 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      badge: payload.badge,
      priority: payload.priority || 'high',
    }));

    const response = await fetch(EXPO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log('Push notification sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

/**
 * 1. Notificación cuando cambia el estado de una postulación
 */
export const onPostulacionStatusChange = functions.firestore
  .document('postulaciones/{postulacionId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Solo enviar si el estado cambió
    if (before.estado === after.estado) {
      return null;
    }

    const estudianteId = after.estudianteId;
    const oportunidadTitulo = after.titulo;
    const nuevoEstado = after.estado;

    // Obtener los tokens del estudiante
    const userDoc = await admin.firestore()
      .collection('usuarios')
      .doc(estudianteId)
      .get();

    const userData = userDoc.data();
    if (!userData || !userData.notificationsEnabled || !userData.pushTokens?.length) {
      console.log('Usuario sin tokens o notificaciones deshabilitadas');
      return null;
    }

    // Personalizar mensaje según el estado
    let title = '';
    let body = '';

    switch (nuevoEstado) {
      case 'accepted':
      case 'aceptado':
        title = '🎉 ¡Felicidades!';
        body = `Tu postulación para "${oportunidadTitulo}" ha sido aceptada`;
        break;
      case 'rejected':
      case 'rechazado':
        title = 'Postulación no aceptada';
        body = `Lamentablemente tu postulación para "${oportunidadTitulo}" no fue aceptada esta vez`;
        break;
      case 'waitlisted':
      case 'lista_espera':
        title = 'En lista de espera';
        body = `Tu postulación para "${oportunidadTitulo}" está en lista de espera`;
        break;
      default:
        return null;
    }

    // Enviar notificación
    await sendPushNotification({
      to: userData.pushTokens,
      title,
      body,
      data: {
        type: 'postulacion_status',
        postulacionId: context.params.postulacionId,
        oportunidadId: after.oportunidadId,
        status: nuevoEstado,
      },
      badge: 1,
    });

    return null;
  });

/**
 * 2. Notificación cuando se publica una nueva oportunidad
 */
export const onNuevaOportunidad = functions.firestore
  .document('oportunidades/{oportunidadId}')
  .onCreate(async (snapshot, context) => {
    const oportunidad = snapshot.data();
    const campus = oportunidad.campus;
    const categoria = oportunidad.categoria;
    const titulo = oportunidad.titulo;

    // Buscar estudiantes del mismo campus
    const usersSnapshot = await admin.firestore()
      .collection('usuarios')
      .where('role', '==', 'student')
      .where('notificationsEnabled', '==', true)
      .get();

    const tokensToNotify: string[] = [];

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      // Filtrar por campus si el usuario tiene uno configurado
      if (userData.pushTokens && userData.pushTokens.length > 0) {
        // Opcional: puedes agregar más filtros como campus o categorías favoritas
        if (!userData.campus || userData.campus === campus) {
          tokensToNotify.push(...userData.pushTokens);
        }
      }
    });

    if (tokensToNotify.length === 0) {
      console.log('No hay usuarios para notificar');
      return null;
    }

    // Enviar notificación
    await sendPushNotification({
      to: tokensToNotify,
      title: '🆕 Nueva oportunidad disponible',
      body: `${titulo} - ${categoria}`,
      data: {
        type: 'nueva_oportunidad',
        oportunidadId: context.params.oportunidadId,
        campus,
        categoria,
      },
      badge: 1,
    });

    return null;
  });

/**
 * 3. Recordatorio de deadline (ejecutar diariamente)
 */
export const recordatorioDeadlines = functions.pubsub
  .schedule('every day 09:00')
  .timeZone('America/Bogota')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Buscar oportunidades que cierran en 3 días
    const oportunidadesSnapshot = await admin.firestore()
      .collection('oportunidades')
      .where('status', '==', 'open')
      .where('fechaCierre', '<=', admin.firestore.Timestamp.fromDate(threeDaysFromNow))
      .where('fechaCierre', '>', now)
      .get();

    for (const oportunidadDoc of oportunidadesSnapshot.docs) {
      const oportunidad = oportunidadDoc.data();
      
      // Buscar estudiantes que han marcado como favorito pero no han aplicado
      const usersSnapshot = await admin.firestore()
        .collection('usuarios')
        .where('role', '==', 'student')
        .where('notificationsEnabled', '==', true)
        .where('favoritos', 'array-contains', oportunidadDoc.id)
        .get();

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        
        // Verificar si ya aplicó
        const postulacionesSnapshot = await admin.firestore()
          .collection('postulaciones')
          .where('estudianteId', '==', userDoc.id)
          .where('oportunidadId', '==', oportunidadDoc.id)
          .get();

        // Si no ha aplicado, enviar recordatorio
        if (postulacionesSnapshot.empty && userData.pushTokens?.length) {
          await sendPushNotification({
            to: userData.pushTokens,
            title: '⏰ Recordatorio de deadline',
            body: `La oportunidad "${oportunidad.titulo}" cierra pronto. ¡No olvides postularte!`,
            data: {
              type: 'recordatorio',
              oportunidadId: oportunidadDoc.id,
              deadline: oportunidad.fechaCierre,
            },
            badge: 1,
          });
        }
      }
    }

    return null;
  });

/**
 * Recordatorio de inicio de actividad (1 día antes)
 */
export const recordatorioInicioActividad = functions.pubsub
  .schedule('every day 18:00')
  .timeZone('America/Bogota')
  .onRun(async (context) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Buscar oportunidades que inician mañana
    const oportunidadesSnapshot = await admin.firestore()
      .collection('oportunidades')
      .where('fechaInicio', '>=', admin.firestore.Timestamp.fromDate(tomorrow))
      .where('fechaInicio', '<', admin.firestore.Timestamp.fromDate(dayAfterTomorrow))
      .get();

    for (const oportunidadDoc of oportunidadesSnapshot.docs) {
      const oportunidad = oportunidadDoc.data();
      
      // Buscar postulaciones aceptadas para esta oportunidad
      const postulacionesSnapshot = await admin.firestore()
        .collection('postulaciones')
        .where('oportunidadId', '==', oportunidadDoc.id)
        .where('estado', 'in', ['accepted', 'aceptado'])
        .get();

      for (const postulacionDoc of postulacionesSnapshot.docs) {
        const postulacion = postulacionDoc.data();
        
        // Obtener tokens del estudiante
        const userDoc = await admin.firestore()
          .collection('usuarios')
          .doc(postulacion.estudianteId)
          .get();

        const userData = userDoc.data();
        if (userData?.notificationsEnabled && userData.pushTokens?.length) {
          await sendPushNotification({
            to: userData.pushTokens,
            title: '📅 ¡Tu voluntariado es mañana!',
            body: `Recuerda: "${oportunidad.titulo}" comienza mañana a las ${oportunidad.hora || 'hora indicada'}`,
            data: {
              type: 'recordatorio',
              oportunidadId: oportunidadDoc.id,
              postulacionId: postulacionDoc.id,
            },
            badge: 1,
          });
        }
      }
    }

    return null;
  });
