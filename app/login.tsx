import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/theme";

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [loginStr, setLoginStr] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    if (!loginStr.trim() || !senha) {
      Alert.alert("Atenção", "Preencha login e senha.");
      return;
    }
    try {
      await login(loginStr.trim(), senha);
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert("Erro", (e as Error).message);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Corelix POS
      </ThemedText>
      <ThemedText style={styles.subtitle}>Controle de Estoque</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Login (admin ou gu)"
        value={loginStr}
        onChangeText={setLoginStr}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.btn, isLoading && styles.btnDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.btnText}>{isLoading ? "Entrando..." : "Entrar"}</Text>
      </TouchableOpacity>
      <ThemedText style={styles.hint}>
        Admin: admin / admin123 • GU: gu / gu123
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: { textAlign: "center" },
  subtitle: { textAlign: "center", marginTop: 8, marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  btn: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  hint: { marginTop: 24, textAlign: "center", fontSize: 12, opacity: 0.8 },
});
