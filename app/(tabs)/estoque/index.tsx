import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { fornecedoresApi, type Fornecedor } from "@/services/fornecedores";
import { produtosApi, type Produto } from "@/services/produtos";

const ESTOQUE_ALERTA = 50;

export default function EstoqueDashboardScreen() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [p, f] = await Promise.all([
        produtosApi.listar(),
        fornecedoresApi.listar(),
      ]);
      setProdutos(p);
      setFornecedores(f);
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

  const onRefresh = () => {
    setRefreshing(true);
    carregar();
  };

  const produtosComAlerta = produtos.filter((p) => p.quantidadeEstoque < ESTOQUE_ALERTA);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <TouchableOpacity
          style={styles.cardAction}
          onPress={() => router.push("/estoque/pedidos/novo")}
        >
          <ThemedText type="defaultSemiBold">+ Novo Pedido</ThemedText>
        </TouchableOpacity>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Produtos ({produtos.length})
        </ThemedText>
        {produtosComAlerta.length > 0 && (
          <View style={styles.alertBanner}>
            <ThemedText style={styles.alertText}>
              ⚠ {produtosComAlerta.length} produto(s) com estoque abaixo de {ESTOQUE_ALERTA} unidades
            </ThemedText>
          </View>
        )}
        {produtos.slice(0, 10).map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.card, p.quantidadeEstoque < ESTOQUE_ALERTA && styles.cardAlert]}
            onPress={() => router.push(`/estoque/produtos/${p.id}`)}
          >
            <View style={styles.cardRow}>
              <ThemedText type="defaultSemiBold">{p.nome}</ThemedText>
              {p.quantidadeEstoque < ESTOQUE_ALERTA && (
                <View style={styles.badge}><Text style={styles.badgeText}>Baixo</Text></View>
              )}
            </View>
            <ThemedText style={styles.cardMeta}>
              Estoque: {p.quantidadeEstoque} • Pedidos: {p.quantidadePedidos} • R$ {p.valorFinal.toFixed(2)}
            </ThemedText>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push("/estoque/produtos")}
        >
          <ThemedText type="link">Ver todos os produtos →</ThemedText>
        </TouchableOpacity>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Fornecedores ({fornecedores.length})
        </ThemedText>
        {fornecedores.slice(0, 5).map((f) => (
          <TouchableOpacity
            key={f.id}
            style={styles.card}
            onPress={() => router.push(`/estoque/fornecedores/${f.id}`)}
          >
            <ThemedText type="defaultSemiBold">{f.razaoSocial}</ThemedText>
            <ThemedText style={styles.cardMeta}>{f.telefone}</ThemedText>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push("/estoque/fornecedores")}
        >
          <ThemedText type="link">Ver todos os fornecedores →</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push("/estoque/pedidos")}
        >
          <ThemedText type="link">Ver pedidos →</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { padding: 16, paddingBottom: 32 },
  cardAction: {
    padding: 16,
    marginBottom: 20,
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    alignItems: "center",
  },
  sectionTitle: { marginBottom: 12 },
  alertBanner: {
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertText: { color: "#92400e", fontWeight: "600" },
  card: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardAlert: { borderColor: "#f59e0b", backgroundColor: "#fffbeb" },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardMeta: { fontSize: 13, marginTop: 4, opacity: 0.9 },
  badge: { backgroundColor: "#f59e0b", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  link: { marginTop: 8, marginBottom: 24 },
});
