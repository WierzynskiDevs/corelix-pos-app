import { Stack } from "expo-router";
import React from "react";

export default function CaixaLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "Caixa",
        headerBackTitle: "Voltar",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Fechamento de Caixa" }} />
      <Stack.Screen name="novo" options={{ title: "Novo Fechamento" }} />
      <Stack.Screen name="[id]" options={{ title: "Detalhe" }} />
      <Stack.Screen name="[id]/editar" options={{ title: "Editar Fechamento" }} />
    </Stack>
  );
}
