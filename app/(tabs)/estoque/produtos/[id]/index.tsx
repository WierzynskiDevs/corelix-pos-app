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
import { produtosApi, type Produto } from "@/services/produtos";

const ESTOQUE_ALERTA = 50;

export default function ProdutoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Produto | null>(null);

  useEffect(() => {
    if (!id) return;
    produtosApi.buscar(id).then(setItem).catch((e) => Alert.alert("Erro", (e as Error).message));
  }, [id]);

  const excluir = () => {
    if (!id) return;
    Alert.alert("Excluir", "Excluir este produto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await produtosApi.excluir(id);
            router.back();
          } catch (e) {
            Alert.alert("Erro", (e as Error).message);
          }
        },
      },
    ]);
  };

  if (!item) return <ThemedView style={styles.center}><ThemedText>Carregando...</ThemedText></ThemedView>;

  const alerta = item.quantidadeEstoque < ESTOQUE_ALERTA;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {alerta && (
          <View style={styles.alertBanner}>
            <ThemedText style={styles.alertText}>⚠ Estoque abaixo de 50 unidades</ThemedText>
          </View>
        )}
        <View style={styles.block}>
          <ThemedText type="subtitle">{item.nome}</ThemedText>
          <ThemedText style={styles.meta}>{item.descricao || "—"}</ThemedText>
        </View>
        <View style={styles.block}>
          <ThemedText>Valor: R$ {item.valor.toFixed(2)}</ThemedText>
          {item.desconto > 0 && (
            <ThemedText>Desconto: {item.desconto}% → Valor final: R$ {item.valorFinal.toFixed(2)}</ThemedText>
          )}
          {item.desconto === 0 && <ThemedText>Valor final: R$ {item.valorFinal.toFixed(2)}</ThemedText>}
        </View>
        <View style={styles.block}>
          <ThemedText>Valor de compra: R$ {item.valorCompra.toFixed(2)} (não editável)</ThemedText>
          <ThemedText>Código de barras: {item.barCode || "—"}</ThemedText>
          <ThemedText>Quantidade em estoque: {item.quantidadeEstoque}</ThemedText>
          <ThemedText>Quantidade em pedidos: {item.quantidadePedidos}</ThemedText>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnEditar} onPress={() => router.push(`/estoque/produtos/${id}/editar`)}>
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
  alertBanner: { backgroundColor: "#fef3c7", padding: 12, borderRadius: 8, marginBottom: 16 },
  alertText: { color: "#92400e", fontWeight: "600" },
  block: { marginBottom: 20 },
  meta: { marginTop: 4 },
  actions: { flexDirection: "row", gap: 12, marginTop: 16 },
  btnEditar: { flex: 1, padding: 16, backgroundColor: Colors.light.tint, borderRadius: 12, alignItems: "center" },
  btnExcluir: { flex: 1, padding: 16, backgroundColor: "#c00", borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
});
