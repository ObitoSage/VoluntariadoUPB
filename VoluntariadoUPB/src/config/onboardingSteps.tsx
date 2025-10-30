import React from 'react';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const ONBOARDING_STEPS = [
{
    key: 'welcome',
    title: 'Bienvenido a VoluntariadoUPB',
    subtitle: 'Únete a nuestra comunidad de voluntarios y marca la diferencia en tu universidad y comunidad.',
    image: <Ionicons name="heart-circle" size={120} color="#217868" />,
    backgroundColor: '#fff',
},
{
    key: 'opportunities',
    title: 'Descubre Oportunidades',
    subtitle: 'Explora una variedad de proyectos de voluntariado que se ajusten a tus intereses y disponibilidad.',
    image: <Ionicons name="search-circle" size={120} color="#217868" />,
    backgroundColor: '#fff',
},
{
    key: 'apply',
    title: 'Postúlate Fácilmente',
    subtitle: 'Aplica a las oportunidades que más te gusten con solo unos toques. Gestiona tus postulaciones desde tu perfil.',
    image: <Ionicons name="document-text" size={120} color="#217868" />,
    backgroundColor: '#fff',
},
{
    key: 'plantini',
    title: 'Plantini, Tu Asistente',
    subtitle: 'Tu amigo de confianza que te ayudará a resolver dudas sobre la app, oportunidades y tu perfil.',
    image: (
    <Image
        source={require('../../assets/Plantini/plantini.png')}
        style={{ width: 140, height: 140 }}
        resizeMode="contain"
    />
    ),
    backgroundColor: '#fff',
},
{
    key: 'ready',
    title: '¡Todo Listo!',
    subtitle: 'Comienza tu aventura como voluntario y contribuye a hacer del mundo un lugar mejor.',
    image: <Ionicons name="rocket" size={120} color="#217868" />,
    backgroundColor: '#fff',
},
];
