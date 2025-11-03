import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Oportunidad, COLLECTIONS } from '../types';
import { LA_PAZ_COORDINATES } from '../utils/mapHelpers';

interface TempLocation {
  lat: number;
  lng: number;
  direccion: string;
}

export const useLocationManager = () => {
  const [selectedOportunidad, setSelectedOportunidad] = useState<Oportunidad | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [tempLocation, setTempLocation] = useState<TempLocation | null>(null);
  const [saving, setSaving] = useState(false);

  // Estados para modales de feedback
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [oportunidadToDelete, setOportunidadToDelete] = useState<Oportunidad | null>(null);

  const handleOpenMap = (oportunidad: Oportunidad) => {
    setSelectedOportunidad(oportunidad);

    if (oportunidad.ubicacion?.lat && oportunidad.ubicacion?.lng) {
      setTempLocation({
        lat: oportunidad.ubicacion.lat,
        lng: oportunidad.ubicacion.lng,
        direccion: oportunidad.ubicacion.direccion || '',
      });
    } else {
      setTempLocation({
        lat: LA_PAZ_COORDINATES.latitude,
        lng: LA_PAZ_COORDINATES.longitude,
        direccion: '',
      });
    }

    setShowMapModal(true);
  };

  const handleMapPress = (latitude: number, longitude: number) => {
    setTempLocation({
      lat: latitude,
      lng: longitude,
      direccion: tempLocation?.direccion || '',
    });
  };

  const updateDireccion = (direccion: string) => {
    setTempLocation((prev) => (prev ? { ...prev, direccion } : null));
  };

  const handleSaveLocation = async () => {
    if (!selectedOportunidad || !tempLocation || !tempLocation.direccion.trim()) {
      setErrorMessage('Por favor, ingresa una dirección para la ubicación');
      setShowErrorModal(true);
      return;
    }

    try {
      setSaving(true);

      const oportunidadRef = doc(db, COLLECTIONS.OPORTUNIDADES, selectedOportunidad.id);
      await updateDoc(oportunidadRef, {
        ubicacion: {
          lat: tempLocation.lat,
          lng: tempLocation.lng,
          direccion: tempLocation.direccion.trim(),
        },
        updatedAt: new Date(),
      });

      setSuccessMessage('Ubicación guardada correctamente');
      setShowSuccessModal(true);
      handleCloseModal();
    } catch (error) {
      console.error('Error saving location:', error);
      setErrorMessage('No se pudo guardar la ubicación. Intenta de nuevo.');
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLocation = (oportunidad: Oportunidad) => {
    setOportunidadToDelete(oportunidad);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!oportunidadToDelete) return;

    try {
      const oportunidadRef = doc(db, COLLECTIONS.OPORTUNIDADES, oportunidadToDelete.id);
      await updateDoc(oportunidadRef, {
        ubicacion: null,
        updatedAt: new Date(),
      });

      setSuccessMessage('Ubicación eliminada correctamente');
      setShowSuccessModal(true);
      setShowDeleteConfirm(false);
      setOportunidadToDelete(null);
    } catch (error) {
      console.error('Error removing location:', error);
      setErrorMessage('No se pudo eliminar la ubicación');
      setShowErrorModal(true);
      setShowDeleteConfirm(false);
      setOportunidadToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setShowMapModal(false);
    setSelectedOportunidad(null);
    setTempLocation(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setOportunidadToDelete(null);
  };

  return {
    // Estados
    selectedOportunidad,
    showMapModal,
    tempLocation,
    saving,
    showErrorModal,
    errorMessage,
    showSuccessModal,
    successMessage,
    showDeleteConfirm,
    oportunidadToDelete,

    // Acciones
    handleOpenMap,
    handleMapPress,
    updateDireccion,
    handleSaveLocation,
    handleRemoveLocation,
    handleConfirmDelete,
    handleCloseModal,
    handleCancelDelete,
    setShowErrorModal,
    setShowSuccessModal,
  };
};
