export function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  const tokenConfigurado = process.env.TOKENSECRETO ?? process.env.API_TOKEN;

  if (!token || token !== tokenConfigurado) {
    return res.status(401).json({ erro: "Não autorizado. Token inválido ou ausente." });
  }

  next();
}
