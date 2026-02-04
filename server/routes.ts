import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./replit_integrations/auth";
import { insertProfileSchema, insertSocialLinkSchema, insertSponsorSchema, insertDiscountCodeSchema } from "@shared/schema";

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

  // Admin routes - protected
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

  return httpServer;
}
