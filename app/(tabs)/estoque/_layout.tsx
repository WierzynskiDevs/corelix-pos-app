import { Stack, useRouter } from "expo-router";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedText } from "@/components/themed-text";
import { View, StyleSheet, TouchableOpacity } from "react-native";

function HeaderRight() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const roleLabel = user?.role === "admin" ? "Admin" : "Gerente de Unidade";
  return (
    <View style={styles.headerRight}>
      <ThemedText style={styles.headerUser}>{user?.nome} ({roleLabel})</ThemedText>
      <TouchableOpacity
        onPress={() => {
          logout();
          router.replace("/login");
        }}
        style={styles.logoutBtn}
      >
        <ThemedText style={styles.logoutText}>Sair</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

export default function EstoqueLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "Estoque",
        headerRight: () => <HeaderRight />,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Dashboard" }} />
      <Stack.Screen name="produtos" options={{ title: "Produtos" }} />
      <Stack.Screen name="fornecedores" options={{ title: "Fornecedores" }} />
      <Stack.Screen name="pedidos" options={{ title: "Pedidos" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerUser: { fontSize: 12 },
  logoutBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  logoutText: { fontSize: 12, color: "#0a7ea4" },
});
