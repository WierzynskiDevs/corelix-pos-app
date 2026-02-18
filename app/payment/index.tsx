import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

type PaymentMethod = "credit" | "debit" | "cash" | "pix";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const total = (params.total as string) || "0.00";

  // Parse cart items from params if available
  let cartItems: CartItem[] = [];
  try {
    const cartParam = params.cart as string;
    if (cartParam) {
      cartItems = JSON.parse(cartParam);
    }
  } catch (e) {
    cartItems = [];
  }

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    "credit",
  );
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(2); // 2: payment, 3: success

  // Estados para pagamentos múltiplos
  const [payments, setPayments] = useState<
    { method: PaymentMethod; amount: number; id: string }[]
  >([]);
  const [inputAmount, setInputAmount] = useState("");
  const [totalPaid, setTotalPaid] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState<number>(
    parseFloat(total) || 0,
  );
  const [change, setChange] = useState(0);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const paymentMethods = [
    {
      id: "credit" as const,
      name: "Cartão Crédito",
      icon: "💳",
      color: "#3b82f6",
    },
    {
      id: "debit" as const,
      name: "Cartão Débito",
      icon: "🏧",
      color: "#06b6d4",
    },
    {
      id: "pix" as const,
      name: "PIX",
      icon: "⚡",
      color: "#10b981",
    },
    {
      id: "cash" as const,
      name: "Dinheiro",
      icon: "💵",
      color: "#f59e0b",
    },
  ];

  const handlePayment = async () => {
    setLoading(true);
    // Simula processamento de pagamento
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 2000);
  };

  const handleBackToSales = () => {
    router.back();
  };

  const handleNewSale = () => {
    router.back();
  };

  // Atualiza totais quando pagamentos mudam
  React.useEffect(() => {
    const paid = payments.reduce((s, p) => s + p.amount, 0);
    setTotalPaid(Number(paid.toFixed(2)));

    const totalNum = parseFloat(total) || 0;
    const rem = Math.max(0, Number((totalNum - paid).toFixed(2)));
    setRemainingAmount(rem);

    // Se ainda houver restante, zera troco
    if (rem > 0) setChange(0);
  }, [payments, total]);

  // Ao entrar na etapa de pagamento, preencher campo com valor restante se houver forma selecionada
  React.useEffect(() => {
    if (step === 2 && selectedMethod) {
      setInputAmount(remainingAmount.toFixed(2));
    }
  }, [step, selectedMethod, remainingAmount]);

  const parseInputAmount = (value: string) => {
    const n = parseFloat(value.replace(",", "."));
    return isNaN(n) ? 0 : n;
  };

  const confirmPartialPayment = () => {
    const value = parseInputAmount(inputAmount);
    if (value <= 0) {
      Alert.alert("Valor inválido", "Digite um valor maior que zero.");
      return;
    }

    // Caixa: valor recebido deve ser >= restante
    if (selectedMethod === "cash") {
      if (value < remainingAmount) {
        Alert.alert(
          "Valor recebido insuficiente",
          "O valor em dinheiro informado é menor que o restante.",
        );
        return;
      }

      // Aplicar o restante como pagamento e calcular troco
      const applied = remainingAmount;
      const troco = Number((value - remainingAmount).toFixed(2));

      setPayments([
        ...payments,
        {
          method: "cash",
          amount: applied,
          id: Math.random().toString(36).slice(2, 9),
        },
      ]);
      setChange(troco);
      setInputAmount("");
      // limpar seleção para permitir nova forma
      setSelectedMethod(null);
      Alert.alert(
        "Pagamento parcial registrado",
        "Pagamento em dinheiro registrado.",
      );
      return;
    }

    // Não permitir pagamento maior que o restante (exceto dinheiro)
    if (value > remainingAmount) {
      Alert.alert(
        "Valor inválido",
        "O valor não pode ser maior que o restante.",
      );
      return;
    }

    setPayments([
      ...payments,
      {
        method: selectedMethod as PaymentMethod,
        amount: Number(value.toFixed(2)),
        id: Math.random().toString(36).slice(2, 9),
      },
    ]);
    setInputAmount("");
    // limpar seleção para permitir nova forma
    setSelectedMethod(null);
    Alert.alert("Pagamento parcial registrado", "Pagamento registrado.");
  };

  const removePayment = (id: string) => {
    setPayments(payments.filter((p) => p.id !== id));
    Alert.alert("Pagamento removido", "Pagamento parcial removido.");
  };

  const finalizeCombinedPayment = () => {
    if (remainingAmount > 0) {
      Alert.alert(
        "Pagamento incompleto",
        "O valor restante precisa ser quitado.",
      );
      return;
    }

    const tx = Math.random().toString(36).substring(2, 10).toUpperCase();
    setTransactionId(tx);
    Alert.alert("Pagamento concluído com sucesso", `Transação: ${tx}`);
    setStep(3);
  };

  // Single payment screen only (selection moved inline)

  // STEP 2: Pagamento (múltiplo)
  if (step === 2) {
    const totalNum = parseFloat(total) || 0;
    return (
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToSales}>
            <Text style={styles.closeButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PAGAMENTO</Text>
          <View style={{ width: 30 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* RESUMO */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Valor Total:</Text>
              <Text style={styles.summaryValue}>R$ {totalNum.toFixed(2)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pago:</Text>
              <Text style={styles.summaryValue}>R$ {totalPaid.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Restante:</Text>
              <Text style={styles.summaryValue}>
                R$ {remainingAmount.toFixed(2)}
              </Text>
            </View>

            {change > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Troco:</Text>
                  <Text style={[styles.summaryValue, { color: "#22c55e" }]}>
                    R$ {change.toFixed(2)}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* INPUT PARA PARCIAL */}
          <View style={{ marginBottom: 18 }}>
            <Text style={styles.sectionTitle}>Valor do Pagamento</Text>

            <TextInput
              placeholder="Valor (ex: 40.00)"
              value={inputAmount}
              onChangeText={setInputAmount}
              style={styles.modalInput}
              placeholderTextColor="#666"
              keyboardType="numeric"
            />

            {/* Método: selector inline - MOVED BELOW INPUT */}
            <View style={styles.selectorRow}>
              {paymentMethods.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => {
                    setSelectedMethod(m.id);
                    setInputAmount(remainingAmount.toFixed(2));
                  }}
                  style={[
                    styles.selectorButton,
                    selectedMethod === m.id && styles.selectorButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectorText,
                      selectedMethod === m.id && { color: "#064e3b" },
                    ]}
                  >
                    {m.icon} {m.name.replace("Cartão ", "")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setInputAmount("")}
              >
                <Text style={styles.cancelButtonText}>Limpar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.proceedButton}
                onPress={confirmPartialPayment}
              >
                <Text style={styles.proceedButtonText}>Adicionar Parcial</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* LISTA DE PAGAMENTOS */}
          <View style={styles.methodsContainer}>
            <Text style={styles.sectionTitle}>Pagamentos Registrados</Text>

            {payments.length === 0 ? (
              <Text style={{ color: "#888" }}>Nenhum pagamento registrado</Text>
            ) : (
              payments.map((p) => (
                <View
                  key={p.id}
                  style={[
                    styles.methodCard,
                    { justifyContent: "space-between" },
                  ]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ marginRight: 12 }}>
                      {paymentMethods.find((m) => m.id === p.method)?.icon}
                    </Text>
                    <View>
                      <Text style={styles.methodName}>
                        {paymentMethods.find((m) => m.id === p.method)?.name}
                      </Text>
                      <Text style={styles.methodDescription}>
                        R$ {p.amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => removePayment(p.id)}
                    >
                      <Text style={styles.cancelButtonText}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleBackToSales}
          >
            <Text style={styles.cancelButtonText}>VOLTAR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.proceedButton,
              remainingAmount > 0 && styles.proceedButtonDisabled,
            ]}
            onPress={finalizeCombinedPayment}
            disabled={remainingAmount > 0}
          >
            <Text style={styles.proceedButtonText}>
              {remainingAmount > 0 ? "FINALIZAR (Restante)" : "FINALIZAR VENDA"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // STEP 3: Success
  return (
    <View style={styles.successContainer}>
      {/* SUCCESS ANIMATION BACKGROUND */}
      <View style={styles.successBackground}>
        <View style={styles.successCircle}>
          <Text style={styles.successCheckmark}>✓</Text>
        </View>
      </View>

      <View style={styles.successContent}>
        <Text style={styles.successTitle}>Pagamento Aprovado!</Text>
        <Text style={styles.successSubtitle}>
          Transação realizada com sucesso
        </Text>

        {/* RECEIPT */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptTitle}>RECIBO</Text>
          </View>

          <View style={styles.receiptBody}>
            {/* ITENS COMPRADOS */}
            {cartItems.length > 0 && (
              <>
                <Text style={styles.summaryLabel}>Itens:</Text>
                {cartItems.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 4,
                      marginBottom: 4,
                    }}
                  >
                    <Text style={styles.receiptLabel}>
                      {item.name} x{item.quantity}
                    </Text>
                    <Text style={styles.receiptValue}>
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
                <View style={styles.divider} />
              </>
            )}

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Valor Total:</Text>
              <Text style={styles.receiptValue}>
                R$ {parseFloat(total).toFixed(2)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={{ paddingVertical: 8 }}>
              <Text style={styles.summaryLabel}>Pagamentos:</Text>
              {payments.map((p) => (
                <View
                  key={p.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 4,
                  }}
                >
                  <Text style={styles.receiptLabel}>
                    {paymentMethods.find((m) => m.id === p.method)?.name}
                  </Text>
                  <Text style={styles.receiptValue}>
                    R$ {p.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {change > 0 && (
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Troco:</Text>
                <Text style={[styles.receiptValue, { color: "#22c55e" }]}>
                  R$ {change.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Data/Hora:</Text>
              <Text style={styles.receiptValue}>
                {new Date().toLocaleString("pt-BR")}
              </Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Caixa:</Text>
              <Text style={styles.receiptValue}>01</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Operador:</Text>
              <Text style={styles.receiptValue}>João</Text>
            </View>
          </View>

          <View style={styles.receiptFooter}>
            <Text style={styles.receiptReference}>
              REF:{" "}
              {transactionId ||
                Math.random().toString(36).substring(7).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.successButtons}>
          <TouchableOpacity style={styles.printButton}>
            <Text style={styles.printButtonText}>🖨️ IMPRIMIR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newSaleButton}
            onPress={handleNewSale}
          >
            <Text style={styles.newSaleButtonText}>NOVA VENDA</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f2937",
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  header: {
    backgroundColor: "#111827",
    paddingVertical: 16,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    color: "#9ca3af",
    fontSize: 24,
    paddingHorizontal: 8,
  },

  // TOTAL CARD
  totalCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
  },
  totalCardLabel: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 8,
  },
  totalCardValue: {
    color: "#22c55e",
    fontSize: 42,
    fontWeight: "bold",
  },

  // PAYMENT METHODS
  methodsContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  methodCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4b5563",
  },
  methodCardActive: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderWidth: 2,
  },
  methodContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  methodIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  methodName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  methodDescription: {
    color: "#9ca3af",
    fontSize: 12,
  },
  radioButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  // INFO BOX
  infoBox: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  infoText: {
    color: "#93c5fd",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  // FOOTER
  footer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#111827",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#4b5563",
  },
  cancelButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
  },
  proceedButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#22c55e",
  },
  proceedButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
  },
  proceedButtonDisabled: {
    opacity: 0.6,
  },

  // SUMMARY CARD
  summaryCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  summaryLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },
  summaryValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#4b5563",
  },

  modalInput: {
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#4b5563",
  },

  // CONFIRMATION BOX
  confirmationBox: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  confirmationIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  confirmationTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  confirmationText: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
  },

  // QRCODE BOX
  qrcodeBox: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 25,
  },
  qrcodeTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  qrcodeContainer: {
    width: 200,
    height: 200,
    backgroundColor: "#4b5563",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#10b981",
  },
  qrcodePlaceholder: {
    fontSize: 48,
    color: "#9ca3af",
  },
  qrcodeInstruction: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
  },

  // SUCCESS SCREEN
  successContainer: {
    flex: 1,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  successBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  successCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#22c55e",
    opacity: 0.5,
  },
  successCheckmark: {
    fontSize: 80,
    color: "#22c55e",
  },
  successContent: {
    alignItems: "center",
    zIndex: 1,
  },
  successTitle: {
    color: "#22c55e",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 30,
    textAlign: "center",
  },

  // RECEIPT CARD
  receiptCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#4b5563",
    width: Math.min(width - 40, 400),
  },
  receiptHeader: {
    backgroundColor: "#111827",
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#22c55e",
  },
  receiptTitle: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  receiptBody: {
    padding: 16,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  receiptLabel: {
    color: "#9ca3af",
    fontSize: 12,
  },
  receiptValue: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  receiptFooter: {
    padding: 12,
    backgroundColor: "#111827",
    borderTopWidth: 1,
    borderTopColor: "#4b5563",
  },
  receiptReference: {
    color: "#9ca3af",
    fontSize: 11,
    textAlign: "center",
    fontFamily: "monospace",
  },

  selectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginVertical: 12,
    gap: 8,
  },
  selectorButton: {
    flex: 1,
    backgroundColor: "#374151",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4b5563",
    justifyContent: "center",
    alignItems: "center",
  },
  selectorButtonActive: {
    backgroundColor: "#22c55e",
    borderColor: "#16a34a",
  },
  selectorText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },

  // SUCCESS BUTTONS
  successButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  printButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#4b5563",
    justifyContent: "center",
    alignItems: "center",
  },
  printButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  newSaleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
  },
  newSaleButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
