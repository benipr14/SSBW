import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import nunjucks from "nunjucks";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ProductosRouter from "./routes/productos.ts";
import UsuariosRouter from "./routes/usuarios.ts";
import ApiRouter from "./routes/api.ts";
import logger from "./logger.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT ?? 3000);

const app = express();
app.set("view engine", "njk");

nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true,
  express: app,
  watch: process.env.NODE_ENV !== "production",
  noCache: process.env.NODE_ENV !== "production"
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/public/imagenes", express.static(path.join(__dirname, "imagenes")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "my-secret",
  resave: false,
  saveUninitialized: false
}));
app.use(cookieParser());

// Middleware de autenticación JWT
app.use((req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;
  if (token) {
    try {
      const data = jwt.verify(token, process.env.SECRET_KEY || "ssbw_jwt_secret") as {
        usuario: string;
        email: string;
        admin?: boolean;
      };
      req.usuario = data.usuario;
      req.admin = data.admin ?? false;
      res.locals.usuario = data.usuario;
      res.locals.admin = data.admin ?? false;
      logger.info(`Autentificado ${data.usuario} admin:${data.admin ?? false}`);
    } catch (err: any) {
      logger.error(`JWT inválido: ${err?.message ?? err}`);
      req.usuario = undefined;
      req.admin = undefined;
      res.locals.usuario = undefined;
      res.locals.admin = undefined;
      res.clearCookie("access_token");
    }
  } else {
    res.locals.usuario = undefined;
    res.locals.admin = undefined;
  }
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const total = req.session.total_carrito ?? 0;
  res.locals.total_carrito = total;
  next();
});

app.use("/", UsuariosRouter);
app.use("/", ProductosRouter);
app.use("/api", ApiRouter);

app.use((req: Request, res: Response) => {
  res.status(404).render("404.njk", {
    pageTitle: "No encontrado",
    path: req.path
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message);
  res.status(500).render("500.njk", {
    pageTitle: "Error del servidor"
  });
});

app.listen(port, () => {
  logger.info(`Server ready on http://localhost:${port}`);
});
