const express = require("express");
const router = express.Router();

const USUARIOS = [
  { id: "1", login: "admin", senha: "admin123", nome: "Administrador", role: "admin" },
  { id: "2", login: "gu", senha: "gu123", nome: "Gerente Unidade", role: "gu" },
];

router.post("/login", (req, res) => {
  const { login, senha } = req.body || {};
  const user = USUARIOS.find((u) => u.login === login && u.senha === senha);
  if (!user) return res.status(401).json({ error: "Login ou senha inválidos" });
  res.json({
    id: user.id,
    login: user.login,
    nome: user.nome,
    role: user.role,
  });
});

module.exports = router;
