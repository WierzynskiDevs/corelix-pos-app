import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { pedidosApi, type Pedido } from "@/services/pedidos";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

export default function PedidosListScreen() {
  const router = useRouter();
  const [lista, setLista] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const res = await pedidosApi.listar();
      setLista(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const renderItem = ({ item }: { item: Pedido }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/estoque/pedidos/${item.id}`)}
    >
      <ThemedText type="defaultSemiBold">{item.codigo}</ThemedText>
      <ThemedText style={styles.meta}>{formatDate(item.createdAt)}</ThemedText>
      <ThemedText style={styles.meta}>Total: {formatMoney(item.valorComDesconto)} • {item.formaPagamento}</ThemedText>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.btnNovo} onPress={() => router.push("/estoque/pedidos/novo")}>
        <ThemedText style={styles.btnNovoText}>+ Novo Pedido</ThemedText>
      </TouchableOpacity>
      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} />}
        ListEmptyComponent={<ThemedText style={styles.empty}>Nenhum pedido.</ThemedText>}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16, paddingBottom: 32 },
  btnNovo: { margin: 16, padding: 14, backgroundColor: Colors.light.tint, borderRadius: 10, alignItems: "center" },
  btnNovoText: { color: "#fff", fontWeight: "600" },
  card: { padding: 14, marginBottom: 10, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  meta: { fontSize: 13, marginTop: 4 },
  empty: { textAlign: "center", marginTop: 24 },
});
