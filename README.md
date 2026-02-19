# Corelix POS

Aplicativo de **ponto de venda (PDV)** multiplataforma desenvolvido com **Expo** e **React Native**, parte do ecossistema Corelix.

## Sobre o projeto

O Corelix POS permite operar vendas em dispositivos móveis, tablets e web, com interface em tema escuro, atalhos de teclado e fluxo de pagamento com múltiplas formas de pagamento e pagamento parcial.

### Funcionalidades principais

- **PDV (Home)**  
  - Inclusão de itens por código de barras ou busca (nome/código).  
  - Carrinho com alteração de quantidade e remoção de itens.  
  - Autorização de supervisor para remover item ou diminuir quantidade.  
  - Atalhos de teclado: **F2** (foco no código), **F3** (busca), **F5** (finalizar), setas (navegar), **+**/**-** (quantidade), **Delete** (remover).

- **Pagamento**  
  - Múltiplas formas: cartão crédito, cartão débito, PIX e dinheiro.  
  - Pagamento parcial (vários pagamentos por venda).  
  - Cálculo de troco para pagamento em dinheiro.  
  - Tela de sucesso com resumo e opções de imprimir e nova venda.

- **Caixa (Fechamento financeiro)**  
  - Fluxo do diagrama: Fechamento caixa → Conferência valores → Diferença? → Ajuste e justificativa → Confirmar fechamento → Relatório diário.  
  - CRUD completo (criar, listar, visualizar, editar, excluir) com dados mockados na API.  
  - Aba **Caixa** na navegação; listagem, detalhe, formulários de novo e edição.

- **Estoque (controle de estoque)**  
  - **Autenticação:** login Admin (admin / admin123) e GU – Gerente de Unidade (gu / gu123). No header do dashboard (aba Estoque) aparece o usuário autenticado e botão Sair.  
  - **Produtos:** CRUD com Id, Nome, Descrição, Valor, Valor Final (valor − desconto %), Fornecedor, Código de barras, Valor de compra (não editável), Desconto (%), Quantidade em estoque, Quantidade em pedidos. Quantidade em pedidos nunca maior que estoque. Alerta na listagem quando estoque &lt; 50.  
  - **Fornecedores:** CRUD com Id, CNPJ, Razão Social, Endereço, Telefone.  
  - **Pedidos:** criar pedido com itens (produto, quantidade), forma de pagamento (PIX, Crédito, Débito, VR, VA). O pedido consome estoque (reduz quantidade em estoque e aumenta quantidade em pedidos), gera código (ex.: PED-1000) e permite gerar PDF/impressão do resumo (versão web).  
  - Dashboard na aba **Estoque** com resumo de produtos (e alerta &lt; 50), fornecedores e acesso a pedidos.

- **Navegação**  
  - Abas: **Home** (PDV), **Explore**, **Caixa** e **Estoque**.  
  - Rota `/payment` para o fluxo de pagamento. Login em `/login` (obrigatório para usar o app).

## Tecnologias

- **Expo** ~54  
- **React** 19 e **React Native** 0.81  
- **Expo Router** ~6 (roteamento baseado em arquivos)  
- **TypeScript**  
- **React Native Reanimated**, **Gesture Handler**, **Safe Area Context**  
- **Expo** (Splash, StatusBar, Linking, Image, Haptics, etc.)

## Estrutura do projeto

```
corelix-pos-app/
├── app/                    # Rotas (Expo Router)
│   ├── _layout.tsx         # Layout raiz
│   ├── (tabs)/             # Abas (Home, Explore)
│   │   ├── _layout.tsx     # Layout das abas
│   │   ├── index.tsx       # PDV
│   │   ├── explore.tsx     # Explore
│   │   └── caixa/          # Fechamento de caixa (CRUD)
│   │       ├── _layout.tsx
│   │       ├── index.tsx   # Listagem
│   │       ├── novo.tsx    # Criar
│   │       └── [id]/       # Detalhe e editar
│   ├── payment/
│   │   └── index.tsx       # Tela de pagamento
│   └── modal.tsx
├── server/                  # API mock (Express)
│   ├── index.js             # Entrada, CORS
│   ├── routes/caixa.js       # CRUD Fechamento de Caixa
│   ├── routes/fornecedores.js # CRUD Fornecedores
│   ├── routes/produtos.js    # CRUD Produtos (valor final = valor − desconto %)
│   ├── routes/pedidos.js     # Criar pedido (consome estoque, gera código)
│   ├── routes/auth.js       # Login Admin / GU
│   └── store.js              # Store compartilhado produtos (pedidos alteram estoque)
├── contexts/                  # AuthContext (user, login, logout)
├── services/                  # API: caixa, auth, fornecedores, produtos, pedidos
├── utils/                     # pedidoPdf (HTML/impressão resumo pedido)
├── components/             # Componentes reutilizáveis
├── constants/               # Tema, cores, fontes, API
├── hooks/                   # Hooks (ex.: useColorScheme)
├── assets/                  # Ícones, imagens, splash
├── app.json                # Configuração Expo
├── package.json
└── tsconfig.json
```

## Pré-requisitos

- **Node.js** (versão LTS recomendada)  
- **npm** ou **yarn**  
- Para rodar em dispositivo: **Expo Go** (app) ou ambiente de build (EAS)

## Como rodar

1. **Instalar dependências**

   ```bash
   npm install
   ```

2. **Iniciar a API (Fechamento de Caixa)**

   Em um terminal:

   ```bash
   npm run server
   ```

   A API sobe em `http://localhost:3001` (GET/POST/PUT/DELETE em `/api/caixa`).

3. **Iniciar o projeto**

   Em outro terminal:

   ```bash
   npx expo start
   ```

4. **Abrir o app**

   - **Web:** no terminal, pressione `w` ou acesse a URL exibida.  
   - **Android:** pressione `a` ou escaneie o QR code com o Expo Go.  
   - **iOS:** pressione `i` no simulador ou escaneie o QR code com a câmera (Expo Go).

### Scripts úteis

- `npm start` ou `npx expo start` — inicia o servidor de desenvolvimento.  
- `npm run web` — inicia no modo web.  
- `npm run android` — inicia no Android.  
- `npm run ios` — inicia no iOS.  
- `npm run lint` — executa o ESLint.  
- `npm run server` — inicia a API mock em `http://localhost:3001` (CRUD Caixa).

## Configuração

- **App:** nome, slug, versão e ícones em `app.json`.  
- **Tema:** cores e estilos em `constants/theme.ts` (ou equivalente em `constants/`).  
- **Produtos (mock):** definidos na tela do PDV em `app/(tabs)/index.tsx`; em produção podem vir de API ou banco.  
- **API Caixa:** base URL em `constants/api.ts` (web: `localhost:3001`). Para dispositivo físico, altere para o IP da máquina.

## Observação sobre a pasta `.expo`

A pasta **`.expo`** é criada ao rodar `expo start` e guarda dados locais (dispositivos, configuração do servidor). Não é necessário versionar essa pasta; ela já deve estar no `.gitignore`.

---

**Versão:** 1.0.0 (conforme `app.json`)
