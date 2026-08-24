import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit to handle data URLs / binary payloads
  app.use(express.json({ limit: "25mb" }));

  app.post("/api/assets/save", (req, res) => {
    const { action, assetId, name, category, file, content, tags, description } = req.body;

    if (!assetId || !name || !category || !file || content === undefined) {
      return res.status(400).json({ error: "Missing required asset fields." });
    }

    // Security check: validate category and assetId
    if (!/^[a-zA-Z0-9_.-]+$/.test(category) || !/^[a-zA-Z0-9_.-]+$/.test(assetId)) {
      return res.status(400).json({ error: "Invalid category or asset ID format." });
    }

    // Extract physical filename from path (e.g. "/assets/icons/attack.svg" -> "attack.svg")
    const filename = path.basename(file);
    if (!/^[a-zA-Z0-9_.-]+\.(svg|png|jpg|jpeg|webp)$/i.test(filename) || filename.includes("..")) {
      return res.status(400).json({ error: "Invalid filename or path traversal detected." });
    }

    const publicIconsDir = path.join(process.cwd(), "public/assets/icons");
    const physicalFilePath = path.join(publicIconsDir, filename);

    const catalogDir = path.join(process.cwd(), "src/assets/catalog/icons");
    const catalogJsonPath = path.join(catalogDir, `${category}.json`);

    try {
      if (!fs.existsSync(publicIconsDir)) {
        fs.mkdirSync(publicIconsDir, { recursive: true });
      }

      // 1. Write physical file bytes / markup
      let fileBuffer: Buffer | string;
      if (typeof content === "string" && content.startsWith("data:")) {
        const base64Parts = content.split(",");
        const isBase64 = base64Parts[0].includes("base64");
        if (isBase64) {
          fileBuffer = Buffer.from(base64Parts[1], "base64");
        } else {
          fileBuffer = decodeURIComponent(base64Parts[1]);
        }
      } else {
        fileBuffer = content;
      }

      fs.writeFileSync(physicalFilePath, fileBuffer, "utf8");

      // 2. Update catalog entry in src/assets/catalog/icons/<category>.json
      const catalogEntry = {
        id: assetId,
        name: name,
        file: `/assets/icons/${filename}`,
        category: category,
        tags: Array.isArray(tags) && tags.length > 0 ? tags : [category],
        description: description || `A canonical ${category} asset representing ${name}.`,
      };

      if (!fs.existsSync(catalogDir)) {
        fs.mkdirSync(catalogDir, { recursive: true });
      }

      let catalogAssets: any[] = [];
      if (fs.existsSync(catalogJsonPath)) {
        const raw = fs.readFileSync(catalogJsonPath, "utf8");
        catalogAssets = JSON.parse(raw);
      }

      const existingIdx = catalogAssets.findIndex((a: any) => a.id === assetId);
      if (existingIdx >= 0) {
        catalogAssets[existingIdx] = catalogEntry;
      } else {
        catalogAssets.push(catalogEntry);
      }

      fs.writeFileSync(catalogJsonPath, JSON.stringify(catalogAssets, null, 2), "utf8");

      console.log(`[API /api/assets/save] Persisted asset '${assetId}' (${action || "save"}) to ${filename}`);
      return res.json({ success: true, asset: catalogEntry });
    } catch (err: any) {
      console.error("[API /api/assets/save] Error saving asset:", err);
      return res.status(500).json({ error: err.message || "Failed to persist asset." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
