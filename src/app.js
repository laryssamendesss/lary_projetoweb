import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import livrosRoutes from "./routes/livrosRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Biblioteca de Livros",
      version: "1.0.0",
      description: "API REST para gerenciamento de livros."
    },
    servers: [{ url: process.env.API_URL || `http://localhost:${process.env.PORT || 3000}` }],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } },
      schemas: {
        LivroInput: {
          type: "object",
          required: ["titulo", "autor", "ano", "genero"],
          properties: {
            titulo: { type: "string", example: "Dom Casmurro" },
            autor: { type: "string", example: "Machado de Assis" },
            ano: { type: "integer", example: 1899 },
            genero: { type: "string", example: "Romance" }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.js"]
};
const swaggerDocument = swaggerJSDoc(swaggerOptions);

app.get("/", (req, res) => res.json({ mensagem: "API Biblioteca de Livros funcionando." }));
app.use("/livros", livrosRoutes);
app.use("/upload", uploadRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((erro, req, res, next) => {
  if (erro?.code === "LIMIT_FILE_SIZE") return res.status(400).json({ erro: "Arquivo maior que o limite permitido de 5 MB." });
  if (erro?.message === "TIPO_INVALIDO") return res.status(400).json({ erro: "Tipo de arquivo inválido. Envie JPEG, PNG ou WEBP." });
  if (erro instanceof SyntaxError && erro.status === 400) return res.status(400).json({ erro: "JSON inválido." });
  next(erro);
});
app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada." }));
app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(500).json({ erro: "Erro interno do servidor." });
});

export default app;
