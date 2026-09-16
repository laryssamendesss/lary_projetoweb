import express from "express";
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
const tiposAceitos = ["image/jpeg", "image/png", "image/webp"];
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, callback) => callback(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!tiposAceitos.includes(file.mimetype)) return callback(new Error("TIPO_INVALIDO"));
    callback(null, true);
  }
});

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Envia uma imagem
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagem: { type: string, format: binary }
 *     responses:
 *       201: { description: Imagem enviada }
 *       400: { description: Arquivo ausente ou inválido }
 */
router.post("/", authMiddleware, (req, res, next) => {
  upload.single("imagem")(req, res, (erro) => {
    if (erro) return next(erro);
    if (!req.file) return res.status(400).json({ erro: "Arquivo não enviado. Use o campo imagem." });
    res.status(201).json({ mensagem: "Arquivo enviado com sucesso.", arquivo: req.file.filename });
  });
});

export default router;
