import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { caixaApi, type StatusCaixa } from "@/services/caixa";

export default function CaixaNovoScreen() {
  const router = useRouter();
  const [dataAbertura, setDataAbertura] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [valorInicial, setValorInicial] = useState("");
  const [status, setStatus] = useState<StatusCaixa>("aberto");
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);

  const salvar = async () => {
    const vInicial = parseFloat(valorInicial.replace(",", ".")) || 0;
    setSaving(true);
    try {
      await caixaApi.criar({
        dataAbertura: new Date(dataAbertura).toISOString(),
        valorInicial: vInicial,
        status,
        observacao: observacao || null,
      });
      Alert.alert("Sucesso", "Fechamento criado.");
      router.back();
    } catch (e) {
      Alert.alert("Erro", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText style={styles.label}>Data/hora abertura</ThemedText>
        <TextInput
          style={styles.input}
          value={dataAbertura}
          onChangeText={setDataAbertura}
          placeholder="YYYY-MM-DDTHH:mm"
        />
        <ThemedText style={styles.label}>Valor inicial (R$)</ThemedText>
        <TextInput
          style={styles.input}
          value={valorInicial}
          onChangeText={setValorInicial}
          placeholder="0,00"
          keyboardType="decimal-pad"
        />
        <ThemedText style={styles.label}>Status</ThemedText>
        <View style={styles.row}>
          {(["aberto", "pendente_conferencia", "com_diferenca", "fechado"] as const).map(
            (s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, status === s && styles.chipActive]}
                onPress={() => setStatus(s)}
              >
                <ThemedText style={status === s ? styles.chipTextActive : undefined}>
                  {s === "aberto"
                    ? "Aberto"
                    : s === "pendente_conferencia"
                      ? "Pendente"
                      : s === "com_diferenca"
                        ? "Com dif."
                        : "Fechado"}
                </ThemedText>
              </TouchableOpacity>
            )
          )}
        </View>
        <ThemedText style={styles.label}>Observação</ThemedText>
        <TextInput
          style={[styles.input, styles.area]}
          value={observacao}
          onChangeText={setObservacao}
          placeholder="Opcional"
          multiline
        />
        <TouchableOpacity
          style={[styles.btn, saving && styles.btnDisabled]}
          onPress={salvar}
          disabled={saving}
        >
          <Text style={styles.btnText}>{saving ? "Salvando..." : "Criar"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32 },
  label: { marginBottom: 6, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  area: { minHeight: 80 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  chipActive: { backgroundColor: Colors.light.tint, borderColor: Colors.light.tint },
  chipTextActive: { color: "#fff" },
  btn: {
    marginTop: 8,
    padding: 16,
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
