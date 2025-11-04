$functionsCode = @'
import * as admin from 'firebase-admin';
import {onDocumentUpdated, onDocumentCreated} from 'firebase-functions/v2/firestore';
import {onSchedule} from 'firebase-functions/v2/scheduler';

admin.initializeApp();

const EXPO_API_URL = 'https://exp.host/--/api/v2/push/send';

async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, unknown>
) {
  try {
    const messages = tokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      badge: 1,
      priority: 'high',
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
    console.log('Notificaciones enviadas:', result);
    return result;
  } catch (error) {
    console.error('Error enviando notificaciones:', error);
    throw error;
  }
}

export const onPostulacionStatusChange = onDocumentUpdated(
  {
    document: 'postulaciones/{postulacionId}',
    region: 'us-central1',
  },
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!beforeData || !afterData) return;

    const statusChanged = beforeData.status !== afterData.status;
    if (!statusChanged) return;

    const userId = afterData.usuarioId;
    const newStatus = afterData.status;

    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.expoPushToken) {
      console.log('Usuario no tiene token de notificaciones');
      return;
    }

    const oportunidadDoc = await admin.firestore()
      .collection('oportunidades')
      .doc(afterData.oportunidadId)
      .get();
    const oportunidadData = oportunidadDoc.data();

    let title = '';
    let body = '';

    switch (newStatus) {
      case 'aceptada':
        title = 'Postulacion Aceptada';
        body = `Tu postulacion a ${oportunidadData?.titulo} ha sido aceptada`;
        break;
      case 'rechazada':
        title = 'Postulacion Rechazada';
        body = `Tu postulacion a ${oportunidadData?.titulo} no fue aceptada`;
        break;
      case 'cancelada':
        title = 'Postulacion Cancelada';
        body = `Tu postulacion a ${oportunidadData?.titulo} ha sido cancelada`;
        break;
      case 'completada':
        title = 'Actividad Completada';
        body = `Has completado ${oportunidadData?.titulo}`;
        break;
      default:
        return;
    }

    await sendPushNotification(
      [userData.expoPushToken],
      title,
      body,
      {
        type: 'postulacion_status',
        postulacionId: event.params.postulacionId,
        oportunidadId: afterData.oportunidadId,
        status: newStatus,
      }
    );
  }
);

export const onNuevaOportunidad = onDocumentCreated(
  {
    document: 'oportunidades/{oportunidadId}',
    region: 'us-central1',
  },
  async (event) => {
    const oportunidadData = event.data?.data();
    if (!oportunidadData) return;

    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('expoPushToken', '!=', null)
      .get();

    if (usersSnapshot.empty) {
      console.log('No hay usuarios con tokens de notificaciones');
      return;
    }

    const tokens = usersSnapshot.docs
      .map(doc => doc.data().expoPushToken)
      .filter(token => token);

    if (tokens.length === 0) return;

    await sendPushNotification(
      tokens,
      'Nueva Oportunidad de Voluntariado',
      `${oportunidadData.titulo} - ${oportunidadData.categoria}`,
      {
        type: 'nueva_oportunidad',
        oportunidadId: event.params.oportunidadId,
      }
    );
  }
);

export const recordatorioDeadlines = onSchedule(
  {
    schedule: 'every day 09:00',
    timeZone: 'America/La_Paz',
    region: 'us-central1',
  },
  async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const oportunidadesSnapshot = await admin.firestore()
      .collection('oportunidades')
      .where('fechaInscripcion', '>=', tomorrow)
      .where('fechaInscripcion', '<', dayAfterTomorrow)
      .get();

    if (oportunidadesSnapshot.empty) return;

    for (const oportunidadDoc of oportunidadesSnapshot.docs) {
      const oportunidadData = oportunidadDoc.data();
      
      const postulacionesSnapshot = await admin.firestore()
        .collection('postulaciones')
        .where('oportunidadId', '==', oportunidadDoc.id)
        .where('status', '==', 'pendiente')
        .get();

      if (postulacionesSnapshot.empty) continue;

      const userIds = postulacionesSnapshot.docs.map(doc => doc.data().usuarioId);
      const uniqueUserIds = [...new Set(userIds)];

      for (const userId of uniqueUserIds) {
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData?.expoPushToken) continue;

        await sendPushNotification(
          [userData.expoPushToken],
          'Recordatorio: Deadline Manana',
          `La inscripcion para ${oportunidadData.titulo} cierra manana`,
          {
            type: 'recordatorio_deadline',
            oportunidadId: oportunidadDoc.id,
          }
        );
      }
    }
  }
);

export const recordatorioInicioActividad = onSchedule(
  {
    schedule: 'every day 08:00',
    timeZone: 'America/La_Paz',
    region: 'us-central1',
  },
  async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const oportunidadesSnapshot = await admin.firestore()
      .collection('oportunidades')
      .where('fechaInicio', '>=', today)
      .where('fechaInicio', '<', tomorrow)
      .get();

    if (oportunidadesSnapshot.empty) return;

    for (const oportunidadDoc of oportunidadesSnapshot.docs) {
      const oportunidadData = oportunidadDoc.data();
      
      const postulacionesSnapshot = await admin.firestore()
        .collection('postulaciones')
        .where('oportunidadId', '==', oportunidadDoc.id)
        .where('status', '==', 'aceptada')
        .get();

      if (postulacionesSnapshot.empty) continue;

      const userIds = postulacionesSnapshot.docs.map(doc => doc.data().usuarioId);
      const uniqueUserIds = [...new Set(userIds)];

      for (const userId of uniqueUserIds) {
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData?.expoPushToken) continue;

        await sendPushNotification(
          [userData.expoPushToken],
          'Recordatorio: Actividad Hoy',
          `${oportunidadData.titulo} comienza hoy a las ${oportunidadData.horaInicio || 'hora programada'}`,
          {
            type: 'recordatorio_inicio',
            oportunidadId: oportunidadDoc.id,
          }
        );
      }
    }
  }
);
'@

$functionsCode | Out-File -FilePath ".\functions\src\index.ts" -Encoding utf8 -Force
Write-Host "Archivo creado exitosamente"
