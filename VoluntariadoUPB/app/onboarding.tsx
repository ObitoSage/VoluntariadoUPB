import React, { useCallback } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ONBOARDING_STEPS } from '../src/config/onboardingSteps';
import { useThemeColors } from '../src/hooks/useThemeColors';

export default function OnboardingScreen() {
const router = useRouter();
const { colors } = useThemeColors();

const finish = useCallback(async () => {
    router.replace('/(auth)/login');
}, [router]);

return (
    <SafeAreaView style={styles.container}>
    <Onboarding
    pages={ONBOARDING_STEPS.map(step => ({
        backgroundColor: step.backgroundColor,
        image: <View style={{ marginVertical: 10 }}>{step.image}</View>,
        title: step.title,
        subtitle: step.subtitle,
        titleStyles: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
        },
        subTitleStyles: {
        fontSize: 16,
        color: colors.subtitle,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 30,
        },
    }))}

    skipLabel="Saltar"
    nextLabel="Siguiente"
    doneLabel="¡Empezar!"

    bottomBarHighlight={false}
    containerStyles={{
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    }}
    controlStatusBar={false}
    transitionAnimationDuration={0}

    DotComponent={({ selected }: { selected: boolean }) => (
        <View
        style={{
            width: selected ? 24 : 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: selected ? colors.primary : '#D1D5DB',
            marginHorizontal: 4,
        }}
        />
    )}

    skipToLabel="Saltar"
    showSkip={true}
    showNext={true}
    showDone={true}

    skipButtonProps={{
        style: {
        paddingHorizontal: 20,
        },
        titleStyle: {
        color: colors.subtitle,
        fontSize: 16,
        fontWeight: '600',
        },
    }}

    nextButtonProps={{
        style: {
        paddingHorizontal: 20,
        },
        titleStyle: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '700',
        },
    }}

    doneButtonProps={{
        style: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        },
        titleStyle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        },
    }}

    onSkip={finish}
    onDone={finish}
    />
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#fff',
},
});
