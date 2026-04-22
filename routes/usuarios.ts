import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma/prisma.client.ts";
import logger from "../logger.ts";

const router = express.Router();

router.get("/login", (_req: Request, res: Response) => {
  res.render("login.njk", { error: false, errorMessage: "", oldEmail: "", pageTitle: "Iniciar sesión" });
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, contraseña } = req.body as { email?: string; contraseña?: string };
  const emailNormalizado = (email ?? "").trim().toLowerCase();
  try {
    if (!emailNormalizado || !contraseña) {
      return res.status(400).render("login.njk", {
        error: true,
        errorMessage: "Rellena email y contraseña.",
        oldEmail: emailNormalizado,
        pageTitle: "Iniciar sesión"
      });
    }
    const usuario = await prisma.usuario.autentifica(emailNormalizado, contraseña);
    const token = jwt.sign({ usuario: usuario.nombre, email: usuario.email, admin: usuario.admin }, process.env.SECRET_KEY ?? "ssbw_jwt_secret", {
      expiresIn: "2h"
    });

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
      })
      .redirect("/");
  } catch (error: any) {
    logger.error(error?.message ?? error);
    let errorMessage = "Credenciales inválidas.";

    if (emailNormalizado) {
      const existeUsuario = await prisma.usuario.findUnique({
        where: { email: emailNormalizado },
        select: { email: true }
      });
      errorMessage = existeUsuario
        ? "La contraseña introducida no es válida para ese usuario."
        : "No existe una cuenta con ese email.";
    }

    res.status(401).render("login.njk", {
      error: true,
      errorMessage,
      oldEmail: emailNormalizado,
      pageTitle: "Iniciar sesión"
    });
  }
});

router.get("/logout", (_req: Request, res: Response) => {
  res.clearCookie("access_token").redirect("/");
});

export default router;
