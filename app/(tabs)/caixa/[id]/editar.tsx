import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { caixaApi, type FechamentoCaixa, type StatusCaixa } from "@/services/caixa";

function toLocalDateTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export default function CaixaEditarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<FechamentoCaixa | null>(null);
  const [dataAbertura, setDataAbertura] = useState("");
  const [dataFechamento, setDataFechamento] = useState("");
  const [valorInicial, setValorInicial] = useState("");
  const [valorEsperado, setValorEsperado] = useState("");
  const [valorConferido, setValorConferido] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [status, setStatus] = useState<StatusCaixa>("aberto");
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    caixaApi
      .buscar(id)
      .then((f) => {
        setItem(f);
        setDataAbertura(toLocalDateTime(f.dataAbertura));
        setDataFechamento(toLocalDateTime(f.dataFechamento));
        setValorInicial(String(f.valorInicial));
        setValorEsperado(f.valorEsperado != null ? String(f.valorEsperado) : "");
        setValorConferido(
          f.valorConferido != null ? String(f.valorConferido) : ""
        );
        setJustificativa(f.justificativa || "");
        setStatus(f.status);
        setObservacao(f.observacao || "");
      })
      .catch((e) => Alert.alert("Erro", (e as Error).message));
  }, [id]);

  const salvar = async () => {
    if (!id) return;
    const vInicial = parseFloat(valorInicial.replace(",", ".")) || 0;
    const vEsperado = valorEsperado
      ? parseFloat(valorEsperado.replace(",", "."))
      : null;
    const vConferido = valorConferido
      ? parseFloat(valorConferido.replace(",", "."))
      : null;
    const dif =
      vConferido != null && vEsperado != null ? vConferido - vEsperado : null;
    if (dif !== null && dif !== 0 && !justificativa.trim()) {
      Alert.alert(
        "Justificativa",
        "Quando há diferença, informe a justificativa (ajuste)."
      );
      return;
    }
    setSaving(true);
    try {
      await caixaApi.atualizar(id, {
        dataAbertura: dataAbertura ? new Date(dataAbertura).toISOString() : undefined,
        dataFechamento: dataFechamento
          ? new Date(dataFechamento).toISOString()
          : null,
        valorInicial: vInicial,
        valorEsperado: vEsperado,
        valorConferido: vConferido,
        justificativa: justificativa || null,
        status,
        observacao: observacao || null,
      });
      Alert.alert("Sucesso", "Fechamento atualizado.");
      router.back();
    } catch (e) {
      Alert.alert("Erro", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!item) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Carregando...</ThemedText>
      </ThemedView>
    );
  }

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
        <ThemedText style={styles.label}>Data/hora fechamento</ThemedText>
        <TextInput
          style={styles.input}
          value={dataFechamento}
          onChangeText={setDataFechamento}
          placeholder="Opcional"
        />
        <ThemedText style={styles.label}>Valor inicial (R$)</ThemedText>
        <TextInput
          style={styles.input}
          value={valorInicial}
          onChangeText={setValorInicial}
          keyboardType="decimal-pad"
        />
        <ThemedText style={styles.label}>Valor esperado (R$) — Conferência</ThemedText>
        <TextInput
          style={styles.input}
          value={valorEsperado}
          onChangeText={setValorEsperado}
          placeholder="0,00"
          keyboardType="decimal-pad"
        />
        <ThemedText style={styles.label}>Valor conferido (R$)</ThemedText>
        <TextInput
          style={styles.input}
          value={valorConferido}
          onChangeText={setValorConferido}
          placeholder="0,00"
          keyboardType="decimal-pad"
        />
        <ThemedText style={styles.label}>
          Justificativa (obrigatório se houver diferença)
        </ThemedText>
        <TextInput
          style={[styles.input, styles.area]}
          value={justificativa}
          onChangeText={setJustificativa}
          placeholder="Ajuste e justificativa"
          multiline
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
          multiline
        />
        <TouchableOpacity
          style={[styles.btn, saving && styles.btnDisabled]}
          onPress={salvar}
          disabled={saving}
        >
          <Text style={styles.btnText}>{saving ? "Salvando..." : "Salvar"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
