import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { pedidosApi, type Pedido } from "@/services/pedidos";
import { imprimirPedido } from "@/utils/pedidoPdf";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

export default function PedidoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Pedido | null>(null);

  useEffect(() => {
    if (!id) return;
    pedidosApi.buscar(id).then(setItem).catch((e) => Alert.alert("Erro", (e as Error).message));
  }, [id]);

  const gerarPdf = () => {
    if (!item) return;
    if (Platform.OS === "web") {
      imprimirPedido(item);
    } else {
      Alert.alert("PDF", "Use a versão web para imprimir ou gerar PDF do pedido.");
    }
  };

  if (!item) return <ThemedView style={styles.center}><ThemedText>Carregando...</ThemedText></ThemedView>;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.block}>
          <ThemedText type="subtitle">Código do pedido</ThemedText>
          <ThemedText style={styles.codigo}>{item.codigo}</ThemedText>
          <ThemedText style={styles.meta}>Data: {formatDate(item.createdAt)}</ThemedText>
          <ThemedText style={styles.meta}>Forma de pagamento: {item.formaPagamento}</ThemedText>
        </View>
        <View style={styles.block}>
          <ThemedText type="subtitle">Itens</ThemedText>
          {item.itens.map((i, idx) => (
            <View key={idx} style={styles.itemRow}>
              <ThemedText>{i.nome} × {i.quantidade}</ThemedText>
              <ThemedText>Valor unit: R$ {i.valor.toFixed(2)} → R$ {i.valorFinal.toFixed(2)}</ThemedText>
              <ThemedText type="defaultSemiBold">Total: R$ {i.valorTotalItem.toFixed(2)}</ThemedText>
            </View>
          ))}
        </View>
        <View style={styles.block}>
          <ThemedText>Valor total: R$ {item.valorTotal.toFixed(2)}</ThemedText>
          <ThemedText type="defaultSemiBold">Valor com desconto: R$ {item.valorComDesconto.toFixed(2)}</ThemedText>
        </View>
        <TouchableOpacity style={styles.btnPdf} onPress={gerarPdf}>
          <Text style={styles.btnText}>Gerar PDF / Imprimir resumo</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { padding: 16, paddingBottom: 32 },
  block: { marginBottom: 20 },
  codigo: { fontSize: 18, fontWeight: "700", marginVertical: 4 },
  meta: { marginTop: 4 },
  itemRow: { padding: 8, marginBottom: 8, backgroundColor: "#f9fafb", borderRadius: 8 },
  btnPdf: { marginTop: 16, padding: 16, backgroundColor: Colors.light.tint, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
});
