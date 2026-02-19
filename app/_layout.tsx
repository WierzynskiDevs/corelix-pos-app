import { useRouter, useSegments, Stack } from "expo-router";
import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function Redirect() {
  const { user } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  useEffect(() => {
    const inLogin = segments[0] === "login";
    if (!user && !inLogin) router.replace("/login");
    else if (user && inLogin) router.replace("/(tabs)");
  }, [user, segments]);
  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Redirect />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="modal" />
      </Stack>
    </AuthProvider>
  );
}
