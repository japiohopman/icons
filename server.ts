import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit to handle data URLs / binary payloads
  app.use(express.json({ limit: "25mb" }));

  // GET /api/folders - Retrieve persisted logical virtual folders
  app.get("/api/folders", (_req, res) => {
    const foldersFilePath = path.join(process.cwd(), "src/assets/catalog/folders.json");
    try {
      if (fs.existsSync(foldersFilePath)) {
        const raw = fs.readFileSync(foldersFilePath, "utf8");
        const folders = JSON.parse(raw);
        return res.json({ success: true, folders });
      }
      return res.json({ success: true, folders: [] });
    } catch (err: any) {
      console.error("[API /api/folders GET] Error reading folders:", err);
      return res.status(500).json({ error: "Failed to load folders." });
    }
  });

  // POST /api/folders - Save logical virtual folders array
  app.post("/api/folders", (req, res) => {
    const { folders } = req.body;
    if (!Array.isArray(folders)) {
      return res.status(400).json({ error: "Invalid folders payload; expected array." });
    }

    // Validate folder objects
    for (const f of folders) {
      if (!f || typeof f.id !== "string" || typeof f.name !== "string") {
        return res.status(400).json({ error: "Folder objects must contain valid string 'id' and 'name'." });
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(f.id)) {
        return res.status(400).json({ error: `Invalid folder ID format: ${f.id}` });
      }
    }

    const catalogDir = path.join(process.cwd(), "src/assets/catalog");
    const foldersFilePath = path.join(catalogDir, "folders.json");

    try {
      if (!fs.existsSync(catalogDir)) {
        fs.mkdirSync(catalogDir, { recursive: true });
      }
      fs.writeFileSync(foldersFilePath, JSON.stringify(folders, null, 2), "utf8");
      console.log(`[API /api/folders POST] Persisted ${folders.length} logical folders.`);
      return res.json({ success: true, folders });
    } catch (err: any) {
      console.error("[API /api/folders POST] Error saving folders:", err);
      return res.status(500).json({ error: "Failed to persist folders." });
    }
  });

  // POST /api/assets/move - Reassign asset to a logical virtual folder
  app.post("/api/assets/move", (req, res) => {
    const { assetId, folderId } = req.body;
    if (!assetId || typeof assetId !== "string") {
      return res.status(400).json({ error: "Missing or invalid assetId." });
    }

    const catalogDir = path.join(process.cwd(), "src/assets/catalog/icons");
    if (!fs.existsSync(catalogDir)) {
      return res.status(404).json({ error: "Catalog directory not found." });
    }

    try {
      const catFiles = fs.readdirSync(catalogDir).filter((f) => f.endsWith(".json"));
      let updatedAsset: any = null;

      for (const cFile of catFiles) {
        const fullPath = path.join(catalogDir, cFile);
        const raw = fs.readFileSync(fullPath, "utf8");
        const items = JSON.parse(raw);

        if (Array.isArray(items)) {
          const idx = items.findIndex((item: any) => item.id === assetId);
          if (idx >= 0) {
            if (folderId) {
              items[idx].folderId = folderId;
            } else {
              delete items[idx].folderId;
            }
            updatedAsset = items[idx];
            fs.writeFileSync(fullPath, JSON.stringify(items, null, 2), "utf8");
            break;
          }
        }
      }

      if (!updatedAsset) {
        return res.status(404).json({ error: `Asset '${assetId}' not found in catalog.` });
      }

      console.log(`[API /api/assets/move] Reassigned asset '${assetId}' to folder '${folderId || "root"}'.`);
      return res.json({ success: true, asset: updatedAsset });
    } catch (err: any) {
      console.error("[API /api/assets/move] Error moving asset:", err);
      return res.status(500).json({ error: "Failed to move asset." });
    }
  });

  app.post("/api/assets/save", (req, res) => {
    const { action, assetId, originalAssetId, name, category, file, content, tags, description, folderId } = req.body;

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

      // Check all catalog JSON files for existing assetId
      let existingAssetFoundInCatalog = false;
      if (fs.existsSync(catalogDir)) {
        const catFiles = fs.readdirSync(catalogDir).filter(f => f.endsWith(".json"));
        for (const cFile of catFiles) {
          try {
            const raw = fs.readFileSync(path.join(catalogDir, cFile), "utf8");
            const items = JSON.parse(raw);
            if (Array.isArray(items) && items.some((item: any) => item.id === assetId)) {
              existingAssetFoundInCatalog = true;
              break;
            }
          } catch (e) {
            // Ignore parse errors on check
          }
        }
      }

      // 1. HARDENING FOR SAVE AS
      if (action === "save-as") {
        if (originalAssetId && assetId === originalAssetId) {
          return res.status(400).json({ error: "Save As must use a new asset ID different from the original." });
        }

        if (fs.existsSync(physicalFilePath)) {
          return res.status(409).json({ error: "Save As failed: Physical asset file already exists." });
        }

        if (existingAssetFoundInCatalog) {
          return res.status(409).json({ error: "Save As failed: Asset ID already exists in catalog." });
        }
      }

      // 2. Write physical file
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

      // 3. Update catalog entry in src/assets/catalog/icons/<category>.json
      const catalogEntry: any = {
        id: assetId,
        name: name,
        file: `/assets/icons/${filename}`,
        category: category,
        tags: Array.isArray(tags) && tags.length > 0 ? tags : [category],
        description: description || `A canonical ${category} asset representing ${name}.`,
      };
      if (folderId) {
        catalogEntry.folderId = folderId;
      }

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
