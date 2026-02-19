import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
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
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

export default function CaixaListScreen() {
  const router = useRouter();
  const [lista, setLista] = useState<FechamentoCaixa[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const res = await caixaApi.listar();
      setLista(res);
    } catch (e) {
      Alert.alert("Erro", (e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    carregar();
  }, [carregar]);

  const onRefresh = () => {
    setRefreshing(true);
    carregar();
  };

  const onNovo = () => router.push("/caixa/novo");
  const onItem = (id: string) => router.push(`/caixa/${id}`);

  const renderItem = ({ item }: { item: FechamentoCaixa }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onItem(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardRow}>
        <ThemedText type="defaultSemiBold">#{item.id}</ThemedText>
        <ThemedText style={styles.status}>{statusLabel(item.status)}</ThemedText>
      </View>
      <ThemedText style={styles.cardDate}>
        Abertura: {formatDate(item.dataAbertura)}
      </ThemedText>
      {item.dataFechamento && (
        <ThemedText style={styles.cardDate}>
          Fechamento: {formatDate(item.dataFechamento)}
        </ThemedText>
      )}
      <View style={styles.cardRow}>
        <ThemedText>Inicial: {formatMoney(item.valorInicial)}</ThemedText>
        {item.valorConferido != null && (
          <ThemedText>Conferido: {formatMoney(item.valorConferido)}</ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText style={styles.loadingText}>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.btnNovo} onPress={onNovo}>
        <Text style={styles.btnNovoText}>+ Novo Fechamento</Text>
      </TouchableOpacity>
      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <ThemedText style={styles.empty}>Nenhum fechamento cadastrado.</ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8 },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  cardDate: { fontSize: 14, marginTop: 2 },
  status: { fontSize: 12, opacity: 0.9 },
  empty: { textAlign: "center", marginTop: 24 },
  btnNovo: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    alignItems: "center",
  },
  btnNovoText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
