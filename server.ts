import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/icons/add", (req, res) => {
    const { categoryId, filename, iconId, label, description, publicPath, svgContent } = req.body;

    const fileToSave = filename || (iconId ? `${iconId.split('.').pop()}.svg` : null);
    if (!fileToSave || !svgContent) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const publicIconsDir = path.join(process.cwd(), "public/assets/icons");
    const physicalFilePath = path.join(publicIconsDir, fileToSave);

    const category = categoryId || "general";
    const catalogJsonPath = path.join(process.cwd(), "src/assets/catalog/icons", `${category}.json`);

    try {
      if (!fs.existsSync(publicIconsDir)) {
        fs.mkdirSync(publicIconsDir, { recursive: true });
      }

      // 1. Save physical asset to flat store public/assets/icons/
      fs.writeFileSync(physicalFilePath, svgContent, "utf8");

      // 2. Add catalog metadata entry to src/assets/catalog/icons/<category>.json
      const assetEntry = {
        id: iconId || `${category}.${fileToSave.replace(/\.svg$/, '')}`,
        name: label || fileToSave.replace(/\.svg$/, ''),
        file: publicPath || `/assets/icons/${fileToSave}`,
        category: category,
        tags: [category, fileToSave.replace(/\.svg$/, '')],
        description: description || `A canonical ${category} icon.`,
      };

      let catalogAssets = [];
      if (fs.existsSync(catalogJsonPath)) {
        const raw = fs.readFileSync(catalogJsonPath, "utf8");
        catalogAssets = JSON.parse(raw);
      }

      // Replace existing entry if ID matches, else push
      const existingIdx = catalogAssets.findIndex((a: any) => a.id === assetEntry.id);
      if (existingIdx >= 0) {
        catalogAssets[existingIdx] = assetEntry;
      } else {
        catalogAssets.push(assetEntry);
      }

      const catalogDir = path.dirname(catalogJsonPath);
      if (!fs.existsSync(catalogDir)) {
        fs.mkdirSync(catalogDir, { recursive: true });
      }
      fs.writeFileSync(catalogJsonPath, JSON.stringify(catalogAssets, null, 2), "utf8");

      res.json({ success: true, asset: assetEntry });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
