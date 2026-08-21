import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/icons/add", (req, res) => {
    const { file, iconId, svgContent, markdownRow } = req.body;

    if (!file || !iconId || !svgContent) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const dirPath = path.join(process.cwd(), "src/assets/icons", file);
    const filePath = path.join(dirPath, `${iconId}.svg`);
    const assetsMdPath = path.join(process.cwd(), "ASSETS.md");

    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      fs.writeFileSync(filePath, svgContent, "utf8");

      if (markdownRow && fs.existsSync(assetsMdPath)) {
        let mdContent = fs.readFileSync(assetsMdPath, "utf8");
        if (mdContent.includes("## Metadata Register")) {
          if (!mdContent.endsWith("\n")) mdContent += "\n";
          mdContent += `${markdownRow}\n`;
          fs.writeFileSync(assetsMdPath, mdContent);
        }
      }

      res.json({ success: true });
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
