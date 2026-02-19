import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { fornecedoresApi, type Fornecedor } from "@/services/fornecedores";

export default function FornecedorDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Fornecedor | null>(null);

  useEffect(() => {
    if (!id) return;
    fornecedoresApi.buscar(id).then(setItem).catch((e) => Alert.alert("Erro", (e as Error).message));
  }, [id]);

  const excluir = () => {
    if (!id) return;
    Alert.alert("Excluir", "Excluir este fornecedor?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await fornecedoresApi.excluir(id);
            router.back();
          } catch (e) {
            Alert.alert("Erro", (e as Error).message);
          }
        },
      },
    ]);
  };

  if (!item) return <ThemedView style={styles.center}><ThemedText>Carregando...</ThemedText></ThemedView>;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.block}>
          <ThemedText type="subtitle">{item.razaoSocial}</ThemedText>
          <ThemedText style={styles.meta}>CNPJ: {item.cnpj}</ThemedText>
          <ThemedText style={styles.meta}>Endereço: {item.endereco || "—"}</ThemedText>
          <ThemedText style={styles.meta}>Telefone: {item.telefone || "—"}</ThemedText>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnEditar} onPress={() => router.push(`/estoque/fornecedores/${id}/editar`)}>
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
  block: { marginBottom: 20 },
  meta: { marginTop: 4 },
  actions: { flexDirection: "row", gap: 12, marginTop: 16 },
  btnEditar: { flex: 1, padding: 16, backgroundColor: Colors.light.tint, borderRadius: 12, alignItems: "center" },
  btnExcluir: { flex: 1, padding: 16, backgroundColor: "#c00", borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
});
