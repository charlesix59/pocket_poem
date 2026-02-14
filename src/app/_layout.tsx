import React, { Suspense } from 'react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#666" />
        </View>
      }
    >
      <SQLiteProvider
        databaseName="pocket_poem.db"
        assetSource={{ assetId: require('../../assets/pocket_poem.db') as number, forceOverwrite: true }}
        useSuspense={true}
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="demo" options={{ title: '诗词 Demo' }} />
        </Stack>
      </SQLiteProvider>
    </Suspense>
  );
}
