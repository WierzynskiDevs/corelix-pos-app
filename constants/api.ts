import { Platform } from "react-native";

// Em web usa localhost; em dispositivo use o IP da máquina (ex: 192.168.1.10)
export const API_BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:3001"
    : "http://localhost:3001";
