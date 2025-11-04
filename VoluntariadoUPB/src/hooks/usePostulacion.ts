import { useState } from 'react';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { db } from '../../config/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { PostulacionFormData, COLLECTIONS, Oportunidad } from '../types';

export const usePostulacion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const crearPostulacion = async (
    oportunidad: Oportunidad,
    formData: PostulacionFormData
  ) => {
    if (!user) {
      setError('Debes iniciar sesión para postularte');
      return { success: false };
    }

    try {
      setLoading(true);
      setError(null);

      const postulacionData = {
        estudianteId: user.uid,
        estudianteNombre: user.displayName || user.email || 'Usuario',
        estudianteEmail: user.email,
        oportunidadId: oportunidad.id,
        oportunidadTitulo: oportunidad.titulo,
        titulo: oportunidad.titulo,
        organizacion: oportunidad.organizacion,
        location: `${oportunidad.campus}, ${oportunidad.ciudad}`,
        descripcion: oportunidad.descripcion,
        motivacion: formData.motivacion,
        disponibilidad: formData.disponibilidad,
        telefono: formData.telefono || '',
        estado: 'submitted',
        confirmado: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.POSTULACIONES), postulacionData);

      const oportunidadRef = doc(db, COLLECTIONS.OPORTUNIDADES, oportunidad.id);
      const newCuposDisponibles = oportunidad.cuposDisponibles - 1;
      
      const updateData: any = {
        cuposDisponibles: increment(-1),
        updatedAt: serverTimestamp(),
      };

      if (newCuposDisponibles <= 0) {
        updateData.status = 'waitlist';
      }

      await updateDoc(oportunidadRef, updateData);

      // 🎉 NOTIFICACIÓN: Postulación enviada exitosamente
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Postulación Enviada',
          body: `Tu postulación a "${oportunidad.titulo}" fue enviada exitosamente. Te notificaremos cuando sea revisada.`,
          data: {
            type: 'postulacion_enviada',
            postulacionId: docRef.id,
            oportunidadId: oportunidad.id,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Inmediata
      });

      // 🎯 MODO DEMO: Simular aceptación automática después de 8 segundos
      if (__DEV__) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🎉 Postulación Aceptada',
            body: `¡Felicitaciones! Tu postulación a "${oportunidad.titulo}" ha sido aceptada.`,
            data: {
              type: 'postulacion_status',
              postulacionId: docRef.id,
              oportunidadId: oportunidad.id,
              status: 'aceptada',
              isDemo: true,
            },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(Date.now() + 8000),
          },
        });

        // Actualizar estado en Firestore después de 8 segundos
        setTimeout(async () => {
          try {
            const postulacionRef = doc(db, COLLECTIONS.POSTULACIONES, docRef.id);
            await updateDoc(postulacionRef, {
              estado: 'aceptada',
              confirmado: true,
              updatedAt: serverTimestamp(),
            });
          } catch (error) {
            // Error silencioso en modo demo
          }
        }, 8000);
      }

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      console.error('Error creating postulacion:', err);
      setError(err.message || 'Error al crear la postulación');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return {
    crearPostulacion,
    loading,
    error,
  };
};
