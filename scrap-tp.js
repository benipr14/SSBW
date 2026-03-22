import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = "https://tiendaprado.com";
const LIST_URL = `${BASE_URL}/es/385-impresiones?resultsPerPage=999`;
const OUTPUT_JSON = path.resolve("productos.json");
const IMAGES_DIR = path.resolve("imagenes");
const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.3";

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nombreArchivoDesde = (titulo) => titulo.replace(/[^a-z0-9]/gi, "_").toLowerCase();

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`No se pudo descargar ${url}: ${res.status}`);
    return;
  }
  const arrayBuffer = await res.arrayBuffer();
  await fs.writeFile(destPath, Buffer.from(arrayBuffer));
}

async function scrape() {
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: USER_AGENT });
  const page = await context.newPage();

  const productos = [];

  try {
    console.log("Abriendo listado...");
    await page.goto(LIST_URL, { timeout: 15000, waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    const linkLocator = page.locator(".product-miniature .product-title a");
    const anchors = await linkLocator.all();
    const urls = new Set();
    for (const a of anchors) {
      const href = await a.getAttribute("href");
      if (href) {
        urls.add(new URL(href, BASE_URL).href);
      }
    }

    console.log(`Encontradas ${urls.size} páginas de producto`);

    let index = 0;
    for (const url of urls) {
      index += 1;
      console.log(`[${index}/${urls.size}] Leyendo ${url}`);
      await page.goto(url, { timeout: 15000, waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1200);

      const titulo = (await page.locator("h1[itemprop='name'], h1.product-title, h1"
        ).first().textContent().catch(() => "")).trim();

      const descripcion = (await page
        .locator("#product-description-short, .product-description-short, .rte-content.product-description")
        .first()
        .innerText({ timeout: 5000 })
        .catch(() => ""))
        .trim();

      const textoPrecio = (await page
        .locator(".current-price-value, .current-price .price, .product-price")
        .first()
        .innerText({ timeout: 3000 })
        .catch(() => ""))
        .trim();

      const imageLoc = page.locator(".product-cover img, .js-modal-product-cover img, .product-image img").first();
      const rawImageUrl = (await imageLoc.getAttribute("data-full-size-image-url"))
        ?? (await imageLoc.getAttribute("src"))
        ?? "";
      const absoluteImageUrl = rawImageUrl ? new URL(rawImageUrl, BASE_URL).href : "";

      const ext = absoluteImageUrl ? path.extname(new URL(absoluteImageUrl).pathname) || ".jpg" : ".jpg";
      const imageFile = `${nombreArchivoDesde(titulo) || "imagen"}${ext}`;

      if (absoluteImageUrl) {
        await downloadImage(absoluteImageUrl, path.join(IMAGES_DIR, imageFile));
      }

      productos.push({
        titulo,
        descripcion,
        texto_precio: textoPrecio,
        imagen: imageFile
      });

      await esperar(400 + Math.random() * 500);
    }

    await fs.writeFile(OUTPUT_JSON, JSON.stringify(productos, null, 2), "utf8");
    console.log(`Guardados ${productos.length} productos en ${OUTPUT_JSON}`);
  } finally {
    await browser.close();
  }
}

scrape().catch((err) => {
  console.error(err);
  process.exit(1);
});
