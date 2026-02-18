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

- **Navegação**  
  - Abas: **Home** (PDV) e **Explore** (tela auxiliar).  
  - Rota `/payment` para o fluxo de pagamento.

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
│   │   └── explore.tsx     # Explore
│   ├── payment/
│   │   └── index.tsx       # Tela de pagamento
│   └── modal.tsx
├── components/             # Componentes reutilizáveis
├── constants/               # Tema, cores, fontes
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

2. **Iniciar o projeto**

   ```bash
   npx expo start
   ```

3. **Abrir o app**

   - **Web:** no terminal, pressione `w` ou acesse a URL exibida.  
   - **Android:** pressione `a` ou escaneie o QR code com o Expo Go.  
   - **iOS:** pressione `i` no simulador ou escaneie o QR code com a câmera (Expo Go).

### Scripts úteis

- `npm start` ou `npx expo start` — inicia o servidor de desenvolvimento.  
- `npm run web` — inicia no modo web.  
- `npm run android` — inicia no Android.  
- `npm run ios` — inicia no iOS.  
- `npm run lint` — executa o ESLint.

## Configuração

- **App:** nome, slug, versão e ícones em `app.json`.  
- **Tema:** cores e estilos em `constants/theme.ts` (ou equivalente em `constants/`).  
- **Produtos (mock):** definidos na tela do PDV em `app/(tabs)/index.tsx`; em produção podem vir de API ou banco.

## Observação sobre a pasta `.expo`

A pasta **`.expo`** é criada ao rodar `expo start` e guarda dados locais (dispositivos, configuração do servidor). Não é necessário versionar essa pasta; ela já deve estar no `.gitignore`.

---

**Versão:** 1.0.0 (conforme `app.json`)
