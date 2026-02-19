const express = require("express");
const router = express.Router();

let fornecedores = [
  {
    id: "1",
    cnpj: "12.345.678/0001-90",
    razaoSocial: "Fornecedor Alpha Ltda",
    endereco: "Rua das Flores, 100 - Centro",
    telefone: "(11) 3333-4444",
  },
  {
    id: "2",
    cnpj: "98.765.432/0001-10",
    razaoSocial: "Distribuidora Beta S.A.",
    endereco: "Av. Brasil, 500 - Jardins",
    telefone: "(11) 5555-6666",
  },
];

function gerarId() {
  return String(Date.now());
}

router.get("/", (_, res) => res.json(fornecedores));

router.get("/:id", (req, res) => {
  const item = fornecedores.find((f) => f.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Fornecedor não encontrado" });
  res.json(item);
});

router.post("/", (req, res) => {
  const body = req.body;
  const novo = {
    id: body.id || gerarId(),
    cnpj: body.cnpj || "",
    razaoSocial: body.razaoSocial || "",
    endereco: body.endereco || "",
    telefone: body.telefone || "",
  };
  fornecedores.push(novo);
  res.status(201).json(novo);
});

router.put("/:id", (req, res) => {
  const idx = fornecedores.findIndex((f) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Fornecedor não encontrado" });
  const body = req.body;
  fornecedores[idx] = {
    ...fornecedores[idx],
    cnpj: body.cnpj !== undefined ? body.cnpj : fornecedores[idx].cnpj,
    razaoSocial: body.razaoSocial !== undefined ? body.razaoSocial : fornecedores[idx].razaoSocial,
    endereco: body.endereco !== undefined ? body.endereco : fornecedores[idx].endereco,
    telefone: body.telefone !== undefined ? body.telefone : fornecedores[idx].telefone,
  };
  res.json(fornecedores[idx]);
});

router.delete("/:id", (req, res) => {
  const idx = fornecedores.findIndex((f) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Fornecedor não encontrado" });
  fornecedores.splice(idx, 1);
  res.status(204).send();
});

module.exports = router;
