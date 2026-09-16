import express from "express";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();
const port = Number(process.env.PORT) || 3000;
const tokenSecret = process.env.TOKEN_SECRET;

app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Biblioteca de Livros",
      version: "1.0.0",
      description: "API REST para gerenciamento de livros."
    },
    servers: [{ url: `http://localhost:${port}`, description: "Servidor local" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Informe o token no formato: Bearer TOKEN_SECRET"
        }
      }
    }
  },
  apis: ["./server.js"]
};
const swaggerSpecs = swaggerJsdoc(swaggerOptions);

let proximoId = 16;
let livros = [
  { id: 1, titulo: "Dom Casmurro", descricao: "Romance sobre memória, ciúme e dúvida", autor: "Machado de Assis", ano: 1899, genero: "Romance", editora: "Garnier", disponivel: true },
  { id: 2, titulo: "Memórias Póstumas de Brás Cubas", descricao: "Narrativa de um defunto autor", autor: "Machado de Assis", ano: 1881, genero: "Romance", editora: "Tipografia Nacional", disponivel: true },
  { id: 3, titulo: "O Cortiço", descricao: "Retrato da vida coletiva em uma habitação popular", autor: "Aluísio Azevedo", ano: 1890, genero: "Naturalismo", editora: "B. L. Garnier", disponivel: true },
  { id: 4, titulo: "Iracema", descricao: "Lenda de amor ambientada no Ceará", autor: "José de Alencar", ano: 1865, genero: "Romance", editora: "Typographia de Viana & Filhos", disponivel: true },
  { id: 5, titulo: "Vidas Secas", descricao: "A trajetória de uma família sertaneja", autor: "Graciliano Ramos", ano: 1938, genero: "Romance", editora: "José Olympio", disponivel: true },
  { id: 6, titulo: "Capitães da Areia", descricao: "A vida de meninos abandonados em Salvador", autor: "Jorge Amado", ano: 1937, genero: "Romance", editora: "José Olympio", disponivel: true },
  { id: 7, titulo: "A Hora da Estrela", descricao: "A história de Macabéa e sua invisibilidade social", autor: "Clarice Lispector", ano: 1977, genero: "Romance", editora: "Rocco", disponivel: true },
  { id: 8, titulo: "Grande Sertão: Veredas", descricao: "Travessia e conflitos no sertão brasileiro", autor: "João Guimarães Rosa", ano: 1956, genero: "Romance", editora: "José Olympio", disponivel: true },
  { id: 9, titulo: "O Auto da Compadecida", descricao: "Comédia popular sobre João Grilo e Chicó", autor: "Ariano Suassuna", ano: 1955, genero: "Teatro", editora: "Agir", disponivel: true },
  { id: 10, titulo: "Quarto de Despejo", descricao: "Diário da vida na favela do Canindé", autor: "Carolina Maria de Jesus", ano: 1960, genero: "Diário", editora: "Francisco Alves", disponivel: true },
  { id: 11, titulo: "O Alienista", descricao: "Sátira sobre ciência, poder e normalidade", autor: "Machado de Assis", ano: 1882, genero: "Novela", editora: "Lombaerts", disponivel: true },
  { id: 12, titulo: "Senhora", descricao: "Romance urbano sobre amor e casamento", autor: "José de Alencar", ano: 1875, genero: "Romance", editora: "B. L. Garnier", disponivel: true },
  { id: 13, titulo: "Mar Morto", descricao: "A vida dos marinheiros e pescadores da Bahia", autor: "Jorge Amado", ano: 1936, genero: "Romance", editora: "José Olympio", disponivel: false },
  { id: 14, titulo: "Sagarana", descricao: "Contos ambientados no sertão de Minas Gerais", autor: "João Guimarães Rosa", ano: 1946, genero: "Contos", editora: "Universal", disponivel: true },
  { id: 15, titulo: "A Bolsa Amarela", descricao: "As descobertas e desejos de uma menina", autor: "Lygia Bojunga", ano: 1976, genero: "Infantojuvenil", editora: "Casa Lygia Bojunga", disponivel: true }
];

function autenticar(req, res, next) {
  const authorization = req.headers.authorization?.trim();
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  if (!tokenSecret || token !== tokenSecret) {
    return res.status(401).json({ erro: "Acesso não autorizado. Token inválido ou ausente." });
  }

  next();
}

function encontrarLivro(idInformado) {
  const id = Number(idInformado);
  return Number.isInteger(id) && id > 0 ? livros.find((livro) => livro.id === id) : undefined;
}

