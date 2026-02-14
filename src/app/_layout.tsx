import React from 'react';
import { Stack } from 'expo-router';
import { DatabaseProvider } from '../context/DatabaseContext';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="demo" options={{ title: '诗词 Demo' }} />
      </Stack>
    </DatabaseProvider>
  );
}
