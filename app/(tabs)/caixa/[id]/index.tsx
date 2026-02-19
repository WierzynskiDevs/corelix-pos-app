import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { caixaApi, type FechamentoCaixa } from "@/services/caixa";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

function formatMoney(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

function statusLabel(s: FechamentoCaixa["status"]) {
  const map: Record<FechamentoCaixa["status"], string> = {
    aberto: "Aberto",
    pendente_conferencia: "Pendente conferência",
    com_diferenca: "Com diferença",
    fechado: "Fechado",
  };
  return map[s] ?? s;
}

export default function CaixaDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<FechamentoCaixa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    caixaApi
      .buscar(id)
      .then(setItem)
      .catch((e) => Alert.alert("Erro", (e as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  const excluir = () => {
    if (!id) return;
    Alert.alert(
      "Excluir",
      "Deseja realmente excluir este fechamento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await caixaApi.excluir(id);
              router.replace("/caixa");
            } catch (e) {
              Alert.alert("Erro", (e as Error).message);
            }
          },
        },
      ]
    );
  };

  if (loading || !item) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>{loading ? "Carregando..." : "Não encontrado."}</ThemedText>
      </ThemedView>
    );
  }

  const diferenca =
    item.valorConferido != null && item.valorEsperado != null
      ? item.valorConferido - item.valorEsperado
      : null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.block}>
          <ThemedText type="subtitle">Identificação</ThemedText>
          <ThemedText>ID: {item.id}</ThemedText>
          <ThemedText>Status: {statusLabel(item.status)}</ThemedText>
        </View>
        <View style={styles.block}>
          <ThemedText type="subtitle">Datas</ThemedText>
          <ThemedText>Abertura: {formatDate(item.dataAbertura)}</ThemedText>
          <ThemedText>Fechamento: {formatDate(item.dataFechamento)}</ThemedText>
        </View>
        <View style={styles.block}>
          <ThemedText type="subtitle">Valores (fluxo do diagrama)</ThemedText>
          <ThemedText>Valor inicial: {formatMoney(item.valorInicial)}</ThemedText>
          <ThemedText>Valor esperado: {formatMoney(item.valorEsperado)}</ThemedText>
          <ThemedText>Valor conferido: {formatMoney(item.valorConferido)}</ThemedText>
          {diferenca != null && (
            <ThemedText
              style={diferenca !== 0 ? styles.diferenca : undefined}
            >
              Diferença: {formatMoney(diferenca)}
            </ThemedText>
          )}
        </View>
        {item.justificativa && (
          <View style={styles.block}>
            <ThemedText type="subtitle">Justificativa (ajuste)</ThemedText>
            <ThemedText>{item.justificativa}</ThemedText>
          </View>
        )}
        {item.observacao && (
          <View style={styles.block}>
            <ThemedText type="subtitle">Observação</ThemedText>
            <ThemedText>{item.observacao}</ThemedText>
          </View>
        )}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btnEditar}
            onPress={() => router.push(`/caixa/${id}/editar`)}
          >
            <Text style={styles.btnText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnExcluir} onPress={excluir}>
            <Text style={styles.btnText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { padding: 16, paddingBottom: 32 },
  block: { marginBottom: 24 },
  diferenca: { color: "#c00" },
  actions: { flexDirection: "row", gap: 12, marginTop: 16 },
  btnEditar: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    alignItems: "center",
  },
  btnExcluir: {
    flex: 1,
    padding: 16,
    backgroundColor: "#c00",
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
});
