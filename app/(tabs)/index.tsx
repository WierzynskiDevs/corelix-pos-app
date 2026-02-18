import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function PDV() {
  const router = useRouter();
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<Product[]>([]);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authAction, setAuthAction] = useState<"remove" | "decrease" | null>(
    null,
  );
  const [itemToAuth, setItemToAuth] = useState<string | null>(null);
  const [supervisorCode, setSupervisorCode] = useState("");
  const [supervisorPassword, setSupervisorPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Estados para busca de produto
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  // Estados para navegação por teclado
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
    null,
  );
  const barcodeInputRef = useRef<any>(null);

  const mockProducts: any = {
    "123": { name: "Arroz 5kg", price: 25.9 },
    "456": { name: "Feijão 1kg", price: 8.5 },
    "789": { name: "Refrigerante 2L", price: 9.99 },
    "111": { name: "Macarrão", price: 6.75 },
    "222": { name: "Leite Integral", price: 4.99 },
  };

  // Listener de teclado global
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F2: Focar no input de código
      if (event.key === "F2") {
        event.preventDefault();
        barcodeInputRef.current?.focus();
        return;
      }

      // F3: Abrir busca
      if (event.key === "F3") {
        event.preventDefault();
        openSearchModal();
        return;
      }

      // F5: Finalizar venda
      if (event.key === "F5") {
        event.preventDefault();
        handleCheckout();
        return;
      }

      // Se o modal está aberto, não processar navegação
      if (searchModalVisible || authModalVisible) return;

      // Setas para navegação entre itens
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedItemIndex((prev) =>
          prev === null ? 0 : Math.min(prev + 1, cart.length - 1),
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedItemIndex((prev) =>
          prev === null ? cart.length - 1 : Math.max(prev - 1, 0),
        );
        return;
      }

      // + para aumentar quantidade
      if (
        event.key === "+" ||
        event.key === "=" ||
        event.key === "ArrowRight"
      ) {
        event.preventDefault();
        if (selectedItemIndex !== null && cart[selectedItemIndex]) {
          updateQuantity(cart[selectedItemIndex].id, 1);
        }
        return;
      }

      // - para diminuir quantidade
      if (event.key === "-" || event.key === "ArrowLeft") {
        event.preventDefault();
        if (selectedItemIndex !== null && cart[selectedItemIndex]) {
          updateQuantity(cart[selectedItemIndex].id, -1);
        }
        return;
      }

      // Delete para remover item
      if (event.key === "Delete") {
        event.preventDefault();
        if (selectedItemIndex !== null && cart[selectedItemIndex]) {
          removeItem(cart[selectedItemIndex].id);
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, selectedItemIndex, searchModalVisible, authModalVisible]);

  // Filtrar produtos na busca
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = Object.entries(mockProducts)
      .filter(
        ([code, product]: any) =>
          code.includes(query) || product.name.toLowerCase().includes(query),
      )
      .map(([code, product]: any) => ({
        id: code,
        ...product,
      }));

    setFilteredProducts(results);
  }, [searchQuery]);

  // Função para validar supervisor
  const validateSupervisor = (): boolean => {
    const VALID_SUPERVISOR = "admin";
    const VALID_PASSWORD = "1234";

    if (
      supervisorCode.trim() !== VALID_SUPERVISOR ||
      supervisorPassword !== VALID_PASSWORD
    ) {
      setAuthError("Usuário ou senha incorretos");
      return false;
    }

    return true;
  };

  // Função para processar autorização
  const handleAuthorization = () => {
    if (!validateSupervisor()) {
      return;
    }

    // Validação passou, executa a ação
    if (itemToAuth) {
      if (authAction === "remove") {
        setCart(cart.filter((p) => p.id !== itemToAuth));
      } else if (authAction === "decrease") {
        setCart(
          cart.map((item) =>
            item.id === itemToAuth
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item,
          ),
        );
      }
    }

    // Limpa modal e campos
    setAuthModalVisible(false);
    setItemToAuth(null);
    setAuthAction(null);
    setSupervisorCode("");
    setSupervisorPassword("");
    setAuthError("");
  };

  // Função para abrir modal de autorização
  const openAuthModal = (id: string, action: "remove" | "decrease") => {
    setItemToAuth(id);
    setAuthAction(action);
    setSupervisorCode("");
    setSupervisorPassword("");
    setAuthError("");
    setAuthModalVisible(true);
  };

  // Função para cancelar ação
  const cancelAuth = () => {
    setAuthModalVisible(false);
    setItemToAuth(null);
    setAuthAction(null);
    setSupervisorCode("");
    setSupervisorPassword("");
    setAuthError("");
  };

  const addProduct = () => {
    const product = mockProducts[barcode];
    if (!product) return;

    const existing = cart.find((p) => p.id === barcode);

    if (existing) {
      setCart(
        cart.map((p) =>
          p.id === barcode ? { ...p, quantity: p.quantity + 1 } : p,
        ),
      );
    } else {
      setCart([
        ...cart,
        { id: barcode, name: product.name, price: product.price, quantity: 1 },
      ]);
    }

    setBarcode("");
  };

  const updateQuantity = (id: string, delta: number) => {
    // Se diminuindo, requer autorização
    if (delta < 0) {
      openAuthModal(id, "decrease");
      return;
    }

    // Se aumentando, faz direto
    setCart(
      cart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    openAuthModal(id, "remove");
  };

  // Funções para busca
  const openSearchModal = () => {
    setSearchModalVisible(true);
    setSearchQuery("");
    setFilteredProducts([]);
  };

  const closeSearchModal = () => {
    setSearchModalVisible(false);
    setSearchQuery("");
    setFilteredProducts([]);
  };

  const addProductFromSearch = (productId: string) => {
    const product = mockProducts[productId];
    if (!product) return;

    const existing = cart.find((p) => p.id === productId);

    if (existing) {
      setCart(
        cart.map((p) =>
          p.id === productId ? { ...p, quantity: p.quantity + 1 } : p,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          id: productId,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }

    closeSearchModal();
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    router.push({
      pathname: "/payment",
      params: {
        total: total.toFixed(2),
        cart: JSON.stringify(cart),
      },
    } as any);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>CORELIX POS</Text>
        <Text style={styles.operator}>Caixa 01 • Operador João</Text>
      </View>

      <View style={styles.body}>
        {/* LISTA */}
        <View style={styles.cartArea}>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={{ color: "#888" }}>Nenhum item adicionado</Text>
            }
            renderItem={({ item, index }) => {
              const isSelected = selectedItemIndex === index;
              return (
                <View
                  style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                >
                  {isSelected && (
                    <Text style={styles.selectedIndicator}>→</Text>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      R$ {item.price.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.quantityBox}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, -1)}
                    >
                      <Text style={styles.qtyButton}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.qtyText}>{item.quantity}</Text>

                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, 1)}
                    >
                      <Text style={styles.qtyButton}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.subtotal}>
                    R$ {(item.quantity * item.price).toFixed(2)}
                  </Text>

                  <TouchableOpacity onPress={() => removeItem(item.id)}>
                    <Text style={styles.remove}>X</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>

        {/* RESUMO */}
        <View style={styles.summaryArea}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>

          <TouchableOpacity
            style={[
              styles.payButton,
              cart.length === 0 && styles.payButtonDisabled,
            ]}
            onPress={handleCheckout}
            disabled={cart.length === 0}
          >
            <Text style={styles.payText}>FINALIZAR VENDA</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* INPUT */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <TextInput
            ref={barcodeInputRef}
            placeholder="Digite ou escaneie código (F2)"
            value={barcode}
            onChangeText={setBarcode}
            onSubmitEditing={addProduct}
            style={[styles.input, { flex: 1 }]}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={openSearchModal}
          >
            <Text style={styles.searchButtonText}>🔍 F3</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.helpText}>
          ↑↓ Navegar | +/- Qtd | Delete Remover | F5 Finalizar
        </Text>
      </View>

      {/* MODAL DE BUSCA */}
      <Modal
        visible={searchModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeSearchModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.searchModalContent}>
            <Text style={styles.modalTitle}>Buscar Produto</Text>

            <TextInput
              placeholder="Digite nome ou código..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#666"
              autoFocus
            />

            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              style={styles.searchList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchProductItem}
                  onPress={() => addProductFromSearch(item.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.searchProductName}>{item.name}</Text>
                    <Text style={styles.searchProductCode}>{item.id}</Text>
                  </View>
                  <Text style={styles.searchProductPrice}>
                    R$ {item.price.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.noResults}>
                  {searchQuery
                    ? "Nenhum produto encontrado"
                    : "Digite para buscar"}
                </Text>
              }
            />

            <TouchableOpacity
              style={styles.searchCloseButton}
              onPress={closeSearchModal}
            >
              <Text style={styles.searchCloseText}>Fechar (ESC)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL DE AUTORIZAÇÃO */}
      <Modal
        visible={authModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelAuth}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Autorização Requerida</Text>
            <Text style={styles.modalSubtitle}>
              {authAction === "remove"
                ? "Confirme sua identidade para remover o item"
                : "Confirme sua identidade para diminuir a quantidade"}
            </Text>

            {/* Campo Usuário */}
            <Text style={styles.inputLabel}>Usuário/Código:</Text>
            <TextInput
              placeholder="Digite o código do supervisor"
              value={supervisorCode}
              onChangeText={setSupervisorCode}
              style={styles.modalInput}
              placeholderTextColor="#666"
            />

            {/* Campo Senha */}
            <Text style={styles.inputLabel}>Senha:</Text>
            <TextInput
              placeholder="Digite a senha"
              value={supervisorPassword}
              onChangeText={setSupervisorPassword}
              secureTextEntry
              style={styles.modalInput}
              placeholderTextColor="#666"
            />

            {/* Mensagem de Erro */}
            {authError ? (
              <Text style={styles.errorMessage}>{authError}</Text>
            ) : null}

            {/* Botões */}
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={cancelAuth}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleAuthorization}
              >
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f2937",
  },
  header: {
    padding: 20,
    backgroundColor: "#111827",
  },
  logo: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  operator: {
    color: "#9ca3af",
    fontSize: 13,
  },
  body: {
    flex: 1,
    flexDirection: "row",
  },
  cartArea: {
    flex: 2,
    padding: 20,
  },
  summaryArea: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 20,
    justifyContent: "center",
  },
  totalLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },
  totalValue: {
    color: "#22c55e",
    fontSize: 40,
    fontWeight: "bold",
    marginVertical: 20,
  },
  payButton: {
    backgroundColor: "#22c55e",
    padding: 18,
    borderRadius: 10,
  },
  payText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    padding: 15,
    backgroundColor: "#111827",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemName: {
    color: "#fff",
    fontWeight: "bold",
  },
  itemPrice: {
    color: "#9ca3af",
    fontSize: 12,
  },
  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  qtyButton: {
    color: "#fff",
    fontSize: 18,
    paddingHorizontal: 8,
  },
  qtyText: {
    color: "#fff",
    fontSize: 16,
    marginHorizontal: 5,
  },
  subtotal: {
    color: "#fff",
    fontWeight: "bold",
    width: 80,
    textAlign: "right",
  },
  remove: {
    color: "#ef4444",
    marginLeft: 10,
    fontWeight: "bold",
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  itemRowSelected: {
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#16a34a",
  },
  selectedIndicator: {
    color: "#fff",
    fontSize: 18,
    marginRight: 10,
    fontWeight: "bold",
  },
  footerRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  searchButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  helpText: {
    color: "#666",
    fontSize: 11,
    textAlign: "center",
  },
  searchModalContent: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#374151",
  },
  searchInput: {
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#4b5563",
    marginBottom: 15,
  },
  searchList: {
    maxHeight: 300,
    marginBottom: 15,
  },
  searchProductItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  searchProductName: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 4,
  },
  searchProductCode: {
    color: "#9ca3af",
    fontSize: 12,
  },
  searchProductPrice: {
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: 16,
  },
  noResults: {
    color: "#888",
    textAlign: "center",
    paddingVertical: 20,
  },
  searchCloseButton: {
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
  },
  searchCloseText: {
    color: "#9ca3af",
    textAlign: "center",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#374151",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 20,
  },
  inputLabel: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 8,
    marginTop: 12,
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
  errorMessage: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
  },
  modalCancelText: {
    color: "#9ca3af",
    textAlign: "center",
    fontWeight: "bold",
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#22c55e",
    borderRadius: 8,
    padding: 12,
  },
  modalConfirmText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
