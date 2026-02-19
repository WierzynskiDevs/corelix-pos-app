import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { produtosApi, type Produto } from "@/services/produtos";

const ESTOQUE_ALERTA = 50;

export default function ProdutosListScreen() {
  const router = useRouter();
  const [lista, setLista] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const res = await produtosApi.listar();
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

  const renderItem = ({ item }: { item: Produto }) => {
    const alerta = item.quantidadeEstoque < ESTOQUE_ALERTA;
    return (
      <TouchableOpacity
        style={[styles.card, alerta && styles.cardAlert]}
        onPress={() => router.push(`/estoque/produtos/${item.id}`)}
      >
        <View style={styles.cardRow}>
          <ThemedText type="defaultSemiBold">{item.nome}</ThemedText>
          {alerta && (
            <View style={styles.badge}><Text style={styles.badgeText}>Estoque &lt; 50</Text></View>
          )}
        </View>
        <ThemedText style={styles.meta}>
          R$ {item.valor.toFixed(2)}
          {item.desconto > 0 && (
            <ThemedText> → R$ {item.valorFinal.toFixed(2)} ({item.desconto}% desc)</ThemedText>
          )}
        </ThemedText>
        <ThemedText style={styles.meta}>
          Estoque: {item.quantidadeEstoque} • Em pedidos: {item.quantidadePedidos}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.btnNovo}
        onPress={() => router.push("/estoque/produtos/novo")}
      >
        <Text style={styles.btnNovoText}>+ Novo Produto</Text>
      </TouchableOpacity>
      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} />
        }
        ListEmptyComponent={<ThemedText style={styles.empty}>Nenhum produto.</ThemedText>}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16, paddingBottom: 32 },
  btnNovo: {
    margin: 16,
    padding: 14,
    backgroundColor: Colors.light.tint,
    borderRadius: 10,
    alignItems: "center",
  },
  btnNovoText: { color: "#fff", fontWeight: "600" },
  card: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardAlert: { borderColor: "#f59e0b", backgroundColor: "#fffbeb" },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  meta: { fontSize: 13, marginTop: 4 },
  badge: { backgroundColor: "#f59e0b", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 24 },
});
