import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  return httpServer;
}
