import type { Express } from "express";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", (req, res) => {
    if ((req.session as any).isAuthenticated) {
      res.json({ username: "admin", isAdmin: true });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Login with username/password
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "81255778.Fatih";

    if (username === adminUsername && password === adminPassword) {
      (req.session as any).isAuthenticated = true;
      (req.session as any).isAdmin = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ message: "Geçersiz kullanıcı adı veya şifre" });
    }
  });

  // Logout
  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
}
