import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import { StorageService } from '@/services';
import { STORAGE_KEYS, COLORS } from '@/constants';

import LoginScreen from '@/screens/LoginScreen';
import OtpScreen from '@/screens/OtpScreen';
import SessionScreen from '@/screens/SessionScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface SessionData {
  email: string;
  startTime: number;
}

export default function RootNavigator() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Login');
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const session = await StorageService.get<SessionData>(STORAGE_KEYS.SESSION);
        if (session && session.email && session.startTime) {
          setInitialRoute('Session');
          setSessionEmail(session.email);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
        />
        <Stack.Screen 
          name="Otp" 
          component={OtpScreen}
        />
        <Stack.Screen 
          name="Session" 
          component={SessionScreen}
          initialParams={sessionEmail ? { email: sessionEmail } : undefined}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
