import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { fornecedoresApi } from "@/services/fornecedores";
import { ThemedText } from "@/components/themed-text";

export default function FornecedorEditarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [cnpj, setCnpj] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fornecedoresApi.buscar(id).then((f) => {
      setCnpj(f.cnpj || "");
      setRazaoSocial(f.razaoSocial || "");
      setEndereco(f.endereco || "");
      setTelefone(f.telefone || "");
    }).catch((e) => Alert.alert("Erro", (e as Error).message));
  }, [id]);

  const salvar = async () => {
    if (!id || !razaoSocial.trim()) return;
    setSaving(true);
    try {
      await fornecedoresApi.atualizar(id, { cnpj, razaoSocial: razaoSocial.trim(), endereco, telefone });
      Alert.alert("Sucesso", "Fornecedor atualizado.");
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
        <ThemedText style={styles.label}>CNPJ</ThemedText>
        <TextInput style={styles.input} value={cnpj} onChangeText={setCnpj} placeholder="00.000.000/0001-00" />
        <ThemedText style={styles.label}>Razão Social *</ThemedText>
        <TextInput style={styles.input} value={razaoSocial} onChangeText={setRazaoSocial} placeholder="Razão Social" />
        <ThemedText style={styles.label}>Endereço</ThemedText>
        <TextInput style={styles.input} value={endereco} onChangeText={setEndereco} placeholder="Endereço" />
        <ThemedText style={styles.label}>Telefone</ThemedText>
        <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} placeholder="(00) 0000-0000" />
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
  btn: { marginTop: 8, padding: 16, backgroundColor: Colors.light.tint, borderRadius: 12, alignItems: "center" },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
