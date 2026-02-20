import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./replit_integrations/auth";
import { insertProfileSchema, insertSocialLinkSchema, insertSponsorSchema, insertDiscountCodeSchema, insertGameSchema } from "@shared/schema";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import multer from "multer";
import path from "path";
import fs from "fs";

// Local file upload setup
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/profile", async (req, res) => {
    try {
      const result = await storage.getProfile();
      if (!result) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/social-links", async (req, res) => {
    try {
      const result = await storage.getSocialLinks();
      res.json(result);
    } catch (error) {
      console.error("Error fetching social links:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/sponsors", async (req, res) => {
    try {
      const result = await storage.getSponsors();
      res.json(result);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/discount-codes", async (req, res) => {
    try {
      const result = await storage.getDiscountCodes();
      res.json(result);
    } catch (error) {
      console.error("Error fetching discount codes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/games", async (req, res) => {
    try {
      const result = await storage.getGames();
      res.json(result);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Register object storage routes (Replit-only, may fail in local dev)
  try {
    registerObjectStorageRoutes(app);
  } catch (_e) {
    // Not on Replit, skip
  }

  // Local file upload helper
  const handleUpload = (req: any, res: any) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("Upload error:", err);
        return res.status(400).json({ message: err.message || "Upload failed" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl, objectPath: fileUrl });
    });
  };

  // Upload endpoints (local multer-based)
  app.post("/api/admin/upload-logo", handleUpload);
  app.post("/api/admin/upload-sponsor-logo", handleUpload);
  app.post("/api/admin/upload-game-logo", handleUpload);
  app.post("/api/admin/upload-background-image", handleUpload);

  app.put("/api/admin/profile", isAuthenticated, async (req, res) => {
    try {
      const existing = await storage.getProfile();
      const updateSchema = insertProfileSchema.partial();
      if (!existing) {
        const parsed = insertProfileSchema.parse(req.body);
        const result = await storage.createProfile(parsed);
        return res.json(result);
      }
      const parsed = updateSchema.parse(req.body);
      const result = await storage.updateProfile(existing.id, parsed);
      res.json(result);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/social-links", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertSocialLinkSchema.parse(req.body);
      const result = await storage.createSocialLink(parsed);
      res.json(result);
    } catch (error) {
      console.error("Error creating social link:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/social-links/:id", isAuthenticated, async (req, res) => {
    try {
      const updateSchema = insertSocialLinkSchema.partial();
      const parsed = updateSchema.parse(req.body);
      const result = await storage.updateSocialLink(req.params.id as string, parsed);
      res.json(result);
    } catch (error) {
      console.error("Error updating social link:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/social-links/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSocialLink(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting social link:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/sponsors", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertSponsorSchema.parse(req.body);
      const result = await storage.createSponsor(parsed);
      res.json(result);
    } catch (error) {
      console.error("Error creating sponsor:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/sponsors/:id", isAuthenticated, async (req, res) => {
    try {
      const updateSchema = insertSponsorSchema.partial();
      const parsed = updateSchema.parse(req.body);
      const result = await storage.updateSponsor(req.params.id as string, parsed);
      res.json(result);
    } catch (error) {
      console.error("Error updating sponsor:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/sponsors/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSponsor(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting sponsor:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/discount-codes", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertDiscountCodeSchema.parse(req.body);
      const result = await storage.createDiscountCode(parsed);
      res.json(result);
    } catch (error) {
      console.error("Error creating discount code:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/discount-codes/:id", isAuthenticated, async (req, res) => {
    try {
      const updateSchema = insertDiscountCodeSchema.partial();
      const parsed = updateSchema.parse(req.body);
      const result = await storage.updateDiscountCode(req.params.id as string, parsed);
      res.json(result);
    } catch (error) {
      console.error("Error updating discount code:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/discount-codes/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteDiscountCode(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting discount code:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Games admin CRUD
  app.post("/api/admin/games", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertGameSchema.parse(req.body);
      const result = await storage.createGame(parsed);
      res.json(result);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/games/:id", isAuthenticated, async (req, res) => {
    try {
      const updateSchema = insertGameSchema.partial();
      const parsed = updateSchema.parse(req.body);
      const result = await storage.updateGame(req.params.id as string, parsed);
      res.json(result);
    } catch (error) {
      console.error("Error updating game:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/games/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteGame(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting game:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // League of Legends API - supports Riot ID format (GameName#TAG)
  app.get("/api/lol/summoner/:region/:name/:tag", async (req, res) => {
    try {
      const { region, name, tag } = req.params;
      const { fetchLoLSummonerData } = await import("./services/lol-scraper");

      // Read API key from DB profile first, fall back to env var
      const profileData = await storage.getProfile();
      const apiKey = profileData?.riotApiKey || undefined;

      const data = await fetchLoLSummonerData(name, region, tag, apiKey);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching LoL data:", error);
      res.status(500).json({ success: false, message: "Failed to fetch summoner data" });
    }
  });

  return httpServer;
}

