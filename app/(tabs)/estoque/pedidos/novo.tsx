import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
import { pedidosApi, type FormaPagamento } from "@/services/pedidos";
import { produtosApi, type Produto } from "@/services/produtos";

const FORMAS: FormaPagamento[] = ["PIX", "Credito", "Debito", "VR", "VA"];

export default function PedidoNovoScreen() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [itens, setItens] = useState<{ produtoId: string; quantidade: number; produto?: Produto }[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("PIX");
  const [saving, setSaving] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const p = await produtosApi.listar();
      setProdutos(p);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const addItem = (produto: Produto) => {
    const disp = produto.quantidadeEstoque - produto.quantidadePedidos;
    if (disp <= 0) {
      Alert.alert("Sem estoque", "Produto sem quantidade disponível.");
      return;
    }
    const idx = itens.findIndex((i) => i.produtoId === produto.id);
    if (idx >= 0) {
      const current = itens[idx].quantidade;
      if (current >= disp) return;
      setItens((prev) => prev.map((it, i) => (i === idx ? { ...it, quantidade: it.quantidade + 1 } : it)));
    } else {
      setItens((prev) => [...prev, { produtoId: produto.id, quantidade: 1, produto }]);
    }
  };

  const removeItem = (produtoId: string) => {
    setItens((prev) => prev.filter((i) => i.produtoId !== produtoId));
  };

  const setQtd = (produtoId: string, qtd: number) => {
    const prod = produtos.find((p) => p.id === produtoId);
    if (!prod) return;
    const disp = prod.quantidadeEstoque - prod.quantidadePedidos;
    const newQtd = Math.max(0, Math.min(qtd, disp));
    setItens((prev) =>
      prev.map((i) => (i.produtoId === produtoId ? { ...i, quantidade: newQtd } : i)).filter((i) => i.quantidade > 0)
    );
  };

  let valorTotal = 0;
  let valorComDesconto = 0;
  itens.forEach((it) => {
    const p = produtos.find((x) => x.id === it.produtoId) || it.produto;
    if (p) {
      valorTotal += p.valor * it.quantidade;
      valorComDesconto += p.valorFinal * it.quantidade;
    }
  });

  const criar = async () => {
    if (itens.length === 0) {
      Alert.alert("Atenção", "Adicione ao menos um produto.");
      return;
    }
    setSaving(true);
    try {
      const pedido = await pedidosApi.criar({
        itens: itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
        formaPagamento,
      });
      Alert.alert("Pedido criado", `Código: ${pedido.codigo}\nValor: R$ ${pedido.valorComDesconto.toFixed(2)}`);
      router.replace(`/estoque/pedidos/${pedido.id}`);
    } catch (e) {
      Alert.alert("Erro", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="subtitle" style={styles.section}>Forma de pagamento</ThemedText>
        <View style={styles.row}>
          {FORMAS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, formaPagamento === f && styles.chipActive]}
              onPress={() => setFormaPagamento(f)}
            >
              <ThemedText style={formaPagamento === f ? styles.chipTextActive : undefined}>{f}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <ThemedText type="subtitle" style={styles.section}>Produtos disponíveis</ThemedText>
        {produtos.map((p) => {
          const disp = p.quantidadeEstoque - p.quantidadePedidos;
          return (
            <View key={p.id} style={styles.prodRow}>
              <ThemedText style={styles.flex1}>{p.nome} (R$ {p.valorFinal.toFixed(2)}) • disp: {disp}</ThemedText>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => addItem(p)}
                disabled={disp <= 0}
              >
                <ThemedText style={styles.addBtnText}>+</ThemedText>
              </TouchableOpacity>
            </View>
          );
        })}

        <ThemedText type="subtitle" style={styles.section}>Itens do pedido</ThemedText>
        {itens.length === 0 && <ThemedText style={styles.muted}>Nenhum item.</ThemedText>}
        {itens.map((it) => {
          const p = produtos.find((x) => x.id === it.produtoId) || it.produto;
          if (!p) return null;
          return (
            <View key={it.produtoId} style={styles.itemRow}>
              <ThemedText style={styles.flex1}>{p.nome} × {it.quantidade} = R$ {(p.valorFinal * it.quantidade).toFixed(2)}</ThemedText>
              <View style={styles.qtdRow}>
                <TouchableOpacity onPress={() => setQtd(it.produtoId, it.quantidade - 1)} style={styles.qtdBtn}>
                  <ThemedText>-</ThemedText>
                </TouchableOpacity>
                <TextInput
                  style={styles.qtdInput}
                  value={String(it.quantidade)}
                  onChangeText={(t) => setQtd(it.produtoId, parseInt(t, 10) || 0)}
                  keyboardType="number-pad"
                />
                <TouchableOpacity onPress={() => setQtd(it.produtoId, it.quantidade + 1)} style={styles.qtdBtn}>
                  <ThemedText>+</ThemedText>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => removeItem(it.produtoId)} style={styles.delBtn}>
                <ThemedText style={styles.delText}>Remover</ThemedText>
              </TouchableOpacity>
            </View>
          );
        })}

        {itens.length > 0 && (
          <View style={styles.totais}>
            <ThemedText>Valor total: R$ {valorTotal.toFixed(2)}</ThemedText>
            <ThemedText type="defaultSemiBold">Valor com desconto: R$ {valorComDesconto.toFixed(2)}</ThemedText>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btn, (saving || itens.length === 0) && styles.btnDisabled]}
          onPress={criar}
          disabled={saving || itens.length === 0}
        >
          <Text style={styles.btnText}>{saving ? "Criando..." : "Criar pedido"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 12 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#ccc" },
  chipActive: { backgroundColor: Colors.light.tint, borderColor: Colors.light.tint },
  chipTextActive: { color: "#fff" },
  prodRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  flex1: { flex: 1 },
  addBtn: { padding: 8, backgroundColor: Colors.light.tint, borderRadius: 8 },
  addBtnText: { color: "#fff", fontWeight: "600" },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, padding: 8, backgroundColor: "#f9fafb", borderRadius: 8 },
  qtdRow: { flexDirection: "row", alignItems: "center", marginRight: 8 },
  qtdBtn: { padding: 4 },
  qtdInput: { width: 40, textAlign: "center", borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 4 },
  delBtn: { padding: 4 },
  delText: { color: "#c00", fontSize: 12 },
  totais: { marginTop: 16, marginBottom: 16 },
  muted: { opacity: 0.7, marginBottom: 8 },
  btn: { padding: 16, backgroundColor: Colors.light.tint, borderRadius: 12, alignItems: "center" },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
