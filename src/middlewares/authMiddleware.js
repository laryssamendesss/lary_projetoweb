export function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization?.trim();
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  const tokenConfigurado = process.env.TOKENSECRETO ?? process.env.API_TOKEN;

  if (!token || token !== tokenConfigurado) {
    return res.status(401).json({ erro: "Não autorizado. Token inválido ou ausente." });
  }

  next();
}
