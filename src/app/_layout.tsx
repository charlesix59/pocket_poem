import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // 调试：验证资源是否被正确加载
  const assetId = require('../../assets/pocket_poem.db') as number;
  console.log('🗄️ 数据库 Asset ID:', assetId, typeof assetId);

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
        assetSource={{ assetId, forceOverwrite: true }}
        useSuspense={true}
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="poem-detail" 
              options={{ 
                title: '诗词详情',
                headerShown: true,
                headerBackTitle: '返回'
              }} 
            />
            <Stack.Screen name="demo" options={{ title: '诗词 Demo', headerShown: true }} />
            <Stack.Screen name="font-demo" options={{ title: '字体 Demo', headerShown: true }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
