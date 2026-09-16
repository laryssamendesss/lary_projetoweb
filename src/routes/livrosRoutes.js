import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
let livros = [
  { id: 1, titulo: "Dom Casmurro", autor: "Machado de Assis", ano: 1899, genero: "Romance" },
  { id: 2, titulo: "Memórias Póstumas de Brás Cubas", autor: "Machado de Assis", ano: 1881, genero: "Romance" },
  { id: 3, titulo: "O Cortiço", autor: "Aluísio Azevedo", ano: 1890, genero: "Naturalismo" },
  { id: 4, titulo: "Iracema", autor: "José de Alencar", ano: 1865, genero: "Romance" },
  { id: 5, titulo: "Vidas Secas", autor: "Graciliano Ramos", ano: 1938, genero: "Romance" },
  { id: 6, titulo: "Capitães da Areia", autor: "Jorge Amado", ano: 1937, genero: "Romance" }
];
const camposTexto = ["titulo", "autor", "genero"];
const campos = [...camposTexto, "ano"];
const idValido = (valor) => /^\d+$/.test(valor) && Number(valor) > 0;

function validarLivro(dados, parcial = false) {
  const camposObrigatorios = parcial ? [] : campos;
  for (const campo of camposObrigatorios) {
    if (dados[campo] === undefined || dados[campo] === null || dados[campo] === "") {
      return `O campo ${campo} é obrigatório.`;
    }
  }

  for (const campo of camposTexto) {
    if (dados[campo] !== undefined && (typeof dados[campo] !== "string" || dados[campo].trim() === "")) {
      return `O campo ${campo} deve ser um texto não vazio.`;
    }
  }

  if (dados.ano !== undefined && (!Number.isInteger(Number(dados.ano)) || Number(dados.ano) <= 0)) {
    return "O campo ano deve ser um número inteiro positivo.";
  }

  return null;
}

/**
 * @swagger
 * /livros:
 *   post:
 *     summary: Cadastra um livro
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LivroInput' }
 *     responses:
 *       201: { description: Livro cadastrado }
 *       400: { description: Campos obrigatórios ausentes }
 *   get:
 *     summary: Lista todos os livros
 *     responses:
 *       200: { description: Lista de livros }
 */
router.route("/")
  .get((req, res) => res.json(livros))
  .post(authMiddleware, (req, res) => {
    const erro = validarLivro(req.body);
    if (erro) return res.status(400).json({ erro });
    const livro = {
      id: livros.length ? Math.max(...livros.map((item) => item.id)) + 1 : 1,
      titulo: req.body.titulo.trim(),
      autor: req.body.autor.trim(),
      ano: Number(req.body.ano),
      genero: req.body.genero.trim()
    };
    livros.push(livro);
    res.status(201).json({ mensagem: "Livro cadastrado com sucesso.", livro });
  });

/**
 * @swagger
 * /livros/{id}:
 *   get:
 *     summary: Busca um livro por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Livro encontrado }
 *       404: { description: Livro não encontrado }
 *   put:
 *     summary: Atualiza um livro
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LivroInput' }
 *     responses:
 *       200: { description: Livro atualizado }
 *       404: { description: Livro não encontrado }
 *   patch:
 *     summary: Altera parcialmente um livro
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LivroPatch' }
 *     responses:
 *       200: { description: Livro atualizado }
 *       404: { description: Livro não encontrado }
 *   delete:
 *     summary: Exclui um livro
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Livro excluído }
 *       404: { description: Livro não encontrado }
 */
router.route("/:id")
  .get((req, res) => {
    if (!idValido(req.params.id)) return res.status(400).json({ erro: "ID inválido." });
    const livro = livros.find((item) => item.id === Number(req.params.id));
    if (!livro) return res.status(404).json({ erro: "Livro não encontrado." });
    res.json(livro);
  })
  .put(authMiddleware, (req, res) => {
    if (!idValido(req.params.id)) return res.status(400).json({ erro: "ID inválido." });
    const livro = livros.find((item) => item.id === Number(req.params.id));
    if (!livro) return res.status(404).json({ erro: "Livro não encontrado." });
    const erro = validarLivro(req.body);
    if (erro) return res.status(400).json({ erro });
    Object.assign(livro, {
      titulo: req.body.titulo.trim(),
      autor: req.body.autor.trim(),
      ano: Number(req.body.ano),
      genero: req.body.genero.trim()
    });
    res.json({ mensagem: "Livro atualizado com sucesso.", livro });
  })
  .patch(authMiddleware, (req, res) => {
    if (!idValido(req.params.id)) return res.status(400).json({ erro: "ID inválido." });
    const livro = livros.find((item) => item.id === Number(req.params.id));
    if (!livro) return res.status(404).json({ erro: "Livro não encontrado." });
    const camposRecebidos = Object.keys(req.body);
    const camposInvalidos = camposRecebidos.filter((campo) => !campos.includes(campo));
    if (camposInvalidos.length) return res.status(400).json({ erro: "Campos inválidos.", campos: camposInvalidos });
    if (!camposRecebidos.length) return res.status(400).json({ erro: "Informe ao menos um campo para atualizar." });
    const erro = validarLivro(req.body, true);
    if (erro) return res.status(400).json({ erro });
    for (const campo of camposRecebidos) {
      livro[campo] = campo === "ano" ? Number(req.body[campo]) : req.body[campo].trim();
    }
    res.json({ mensagem: "Livro atualizado parcialmente com sucesso.", livro });
  })
  .delete(authMiddleware, (req, res) => {
    if (!idValido(req.params.id)) return res.status(400).json({ erro: "ID inválido." });
    const indice = livros.findIndex((item) => item.id === Number(req.params.id));
    if (indice === -1) return res.status(404).json({ erro: "Livro não encontrado." });
    const [livro] = livros.splice(indice, 1);
    res.json({ mensagem: "Livro excluído com sucesso.", livro });
  });

export default router;
