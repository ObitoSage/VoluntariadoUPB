# 🌱 VoluntariadoUPB

**Plataforma móvil para conectar estudiantes de la Universidad Privada Boliviana con oportunidades de voluntariado**

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Demo](#-demo)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Setup del Proyecto](#-setup-del-proyecto)
- [Autores](#-autores)

---

## 📖 Descripción

**VoluntariadoUPB** es una aplicación móvil desarrollada con React Native y Expo que facilita la conexión entre estudiantes de la Universidad Privada Boliviana y oportunidades de voluntariado. La plataforma permite a los estudiantes descubrir, postularse y gestionar actividades de voluntariado, mientras que organizadores pueden crear y administrar oportunidades.

### Problema que Resuelve

- Centraliza todas las oportunidades de voluntariado de la UPB en una sola plataforma
- Facilita la comunicación entre organizadores y estudiantes
- Automatiza el proceso de postulación y seguimiento
- Gamifica la experiencia con metas y logros personalizados

---

## ✨ Características

### Para Estudiantes 👨‍🎓

- **Exploración de Oportunidades**: Búsqueda y filtrado por categoría, campus, modalidad
- **Sistema de Postulaciones**: Proceso simplificado con seguimiento en tiempo real
- **Notificaciones Push**: Alertas de nuevas oportunidades, cambios de estado, recordatorios
- **Perfil Personalizado**: Avatar, biografía, intereses, estadísticas de participación
- **Sistema de Metas**: Establece objetivos de horas de voluntariado
- **Mapa Interactivo**: Visualización geográfica de oportunidades cercanas
- **Modo Claro/Oscuro**: Interfaz adaptable a preferencias del usuario

### Para Organizadores 👔

- **Gestión de Oportunidades**: Crear, editar y eliminar actividades
- **Panel de Administración**: Revisión y gestión de postulaciones
- **Gestión de Cupos**: Control automático de disponibilidad
- **Notificaciones**: Alertas de nuevas postulaciones

### Para Administradores 👑

- **Dashboard Completo**: Visualización de todas las oportunidades y postulaciones
- **Gestión de Usuarios**: Asignación de roles (estudiante, organizador, admin)
- **Moderación de Contenido**: Aprobación/rechazo de oportunidades

---

## 🎥 Demo

> 📺 **[Ver Video Demo en YouTube](https://youtu.be/x7SMUoQIKZs?feature=shared)**
> **[Ver Video Demo en Drive](https://drive.google.com/file/d/1Ep1Nv3pEXVZzJRgda5dU2OKPF9KW78-Y/view?usp=drivesdk)**

El video incluye:
- Contexto de la aplicación
- Tour completo de la aplicación
- Flujo de postulación a oportunidades
- Sistema de notificaciones en acción
- Panel de administración
- Funcionalidades de mapa y búsqueda

---

## 🏗️ Arquitectura

```
VoluntariadoUPB/
│
├── Frontend (React Native + Expo)
│   ├── Expo Router (Navegación file-based)
│   ├── Zustand (State Management)
│   ├── Firebase SDK (Auth + Firestore)
│   └── Expo Notifications (Push Local)
│
├── Backend (Firebase)
│   ├── Authentication (Email/Password + Google)
│   ├── Firestore (Base de datos NoSQL)
│   ├── Storage (Imágenes vía Cloudinary)
│   └── Security Rules (Control de acceso)
│
└── Servicios Externos
    ├── Cloudinary (CDN de imágenes)
    ├── Google Maps (Mapas y geocodificación)
    └── Google Sign-In (OAuth)
```

### Flujo de Datos

1. **Autenticación**: Firebase Auth → Zustand Store → UI
2. **Oportunidades**: Firestore (onSnapshot) → Zustand → Cards
3. **Postulaciones**: Form → Firestore → Notificación Local
4. **Notificaciones**: Firestore Listeners → Expo Notifications
5. **Imágenes**: ImagePicker → Cloudinary API → Firestore URL

---

## 🛠️ Tecnologías

### Core

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **React Native** | 0.81.4 | Framework móvil multiplataforma |
| **Expo** | ~54.0.10 | Herramientas de desarrollo y build |
| **TypeScript** | ~5.9.2 | Tipado estático |
| **Firebase** | 12.3.0 | Backend-as-a-Service (Auth, Firestore) |

### Navegación y UI

| Librería | Versión | Uso |
|----------|---------|-----|
| **expo-router** | ~6.0.9 | Navegación file-based con Expo Router |
| **@react-navigation/drawer** | ^7.5.8 | Drawer navigation |
| **react-native-reanimated** | ~4.1.1 | Animaciones nativas |
| **react-native-gesture-handler** | ^2.28.0 | Gestos táctiles |
| **@expo/vector-icons** | ^15.0.2 | Iconografía (Ionicons, MaterialIcons) |

### Estado y Almacenamiento

| Librería | Versión | Uso |
|----------|---------|-----|
| **zustand** | ^4.5.7 | State management global |
| **@react-native-async-storage/async-storage** | 2.2.0 | Persistencia local |

### Autenticación y Servicios

| Librería | Versión | Uso |
|----------|---------|-----|
| **@react-native-google-signin/google-signin** | ^16.0.0 | Inicio de sesión con Google |
| **expo-auth-session** | ~7.0.8 | OAuth flows |
| **expo-web-browser** | ~15.0.8 | Browser in-app para OAuth |

### Notificaciones

| Librería | Versión | Uso |
|----------|---------|-----|
| **expo-notifications** | ^0.32.12 | Push notifications locales |
| **expo-task-manager** | ~14.0.8 | Background tasks |
| **expo-background-fetch** | ~14.0.7 | Fetch en segundo plano |

### Localización y Mapas

| Librería | Versión | Uso |
|----------|---------|-----|
| **react-native-maps** | 1.20.1 | Mapas interactivos |
| **expo-location** | ~19.0.7 | Geolocalización |

### Media y Assets

| Librería | Versión | Uso |
|----------|---------|-----|
| **expo-image-picker** | ^17.0.8 | Selección de imágenes |
| **expo-linear-gradient** | ~15.0.7 | Gradientes |

### Utilidades

| Librería | Versión | Uso |
|----------|---------|-----|
| **date-fns** | ^4.1.0 | Manipulación de fechas |
| **uuid** | ^13.0.0 | Generación de IDs únicos |

---

## 🚀 Setup del Proyecto

### Prerrequisitos

- **Node.js**: v18 o superior
- **npm** o **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go App**: Instalada en tu dispositivo móvil ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))
- **Cuenta de Firebase**: [console.firebase.google.com](https://console.firebase.google.com)
- **Cuenta de Cloudinary**: [cloudinary.com](https://cloudinary.com) (opcional, para imágenes)

---

## 👥 Autores

**Fabian Azeñas**
**Edwin Burgos**
**Camilo Zuleta**
- GitHub: [@ObitoSage](https://github.com/ObitoSage)
- Proyecto: VoluntariadoUPB - Universidad Privada Boliviana


---

## 🙏 Agradecimientos

- Docente Paul Landaeta Flores
- Comunidad de React Native y Expo

---

<div align="center">


🌱 Juntos hacemos la diferencia 🌱

</div>
