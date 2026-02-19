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
import { fornecedoresApi, type Fornecedor } from "@/services/fornecedores";
import { produtosApi, valorFinalCalc } from "@/services/produtos";

export default function ProdutoEditarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [fornecedorId, setFornecedorId] = useState<string | null>(null);
  const [barCode, setBarCode] = useState("");
  const [desconto, setDesconto] = useState("");
  const [quantidadeEstoque, setQuantidadeEstoque] = useState("");
  const [quantidadePedidos, setQuantidadePedidos] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fornecedoresApi.listar().then(setFornecedores).catch(console.error);
  }, []);

  useEffect(() => {
    if (!id) return;
    produtosApi.buscar(id).then((p) => {
      setNome(p.nome);
      setDescricao(p.descricao || "");
      setValor(String(p.valor));
      setFornecedorId(p.fornecedorId || null);
      setBarCode(p.barCode || "");
      setDesconto(String(p.desconto));
      setQuantidadeEstoque(String(p.quantidadeEstoque));
      setQuantidadePedidos(String(p.quantidadePedidos));
    }).catch((e) => Alert.alert("Erro", (e as Error).message));
  }, [id]);

  const v = parseFloat(valor.replace(",", ".")) || 0;
  const d = parseFloat(desconto.replace(",", ".")) || 0;
  const valorF = valorFinalCalc(v, d);
  const qtdEstoque = parseInt(quantidadeEstoque, 10) || 0;
  const qtdPedidos = Math.min(parseInt(quantidadePedidos, 10) || 0, qtdEstoque);

  const salvar = async () => {
    if (!id || !nome.trim()) return;
    setSaving(true);
    try {
      await produtosApi.atualizar(id, {
        nome: nome.trim(),
        descricao: descricao.trim(),
        valor: v,
        desconto: d,
        fornecedorId: fornecedorId || null,
        barCode: barCode.trim(),
        quantidadeEstoque: qtdEstoque,
        quantidadePedidos: qtdPedidos,
      });
      Alert.alert("Sucesso", "Produto atualizado.");
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
        <ThemedText style={styles.label}>Nome *</ThemedText>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome" />
        <ThemedText style={styles.label}>Descrição</ThemedText>
        <TextInput style={[styles.input, styles.area]} value={descricao} onChangeText={setDescricao} placeholder="Descrição" multiline />
        <ThemedText style={styles.label}>Valor (R$)</ThemedText>
        <TextInput style={styles.input} value={valor} onChangeText={setValor} placeholder="0,00" keyboardType="decimal-pad" />
        <ThemedText style={styles.label}>Desconto (%)</ThemedText>
        <TextInput style={styles.input} value={desconto} onChangeText={setDesconto} placeholder="0" keyboardType="decimal-pad" />
        {v > 0 && <ThemedText style={styles.valorFinal}>Valor final: R$ {valorF.toFixed(2)}</ThemedText>}
        <ThemedText style={styles.label}>Fornecedor</ThemedText>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.chip, !fornecedorId && styles.chipActive]} onPress={() => setFornecedorId(null)}>
            <ThemedText style={!fornecedorId ? styles.chipTextActive : undefined}>Nenhum</ThemedText>
          </TouchableOpacity>
          {fornecedores.map((f) => (
            <TouchableOpacity key={f.id} style={[styles.chip, fornecedorId === f.id && styles.chipActive]} onPress={() => setFornecedorId(f.id)}>
              <ThemedText style={fornecedorId === f.id ? styles.chipTextActive : undefined} numberOfLines={1}>{f.razaoSocial}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        <ThemedText style={styles.label}>Código de barras</ThemedText>
        <TextInput style={styles.input} value={barCode} onChangeText={setBarCode} placeholder="Bar code" />
        <ThemedText style={styles.label}>Quantidade em estoque</ThemedText>
        <TextInput style={styles.input} value={quantidadeEstoque} onChangeText={setQuantidadeEstoque} placeholder="0" keyboardType="number-pad" />
        <ThemedText style={styles.label}>Quantidade em pedidos (não pode ser maior que estoque)</ThemedText>
        <TextInput style={styles.input} value={quantidadePedidos} onChangeText={setQuantidadePedidos} placeholder="0" keyboardType="number-pad" />
        <TouchableOpacity style={[styles.btn, saving && styles.btnDisabled]} onPress={salvar} disabled={saving}>
          <Text style={styles.btnText}>{saving ? "Salvando..." : "Salvar"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32 },
  label: { marginBottom: 6, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  area: { minHeight: 60 },
  valorFinal: { marginBottom: 16, fontWeight: "600" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#ccc" },
  chipActive: { backgroundColor: Colors.light.tint, borderColor: Colors.light.tint },
  chipTextActive: { color: "#fff" },
  btn: { marginTop: 8, padding: 16, backgroundColor: Colors.light.tint, borderRadius: 12, alignItems: "center" },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