function validarLivro(dados, parcial = false) {
  const camposTexto = ["titulo", "descricao", "autor", "genero", "editora"];
  const camposObrigatorios = ["titulo", "descricao", "autor", "ano", "genero", "editora", "disponivel"];

  if (!parcial) {
    for (const campo of camposObrigatorios) {
      if (dados[campo] === undefined) return `O campo ${campo} é obrigatório.`;
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

  if (dados.disponivel !== undefined && typeof dados.disponivel !== "boolean") {
    return "O campo disponivel deve ser true ou false.";
  }

  return null;
}

function criarLivro(dados) {
  return {
    id: proximoId++,
    titulo: dados.titulo.trim(),
    descricao: dados.descricao.trim(),
    autor: dados.autor.trim(),
    ano: Number(dados.ano),
    genero: dados.genero.trim(),
    editora: dados.editora.trim(),
    disponivel: dados.disponivel
  };
}

app.get("/", (req, res) => {
  res.json({ mensagem: "API Biblioteca de Livros funcionando!", versao: "AV1" });
});

/**
 * @swagger
 * /livros:
 *   get:
 *     summary: Lista todos os livros
 *     responses:
 *       200:
 *         description: Lista de livros
 */
app.get("/livros", (req, res) => {
  res.json(livros);
});

/**
 * @swagger
 * /livros/{id}:
 *   get:
 *     summary: Busca um livro pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Livro encontrado
 *       404:
 *         description: Livro não encontrado
 */
app.get("/livros/:id", (req, res) => {
  const livro = encontrarLivro(req.params.id);
  if (!livro) return res.status(404).json({ erro: "Livro não encontrado." });
  res.json(livro);
});

/**
 * @swagger
 * /livros:
 *   post:
 *     summary: Cadastra um livro
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, descricao, autor, ano, genero, editora, disponivel]
 *     responses:
 *       201:
 *         description: Livro cadastrado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
app.post("/livros", autenticar, (req, res) => {
  const erro = validarLivro(req.body);
  if (erro) return res.status(400).json({ erro });

  const novoLivro = criarLivro(req.body);
  livros.push(novoLivro);
  res.status(201).json({ mensagem: "Livro cadastrado com sucesso.", livro: novoLivro });
});

/**
 * @swagger
 * /livros/{id}:
 *   patch:
 *     summary: Atualiza parte de um livro
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Livro atualizado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
app.patch("/livros/:id", autenticar, (req, res) => {
  const livro = encontrarLivro(req.params.id);
  if (!livro) return res.status(404).json({ erro: "Livro não encontrado." });

  const campos = ["titulo", "descricao", "autor", "ano", "genero", "editora", "disponivel"];
  const dadosAtualizados = Object.fromEntries(Object.entries(req.body).filter(([campo]) => campos.includes(campo)));
  const camposInvalidos = Object.keys(req.body).filter((campo) => !campos.includes(campo));
  if (camposInvalidos.length) return res.status(400).json({ erro: "Campos inválidos.", campos: camposInvalidos });
  if (!Object.keys(dadosAtualizados).length) return res.status(400).json({ erro: "Informe ao menos um campo para atualizar." });

  const erro = validarLivro(dadosAtualizados, true);
  if (erro) return res.status(400).json({ erro });

  for (const campo of Object.keys(dadosAtualizados)) {
    livro[campo] = typeof dadosAtualizados[campo] === "string" ? dadosAtualizados[campo].trim() : dadosAtualizados[campo];
  }
  if (dadosAtualizados.ano !== undefined) livro.ano = Number(dadosAtualizados.ano);

  res.json({ mensagem: "Livro atualizado com sucesso.", livro });
});

/**
 * @swagger
 * /livros/{id}:
 *   delete:
 *     summary: Exclui um livro
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Livro excluído
 *       401:
 *         description: Não autorizado
 */
app.delete("/livros/:id", autenticar, (req, res) => {
  const indice = livros.findIndex((livro) => livro.id === Number(req.params.id));
  if (indice === -1) return res.status(404).json({ erro: "Livro não encontrado." });

  const [livro] = livros.splice(indice, 1);
  res.json({ mensagem: "Livro excluído com sucesso.", livro });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

app.use((erro, req, res, next) => {
  if (erro instanceof SyntaxError && erro.status === 400 && "body" in erro) {
    return res.status(400).json({ erro: "JSON inválido." });
  }
  res.status(500).json({ erro: "Erro interno do servidor." });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
