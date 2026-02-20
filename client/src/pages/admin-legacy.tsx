import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Copy, Check, Plus, Trash2, Save, LogOut, ArrowLeft, Pencil, X, ChevronUp, ChevronDown, Upload, Loader2, Layout, Image as ImageIcon, Type, Link as LinkIcon, AlertTriangle, Lock } from "lucide-react";
import { SiKick } from "react-icons/si";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProfileSchema, insertSocialLinkSchema, insertSponsorSchema, insertDiscountCodeSchema, type Profile, type SocialLink, type Sponsor, type DiscountCode } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  // profileForm type needs to be inferred or loosely customized if strictly typed
  // Initial state from profile data will be set in useEffect
  const [profileForm, setProfileForm] = useState<any>({
    name: "",
    title: "",
    bio: "",
    themeColor: "#7c3aed",
    cardOpacity: 80,
    backgroundBlur: 0,
    bioTitle: "",
    bioTitleColor: "#000000",
    bioBody: "",
    bioBodyColor: "#333333",
    bioFooter: "",
    bioFooterColor: "#ff0000",
    bioBorderColor: "", // default empty
    bioBackgroundColor: "#fffBEB",
    // Site Branding
    siteTitle: "Link Hub",
    faviconUrl: "",
    // New Fields
    fontFamily: "Nunito",
    borderRadius: "2rem",
    floatingEmojis: false,
    kickUsername: "",
    kickAutoplay: true,
    announcementText: "",
    announcementEnabled: false,
    announcementColor: "#7c3aed",
    ctaButtonText: "",
    ctaButtonUrl: "",
    ctaButtonEnabled: false,
    statsEnabled: false,
    statsFollowers: "",
    statsViews: "",
    layoutConfig: [],
  });
  const [newLink, setNewLink] = useState<{
    platform: string;
    url: string;
    followerCount: string;
    badge: string;
    description: string;
    colSpan: number;
    customBgColor: string;
    customTextColor: string;
    displayStyle: string;
  }>({
    platform: "",
    url: "",
    followerCount: "",
    badge: "",
    description: "",
    colSpan: 2,
    customBgColor: "",
    customTextColor: "",
    displayStyle: "standard"
  });
  const [newSponsor, setNewSponsor] = useState({ name: "", description: "", websiteUrl: "", code: "", discountPercent: "", logoUrl: "" });
  const [newCode, setNewCode] = useState({ code: "", description: "", discountPercent: "", url: "", sponsorId: "", logoUrl: "" });

  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingSponsorId, setUploadingSponsorId] = useState<string | null>(null);
  const [uploadingGameId, setUploadingGameId] = useState<string | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Step 1: Get presigned URL
      const response = await fetch("/api/admin/upload-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Upload failed");

      const { uploadURL, objectPath } = await response.json();

      // Step 2: Upload directly to presigned URL
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) throw new Error("Upload to storage failed");

      setProfileForm({ ...profileForm, avatarUrl: objectPath });
      toast({ title: "Logo yüklendi" });
    } catch (error) {
      toast({ title: "Yükleme başarısız", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSponsorLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, sponsorId: string | null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSponsorId(sponsorId || "new");
    try {
      // Step 1: Get presigned URL
      const response = await fetch("/api/admin/upload-sponsor-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Upload failed");

      const { uploadURL, objectPath } = await response.json();

      // Step 2: Upload directly to presigned URL
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) throw new Error("Upload to storage failed");

      if (sponsorId && editingSponsor) {
        setEditingSponsor({ ...editingSponsor, logoUrl: objectPath });
      } else {
        setNewSponsor({ ...newSponsor, logoUrl: objectPath });
      }
      toast({ title: "Logo yüklendi" });
    } catch (error) {
      toast({ title: "Yükleme başarısız", variant: "destructive" });
    } finally {
      setUploadingSponsorId(null);
    }
  };

  const handleGameLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, gameId: string | null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingGameId(gameId || "new");
    try {
      // Step 1: Get presigned URL
      const response = await fetch("/api/admin/upload-game-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Upload failed");

      const { uploadURL, objectPath } = await response.json();

      // Step 2: Upload directly to presigned URL
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) throw new Error("Upload to storage failed");

      if (gameId && editingCode) {
        setEditingCode({ ...editingCode, logoUrl: objectPath });
      } else {
        setNewCode({ ...newCode, logoUrl: objectPath });
      }
      toast({ title: "Logo yüklendi" });
    } catch (error) {
      toast({ title: "Yükleme başarısız", variant: "destructive" });
    } finally {
      setUploadingGameId(null);
    }
  };

  const { data: profile } = useQuery<Profile>({ queryKey: ["/api/profile"] });
  const { data: socialLinks = [] } = useQuery<SocialLink[]>({ queryKey: ["/api/social-links"] });
  const { data: sponsors = [] } = useQuery<Sponsor[]>({ queryKey: ["/api/sponsors"] });
  const { data: discountCodes = [] } = useQuery<DiscountCode[]>({ queryKey: ["/api/discount-codes"] });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        themeColor: profile.themeColor,
        backgroundImageUrl: profile.backgroundImageUrl,
        backgroundBlur: profile.backgroundBlur,
        cardOpacity: profile.cardOpacity,
        bioTitle: profile.bioTitle,
        bioTitleColor: profile.bioTitleColor,
        bioBody: profile.bioBody,
        bioBodyColor: profile.bioBodyColor,
        bioFooter: profile.bioFooter,
        bioFooterColor: profile.bioFooterColor,
        bioBorderColor: profile.bioBorderColor,
        bioBackgroundColor: profile.bioBackgroundColor,
        // Site Branding
        siteTitle: profile.siteTitle,
        faviconUrl: profile.faviconUrl,
        // New Fields
        fontFamily: profile.fontFamily,
        borderRadius: profile.borderRadius,
        floatingEmojis: profile.floatingEmojis,
        kickUsername: profile.kickUsername,
        kickAutoplay: profile.kickAutoplay,
        announcementText: profile.announcementText,
        announcementEnabled: profile.announcementEnabled,
        announcementColor: profile.announcementColor,
        ctaButtonText: profile.ctaButtonText,
        ctaButtonUrl: profile.ctaButtonUrl,
        ctaButtonEnabled: profile.ctaButtonEnabled,
        statsEnabled: profile.statsEnabled,
        statsFollowers: profile.statsFollowers,
        statsViews: profile.statsViews,
        layoutConfig: profile.layoutConfig || [
          { id: "bio", visible: true, width: "full" },
          { id: "widgets", visible: true, width: "full" }, // Kick, Premium etc. grouped or separate? Let's separate if we can, but widgets are currently grouped in code. 
          // Actually, let's split them for maximum control as requested: "tüm siteyi elle rahat bir şekilde ayarlamak"
          { id: "kick", visible: true, width: "full" },
          { id: "announcement", visible: true, "width": "full" },
          { id: "cta", visible: true, "width": "full" },
          { id: "stats", visible: true, "width": "full" },
          { id: "socials", visible: true, width: "full" },
          { id: "sponsors", visible: true, width: "full" },
          { id: "games", visible: true, width: "full" },
          { id: "contact", visible: true, width: "full" }
        ],
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isLoading, isAuthenticated]);

  const updateProfile = useMutation({
    mutationFn: (data: Partial<Profile>) => apiRequest("PUT", "/api/admin/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "Profil güncellendi" });
    },
  });

  const createLink = useMutation({
    mutationFn: (data: { platform: string; url: string; followerCount?: string; badge?: string; description?: string }) =>
      apiRequest("POST", "/api/admin/social-links", { ...data, displayOrder: socialLinks.length, isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
      setNewLink({
        platform: "",
        url: "",
        followerCount: "",
        badge: "",
        description: "",
        colSpan: 2,
        customBgColor: "",
        customTextColor: "",
        displayStyle: "standard"
      });
      toast({ title: "Link eklendi" });
    },
  });

  const deleteLink = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/social-links/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
      toast({ title: "Link silindi" });
    },
  });

  const updateLink = useMutation({
    mutationFn: (data: { id: string; updates: Partial<SocialLink> }) => {
      const { platform, url, followerCount, badge, description, colSpan, customBgColor, customTextColor, displayStyle } = data.updates;
      const sanitized = {
        platform,
        url,
        followerCount: followerCount || null,
        badge: badge || null,
        description: description !== undefined ? (description || null) : undefined,
        colSpan: colSpan || 2,
        customBgColor: customBgColor || null,
        customTextColor: customTextColor || null,
        displayStyle: displayStyle || "standard",
      };
      return apiRequest("PUT", `/api/admin/social-links/${data.id}`, sanitized);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
      setEditingLink(null);
      toast({ title: "Link güncellendi" });
    },
  });

  const createSponsor = useMutation({
    mutationFn: (data: { name: string; description: string; websiteUrl: string; code?: string; discountPercent?: number; logoUrl?: string }) =>
      apiRequest("POST", "/api/admin/sponsors", { ...data, displayOrder: sponsors.length, isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sponsors"] });
      setNewSponsor({ name: "", description: "", websiteUrl: "", code: "", discountPercent: "", logoUrl: "" });
      toast({ title: "Sponsor eklendi" });
    },
  });

  const deleteSponsor = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/sponsors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sponsors"] });
      toast({ title: "Sponsor silindi" });
    },
  });

  const updateSponsor = useMutation({
    mutationFn: (data: { id: string; updates: Partial<Sponsor> }) => {
      const { name, description, websiteUrl, code, discountPercent, logoUrl } = data.updates;
      const sanitized = {
        name,
        description: description || undefined,
        websiteUrl,
        code: code && code.trim() ? code.trim() : null,
        discountPercent: discountPercent !== null && discountPercent !== undefined && discountPercent > 0 ? Number(discountPercent) : null,
        logoUrl: logoUrl || undefined,
      };
      return apiRequest("PUT", `/api/admin/sponsors/${data.id}`, sanitized);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sponsors"] });
      setEditingSponsor(null);
      toast({ title: "Sponsor güncellendi" });
    },
  });

  const createCode = useMutation({
    mutationFn: (data: { code: string; description: string; discountPercent?: number; url: string; sponsorId?: string; logoUrl?: string }) =>
      apiRequest("POST", "/api/admin/discount-codes", { ...data, displayOrder: discountCodes.length, isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discount-codes"] });
      setNewCode({ code: "", description: "", discountPercent: "", url: "", sponsorId: "", logoUrl: "" });
      toast({ title: "Kod eklendi" });
    },
  });

  const deleteCode = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/discount-codes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discount-codes"] });
      toast({ title: "Kod silindi" });
    },
  });

  const updateCode = useMutation({
    mutationFn: (data: { id: string; updates: Partial<DiscountCode> }) => {
      const { code, description, url, discountPercent, logoUrl } = data.updates;
      const sanitized = {
        code,
        description: description || undefined,
        url: url || undefined,
        discountPercent: discountPercent !== null && discountPercent !== undefined ? Number(discountPercent) : undefined,
        logoUrl: logoUrl || undefined,
      };
      return apiRequest("PUT", `/api/admin/discount-codes/${data.id}`, sanitized);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discount-codes"] });
      setEditingCode(null);
      toast({ title: "Kod güncellendi" });
    },
  });

  const reorderLinks = async (id: string, direction: 'up' | 'down') => {
    if (isReordering) return;
    setIsReordering(true);
    try {
      const sorted = [...socialLinks].sort((a, b) => a.displayOrder - b.displayOrder);
      const index = sorted.findIndex(item => item.id === id);
      if (direction === 'up' && index > 0) {
        const current = sorted[index];
        const prev = sorted[index - 1];
        await apiRequest("PUT", `/api/admin/social-links/${current.id}`, { displayOrder: prev.displayOrder });
        await apiRequest("PUT", `/api/admin/social-links/${prev.id}`, { displayOrder: current.displayOrder });
        queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
      } else if (direction === 'down' && index < sorted.length - 1) {
        const current = sorted[index];
        const next = sorted[index + 1];
        await apiRequest("PUT", `/api/admin/social-links/${current.id}`, { displayOrder: next.displayOrder });
        await apiRequest("PUT", `/api/admin/social-links/${next.id}`, { displayOrder: current.displayOrder });
        queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
      }
    } finally {
      setIsReordering(false);
    }
  };

  const reorderSponsors = async (id: string, direction: 'up' | 'down') => {
    if (isReordering) return;
    setIsReordering(true);
    try {
      const sorted = [...sponsors].sort((a, b) => a.displayOrder - b.displayOrder);
      const index = sorted.findIndex(item => item.id === id);
      if (direction === 'up' && index > 0) {
        const current = sorted[index];
        const prev = sorted[index - 1];
        await apiRequest("PUT", `/api/admin/sponsors/${current.id}`, { displayOrder: prev.displayOrder });
        await apiRequest("PUT", `/api/admin/sponsors/${prev.id}`, { displayOrder: current.displayOrder });
        queryClient.invalidateQueries({ queryKey: ["/api/sponsors"] });
      } else if (direction === 'down' && index < sorted.length - 1) {
        const current = sorted[index];
        const next = sorted[index + 1];
        await apiRequest("PUT", `/api/admin/sponsors/${current.id}`, { displayOrder: next.displayOrder });
        await apiRequest("PUT", `/api/admin/sponsors/${next.id}`, { displayOrder: current.displayOrder });
        queryClient.invalidateQueries({ queryKey: ["/api/sponsors"] });
      }
    } finally {
      setIsReordering(false);
    }
  };

  const reorderCodes = async (id: string, direction: 'up' | 'down') => {
    if (isReordering) return;
    setIsReordering(true);
    try {
      const sorted = [...discountCodes].sort((a, b) => a.displayOrder - b.displayOrder);
      const index = sorted.findIndex(item => item.id === id);
      if (direction === 'up' && index > 0) {
        const current = sorted[index];
        const prev = sorted[index - 1];
        await apiRequest("PUT", `/api/admin/discount-codes/${current.id}`, { displayOrder: prev.displayOrder });
        await apiRequest("PUT", `/api/admin/discount-codes/${prev.id}`, { displayOrder: current.displayOrder });
        queryClient.invalidateQueries({ queryKey: ["/api/discount-codes"] });
      } else if (direction === 'down' && index < sorted.length - 1) {
        const current = sorted[index];
        const next = sorted[index + 1];
        await apiRequest("PUT", `/api/admin/discount-codes/${current.id}`, { displayOrder: next.displayOrder });
        await apiRequest("PUT", `/api/admin/discount-codes/${next.id}`, { displayOrder: current.displayOrder });
        queryClient.invalidateQueries({ queryKey: ["/api/discount-codes"] });
      }
    } finally {
      setIsReordering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Admin Panel</h1>
              {user && (
                <p className="text-xs text-muted-foreground">
                  Hoş geldin, {user.firstName || user.email || 'Admin'}
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => logout()} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil & İçerik</TabsTrigger>
            <TabsTrigger value="widgets">Widgetlar & Araçlar</TabsTrigger>
            <TabsTrigger value="layout">Düzen & Görünüm</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profil & Biyografi</CardTitle>
                <CardDescription>Temel profil bilgileriniz ve biyografi kartı ayarları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Profile Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Temel Bilgiler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>İsim</Label>
                      <Input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="İsminiz"
                      />
                    </div>
                    <div>
                      <Label>Başlık</Label>
                      <Input
                        value={profileForm.title}
                        onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                        placeholder="Ör: Kick & YouTube İçerik Üreticisi"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Kısa açıklama"
                      className="h-20"
                    />
                  </div>
                  <div>
                    <Label>Logo</Label>
                    <div className="flex items-center gap-3">
                      {profileForm.avatarUrl && (
                        <img
                          src={profileForm.avatarUrl}
                          alt="Logo"
                          className="w-16 h-16 rounded-full object-cover border"
                        />
                      )}
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isUploading}
                          onClick={() => document.getElementById("logo-upload")?.click()}
                          data-testid="button-upload-logo"
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          {isUploading ? "Yükleniyor..." : "Logo Yükle"}
                        </Button>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                          data-testid="input-logo-file"
                        />
                        <span className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP (maks. 5MB)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Biography Card Customization */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold">Biyografi Kartı Özelleştirme</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Kart Başlığı</Label>
                      <Input
                        value={profileForm.bioTitle || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, bioTitle: e.target.value })}
                        placeholder="Ör: Kick Streamer & İçerik Üreticisi"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={profileForm.bioTitleColor || "#000000"}
                          onChange={(e) => setProfileForm({ ...profileForm, bioTitleColor: e.target.value })}
                          className="w-8 h-8 p-1 rounded-md cursor-pointer"
                        />
                        <span className="text-xs text-muted-foreground">Başlık Rengi</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Alt Bilgi</Label>
                      <Input
                        value={profileForm.bioFooter || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, bioFooter: e.target.value })}
                        placeholder="Ör: +18 içerikler için..."
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={profileForm.bioFooterColor || "#ff0000"}
                          onChange={(e) => setProfileForm({ ...profileForm, bioFooterColor: e.target.value })}
                          className="w-8 h-8 p-1 rounded-md cursor-pointer"
                        />
                        <span className="text-xs text-muted-foreground">Alt Bilgi Rengi</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Detaylı İçerik</Label>
                    <Textarea
                      value={profileForm.bioBody || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, bioBody: e.target.value })}
                      placeholder="Detaylı biyografi metni..."
                      className="h-24"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={profileForm.bioBodyColor || "#333333"}
                        onChange={(e) => setProfileForm({ ...profileForm, bioBodyColor: e.target.value })}
                        className="w-8 h-8 p-1 rounded-md cursor-pointer"
                      />
                      <span className="text-xs text-muted-foreground">İçerik Rengi</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Kart Arka Plan Rengi</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={profileForm.bioBackgroundColor || "#fffBEB"}
                          onChange={(e) => setProfileForm({ ...profileForm, bioBackgroundColor: e.target.value })}
                          className="w-8 h-8 p-1 rounded-md cursor-pointer"
                        />
                        <span className="text-sm text-muted-foreground">{profileForm.bioBackgroundColor}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Kart Kenarlık Rengi (Opsiyonel)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={profileForm.bioBorderColor || "#000000"}
                          onChange={(e) => setProfileForm({ ...profileForm, bioBorderColor: e.target.value })}
                          className="w-8 h-8 p-1 rounded-md cursor-pointer"
                        />
                        <span className="text-sm text-muted-foreground">{profileForm.bioBorderColor || "Yok"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={() => updateProfile.mutate(profileForm)} disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Site Ayarları</CardTitle>
                <CardDescription>Site başlığı ve favicon ayarları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Site Başlığı</Label>
                  <Input
                    value={profileForm.siteTitle}
                    onChange={(e) => setProfileForm({ ...profileForm, siteTitle: e.target.value })}
                    placeholder="Link Hub"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Tarayıcı sekmesinde görünecek başlık</p>
                </div>
                <div>
                  <Label>Favicon URL (İsteğe Bağlı)</Label>
                  <Input
                    value={profileForm.faviconUrl || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, faviconUrl: e.target.value })}
                    placeholder="https://example.com/favicon.png"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Site ikonu için bir URL girin (boş bırakılabilir)</p>
                </div>
                <Button onClick={() => updateProfile.mutate(profileForm)} disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Görünüm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tema Rengi</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="color"
                        value={profileForm.themeColor || "#7c3aed"}
                        onChange={(e) => setProfileForm({ ...profileForm, themeColor: e.target.value })}
                        className="w-12 h-12 p-1 rounded-md cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground">{profileForm.themeColor || "#7c3aed"}</span>
                    </div>
                  </div>

                  <div>
                    <Label>Kart Şeffaflığı (%{profileForm.cardOpacity})</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={profileForm.cardOpacity ?? 80}
                        onChange={(e) => setProfileForm({ ...profileForm, cardOpacity: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Arka Plan Bulanıklığı ({profileForm.backgroundBlur}px)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={profileForm.backgroundBlur ?? 0}
                        onChange={(e) => setProfileForm({ ...profileForm, backgroundBlur: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Arka Plan Resmi</Label>
                  <div className="flex items-center gap-3 mt-2">
                    {profileForm.backgroundImageUrl ? (
                      <img
                        src={profileForm.backgroundImageUrl}
                        alt="Arka Plan"
                        className="w-32 h-20 rounded-md object-cover border"
                      />
                    ) : (
                      <div className="w-32 h-20 rounded-md bg-muted border flex items-center justify-center text-muted-foreground text-xs">
                        Resim Yok
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading}
                        onClick={() => document.getElementById("bg-upload")?.click()}
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {isUploading ? "Yükleniyor..." : "Yükle"}
                      </Button>
                      <input
                        id="bg-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploading(true);
                          try {
                            const response = await fetch("/api/uploads/request-url", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              credentials: "include",
                              body: JSON.stringify({
                                name: file.name,
                                size: file.size,
                                contentType: file.type
                              })
                            });
                            if (!response.ok) throw new Error("Upload failed");
                            const { uploadURL, objectPath } = await response.json();
                            const uploadResponse = await fetch(uploadURL, {
                              method: "PUT",
                              body: file,
                              headers: { "Content-Type": file.type },
                            });
                            if (!uploadResponse.ok) throw new Error("Storage upload failed");
                            setProfileForm({ ...profileForm, backgroundImageUrl: objectPath });
                            toast({ title: "Arka plan yüklendi" });
                          } catch (error) {
                            toast({ title: "Yükleme başarısız", variant: "destructive" });
                          } finally {
                            setIsUploading(false);
                          }
                        }}
                      />
                      {profileForm.backgroundImageUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setProfileForm({ ...profileForm, backgroundImageUrl: "" })}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Kaldır
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Button onClick={() => updateProfile.mutate(profileForm)} disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Görünümü Kaydet
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sosyal Medya Linkleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...socialLinks].sort((a, b) => a.displayOrder - b.displayOrder).map((link) => (
                  <div key={link.id} className="p-3 border rounded-md space-y-2">
                    {editingLink?.id === link.id ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={editingLink.platform}
                            onChange={(e) => setEditingLink({ ...editingLink, platform: e.target.value })}
                            placeholder="Platform"
                            className="flex-1"
                          />
                          <Input
                            value={editingLink.url}
                            onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                            placeholder="URL"
                            className="flex-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={editingLink.followerCount || ""}
                            onChange={(e) => setEditingLink({ ...editingLink, followerCount: e.target.value })}
                            placeholder="Takipçi sayısı"
                            className="flex-1"
                          />
                          <Input
                            value={editingLink.badge || ""}
                            onChange={(e) => setEditingLink({ ...editingLink, badge: e.target.value })}
                            placeholder="Rozet (Partner vb.)"
                            className="flex-1"
                          />
                        </div>
                        <Input
                          value={editingLink.description || ""}
                          onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                          placeholder="Açıklama"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Görünüm Modu</Label>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={editingLink.displayStyle || "standard"}
                              onChange={(e) => setEditingLink({ ...editingLink, displayStyle: e.target.value })}
                            >
                              <option value="standard">Standart (Yatay)</option>
                              <option value="grid">Kutu (Dikey)</option>
                              <option value="icon">Sadece İkon (Yuvarlak)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Genişlik</Label>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={editingLink.colSpan || 2}
                              onChange={(e) => setEditingLink({ ...editingLink, colSpan: parseInt(e.target.value) })}
                            >
                              <option value={2}>Tam Genişlik</option>
                              <option value={1}>Yarım Genişlik</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Özel Renkler</Label>
                            <div className="flex gap-2">
                              <div className="flex items-center gap-1">
                                <Input
                                  type="color"
                                  value={editingLink.customBgColor || "#ffffff"}
                                  onChange={(e) => setEditingLink({ ...editingLink, customBgColor: e.target.value })}
                                  className="w-8 h-8 p-1 rounded-md cursor-pointer"
                                />
                                <span className="text-[10px] text-muted-foreground">Arka Plan</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="color"
                                  value={editingLink.customTextColor || "#000000"}
                                  onChange={(e) => setEditingLink({ ...editingLink, customTextColor: e.target.value })}
                                  className="w-8 h-8 p-1 rounded-md cursor-pointer"
                                />
                                <span className="text-[10px] text-muted-foreground">Yazı</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateLink.mutate({ id: link.id, updates: editingLink })} disabled={updateLink.isPending}>
                            <Save className="w-4 h-4 mr-1" /> Kaydet
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingLink(null)}>
                            <X className="w-4 h-4 mr-1" /> İptal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-0.5">
                          <Button variant="ghost" size="sm" className="px-1 py-0" onClick={() => reorderLinks(link.id, 'up')} disabled={isReordering}>
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="px-1 py-0" onClick={() => reorderLinks(link.id, 'down')} disabled={isReordering}>
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">{link.platform}</span>
                          {link.badge && (
                            <span className="ml-2 text-xs text-primary">({link.badge})</span>
                          )}
                          {link.followerCount && (
                            <span className="ml-2 text-xs text-muted-foreground">{link.followerCount} takipçi</span>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setEditingLink(link)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteLink.mutate(link.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newLink.platform}
                      onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                      placeholder="Platform (Kick, YouTube...)"
                      className="flex-1"
                    />
                    <Input
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      placeholder="URL"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newLink.followerCount}
                      onChange={(e) => setNewLink({ ...newLink, followerCount: e.target.value })}
                      placeholder="Takipçi sayısı (ör: 50K)"
                      className="flex-1"
                    />
                    <Input
                      value={newLink.badge}
                      onChange={(e) => setNewLink({ ...newLink, badge: e.target.value })}
                      placeholder="Rozet (ör: Partner)"
                      className="flex-1"
                    />
                  </div>
                  <Input
                    value={newLink.description}
                    onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                    placeholder="Açıklama (opsiyonel)"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Görünüm Modu</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newLink.displayStyle || "standard"}
                        onChange={(e) => setNewLink({ ...newLink, displayStyle: e.target.value })}
                      >
                        <option value="standard">Standart (Yatay)</option>
                        <option value="grid">Grid (Kutu)</option>
                        <option value="icon">İkon (Yuvarlak)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Genişlik</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newLink.colSpan}
                        onChange={(e) => setNewLink({ ...newLink, colSpan: parseInt(e.target.value) })}
                      >
                        <option value={2}>Tam Genişlik</option>
                        <option value={1}>Yarım Genişlik</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Özel Renkler (Opsiyonel)</Label>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                          <Input
                            type="color"
                            value={newLink.customBgColor || "#ffffff"}
                            onChange={(e) => setNewLink({ ...newLink, customBgColor: e.target.value })}
                            className="w-8 h-8 p-1 rounded-md cursor-pointer"
                          />
                          <span className="text-[10px] text-muted-foreground">Arka Plan</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Input
                            type="color"
                            value={newLink.customTextColor || "#000000"}
                            onChange={(e) => setNewLink({ ...newLink, customTextColor: e.target.value })}
                            className="w-8 h-8 p-1 rounded-md cursor-pointer"
                          />
                          <span className="text-[10px] text-muted-foreground">Yazı</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => createLink.mutate({
                      ...newLink,
                      followerCount: newLink.followerCount || undefined,
                      badge: newLink.badge || undefined,
                      description: newLink.description || undefined,
                      colSpan: newLink.colSpan || undefined,
                      customBgColor: newLink.customBgColor || undefined,
                      customTextColor: newLink.customTextColor || undefined,
                      displayStyle: newLink.displayStyle || undefined,
                    })}
                    disabled={!newLink.platform || !newLink.url}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Link Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sponsorlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...sponsors].sort((a, b) => a.displayOrder - b.displayOrder).map((sponsor) => (
                  <div key={sponsor.id} className="p-3 border rounded-md space-y-2">
                    {editingSponsor?.id === sponsor.id ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          {editingSponsor.logoUrl && (
                            <img src={editingSponsor.logoUrl} alt="Logo" className="w-12 h-12 rounded object-contain border" />
                          )}
                          <div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={uploadingSponsorId === sponsor.id}
                              onClick={() => document.getElementById(`sponsor-logo-${sponsor.id}`)?.click()}
                            >
                              {uploadingSponsorId === sponsor.id ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4 mr-1" />
                              )}
                              Logo Yükle
                            </Button>
                            <input
                              id={`sponsor-logo-${sponsor.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleSponsorLogoUpload(e, sponsor.id)}
                            />
                          </div>
                        </div>
                        <Input
                          value={editingSponsor.name}
                          onChange={(e) => setEditingSponsor({ ...editingSponsor, name: e.target.value })}
                          placeholder="Sponsor adı"
                        />
                        <Input
                          value={editingSponsor.description || ""}
                          onChange={(e) => setEditingSponsor({ ...editingSponsor, description: e.target.value })}
                          placeholder="Açıklama"
                        />
                        <Input
                          value={editingSponsor.websiteUrl}
                          onChange={(e) => setEditingSponsor({ ...editingSponsor, websiteUrl: e.target.value })}
                          placeholder="Web sitesi URL"
                        />
                        <div className="flex gap-2">
                          <Input
                            value={editingSponsor.code || ""}
                            onChange={(e) => setEditingSponsor({ ...editingSponsor, code: e.target.value })}
                            placeholder="İndirim kodu"
                            className="flex-1"
                          />
                          <Input
                            value={editingSponsor.discountPercent?.toString() || ""}
                            onChange={(e) => setEditingSponsor({ ...editingSponsor, discountPercent: e.target.value ? parseInt(e.target.value) : null })}
                            placeholder="İndirim %"
                            type="number"
                            className="w-24"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateSponsor.mutate({ id: sponsor.id, updates: editingSponsor })} disabled={updateSponsor.isPending}>
                            <Save className="w-4 h-4 mr-1" /> Kaydet
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingSponsor(null)}>
                            <X className="w-4 h-4 mr-1" /> İptal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-0.5">
                          <Button variant="ghost" size="sm" className="px-1 py-0" onClick={() => reorderSponsors(sponsor.id, 'up')} disabled={isReordering}>
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="px-1 py-0" onClick={() => reorderSponsors(sponsor.id, 'down')} disabled={isReordering}>
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                        {sponsor.logoUrl && (
                          <img src={sponsor.logoUrl} alt={sponsor.name} className="w-10 h-10 rounded object-contain border" />
                        )}
                        <div className="flex-1">
                          <span className="font-medium">{sponsor.name}</span>
                          {sponsor.code && (
                            <code className="ml-2 text-sm text-primary font-mono">{sponsor.code}</code>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setEditingSponsor(sponsor)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteSponsor.mutate(sponsor.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="space-y-2 p-3 border rounded-md bg-muted/30">
                  <div className="text-sm font-medium mb-2">Yeni Sponsor Ekle</div>
                  <div className="flex items-center gap-3">
                    {newSponsor.logoUrl && (
                      <img src={newSponsor.logoUrl} alt="Logo" className="w-12 h-12 rounded object-contain border" />
                    )}
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingSponsorId === "new"}
                        onClick={() => document.getElementById("new-sponsor-logo")?.click()}
                      >
                        {uploadingSponsorId === "new" ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-1" />
                        )}
                        Logo Yükle
                      </Button>
                      <input
                        id="new-sponsor-logo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSponsorLogoUpload(e, null)}
                      />
                    </div>
                  </div>
                  <Input
                    value={newSponsor.name}
                    onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                    placeholder="Sponsor adı"
                  />
                  <Input
                    value={newSponsor.description}
                    onChange={(e) => setNewSponsor({ ...newSponsor, description: e.target.value })}
                    placeholder="Açıklama (opsiyonel)"
                  />
                  <Input
                    value={newSponsor.websiteUrl}
                    onChange={(e) => setNewSponsor({ ...newSponsor, websiteUrl: e.target.value })}
                    placeholder="Web sitesi URL"
                  />
                  <Input
                    value={newSponsor.code}
                    onChange={(e) => setNewSponsor({ ...newSponsor, code: e.target.value })}
                    placeholder="İndirim kodu (opsiyonel)"
                  />
                  <Input
                    value={newSponsor.discountPercent}
                    onChange={(e) => setNewSponsor({ ...newSponsor, discountPercent: e.target.value })}
                    placeholder="İndirim % (opsiyonel)"
                    type="number"
                  />
                  <Button
                    onClick={() => {
                      createSponsor.mutate({
                        ...newSponsor,
                        code: newSponsor.code || undefined,
                        discountPercent: newSponsor.discountPercent ? parseInt(newSponsor.discountPercent) : undefined,
                        logoUrl: newSponsor.logoUrl || undefined,
                      });
                      setNewSponsor({ name: "", description: "", websiteUrl: "", code: "", discountPercent: "", logoUrl: "" });
                    }}
                    disabled={!newSponsor.name || !newSponsor.websiteUrl}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Sponsor Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Oyunlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...discountCodes].sort((a, b) => a.displayOrder - b.displayOrder).map((code) => (
                  <div key={code.id} className="p-3 border rounded-md space-y-2">
                    {editingCode?.id === code.id ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {editingCode.logoUrl ? (
                              <img src={editingCode.logoUrl} alt="Logo" className="w-16 h-16 object-cover rounded-md" />
                            ) : (
                              <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                                <Upload className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              disabled={uploadingGameId === code.id}
                              onChange={(e) => handleGameLogoUpload(e, code.id)}
                            />
                          </div>
                        </div>
                        <Input
                          value={editingCode.description || ""}
                          onChange={(e) => setEditingCode({ ...editingCode, description: e.target.value })}
                          placeholder="Oyun Adı"
                        />
                        <Input
                          value={editingCode.code}
                          onChange={(e) => setEditingCode({ ...editingCode, code: e.target.value })}
                          placeholder="Kod"
                        />
                        <Input
                          value={editingCode.url || ""}
                          onChange={(e) => setEditingCode({ ...editingCode, url: e.target.value })}
                          placeholder="Link"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateCode.mutate({ id: code.id, updates: editingCode })} disabled={updateCode.isPending}>
                            <Save className="w-4 h-4 mr-1" /> Kaydet
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingCode(null)}>
                            <X className="w-4 h-4 mr-1" /> İptal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-0.5">
                          <Button variant="ghost" size="sm" className="px-1 py-0" onClick={() => reorderCodes(code.id, 'up')} disabled={isReordering}>
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="px-1 py-0" onClick={() => reorderCodes(code.id, 'down')} disabled={isReordering}>
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                        {code.logoUrl && (
                          <img src={code.logoUrl} alt="Logo" className="w-10 h-10 object-cover rounded-md" />
                        )}
                        <span className="font-medium">{code.description || "İsimsiz"}</span>
                        <code className="font-mono text-sm text-primary">{code.code}</code>
                        <span className="flex-1"></span>
                        <Button variant="ghost" size="icon" onClick={() => setEditingCode(code)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCode.mutate(code.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="space-y-2 p-3 border rounded-md bg-muted/30">
                  <div className="text-sm font-medium mb-2">Yeni Oyun Ekle</div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {newCode.logoUrl ? (
                        <img src={newCode.logoUrl} alt="Logo" className="w-16 h-16 object-cover rounded-md" />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingGameId === "new"}
                        onChange={(e) => handleGameLogoUpload(e, null)}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">Logo yükle</span>
                  </div>
                  <Input
                    value={newCode.description}
                    onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                    placeholder="Oyun Adı"
                  />
                  <Input
                    value={newCode.code}
                    onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                    placeholder="Kod"
                  />
                  <Input
                    value={newCode.url}
                    onChange={(e) => setNewCode({ ...newCode, url: e.target.value })}
                    placeholder="Link"
                  />
                  <Button
                    onClick={() => {
                      createCode.mutate({
                        ...newCode,
                        logoUrl: newCode.logoUrl || undefined,
                        discountPercent: undefined,
                        sponsorId: undefined,
                      });
                      setNewCode({ code: "", description: "", discountPercent: "", url: "", sponsorId: "", logoUrl: "" });
                    }}
                    disabled={!newCode.code}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Oyun Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="widgets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kick Yayını</CardTitle>
                <CardDescription>Kick kullanıcı adınızı girerek yayınınızı sitenizde gösterin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Kick Kullanıcı Adı</Label>
                  <div className="flex items-center gap-2">
                    <SiKick className="w-5 h-5 text-green-500" />
                    <Input
                      value={profileForm.kickUsername || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, kickUsername: e.target.value })}
                      placeholder="Kullanıcı adı"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={profileForm.kickAutoplay}
                    onCheckedChange={(checked) => setProfileForm({ ...profileForm, kickAutoplay: checked })}
                  />
                  <Label>Otomatik Oynat</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => updateProfile.mutate(profileForm)} disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4 mr-2" /> Kaydet
                </Button>
              </CardFooter>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle>Duyuru Bandı</CardTitle>
                <CardDescription>Sayfanın üstünde önemli duyurular gösterin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Aktif Et</Label>
                    <div className="text-sm text-muted-foreground">Duyuru bandını göster/gizle</div>
                  </div>
                  <Switch
                    checked={profileForm.announcementEnabled}
                    onCheckedChange={(checked) => setProfileForm({ ...profileForm, announcementEnabled: checked })}
                  />
                </div>
                {profileForm.announcementEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Duyuru Metni</Label>
                      <Input
                        value={profileForm.announcementText || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, announcementText: e.target.value })}
                        placeholder="Örn: Canlı yayın başladı! 🔴"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Arka Plan Rengi</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={profileForm.announcementColor || "#7c3aed"}
                          onChange={(e) => setProfileForm({ ...profileForm, announcementColor: e.target.value })}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          value={profileForm.announcementColor || "#7c3aed"}
                          onChange={(e) => setProfileForm({ ...profileForm, announcementColor: e.target.value })}
                          placeholder="#7c3aed"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={() => updateProfile.mutate(profileForm)} disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4 mr-2" /> Kaydet
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Özel Buton (CTA)</CardTitle>
                <CardDescription>Dikkat çeken bir ana buton ekleyin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Aktif Et</Label>
                    <div className="text-sm text-muted-foreground">CTA butonunu göster/gizle</div>
                  </div>
                  <Switch
                    checked={profileForm.ctaButtonEnabled}
                    onCheckedChange={(checked) => setProfileForm({ ...profileForm, ctaButtonEnabled: checked })}
                  />
                </div>
                {profileForm.ctaButtonEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Buton Metni</Label>
                      <Input
                        value={profileForm.ctaButtonText || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, ctaButtonText: e.target.value })}
                        placeholder="Örn: Discord'a Katıl, Üye Ol"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Buton Linki</Label>
                      <Input
                        value={profileForm.ctaButtonUrl || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, ctaButtonUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={() => updateProfile.mutate(profileForm)} disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4 mr-2" /> Kaydet
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>İstatistikler</CardTitle>
                <CardDescription>Takipçi sayısı, görüntülenme gibi metrikleri gösterin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Aktif Et</Label>
                    <div className="text-sm text-muted-foreground">İstatistikleri göster/gizle</div>
                  </div>
                  <Switch
                    checked={profileForm.statsEnabled}
                    onCheckedChange={(checked) => setProfileForm({ ...profileForm, statsEnabled: checked })}
                  />
                </div>
                {profileForm.statsEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Toplam Takipçi</Label>
                      <Input
                        value={profileForm.statsFollowers || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, statsFollowers: e.target.value })}
                        placeholder="Örn: 50K"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Toplam Görüntülenme</Label>
                      <Input
                        value={profileForm.statsViews || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, statsViews: e.target.value })}
                        placeholder="Örn: 1M"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={() => updateProfile.mutate(profileForm)} disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4 mr-2" /> Kaydet
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sayfa Düzeni (Layout)</CardTitle>
                <CardDescription>
                  Anasayfa bölümlerinin sırasını, görünürlüğünü ve genişliğini ayarlayın.
                  <br />
                  <span className="text-xs text-muted-foreground">İpucu: İki "Yarım Genişlik" öğeyi arka arkaya koyarak yan yana (side-by-side) görünmelerini sağlayabilirsiniz.</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(profileForm.layoutConfig || []).map((section: any, index: number) => {
                  const getLabel = (id: string) => {
                    switch (id) {
                      case "bio": return "Biyografi Kartı";
                      case "widgets": return "Widget Grubu (Eski)";
                      case "kick": return "Kick Yayını";
                      case "premium": return "Premium İçerik";
                      case "socials": return "Sosyal Medya Linkleri";
                      case "sponsors": return "Sponsorlar";
                      case "games": return "Oyun Kodları";
                      case "contact": return "İletişim Alanı";
                      default: return id;
                    }
                  };

                  const moveUp = () => {
                    if (index === 0) return;
                    const newConfig = [...profileForm.layoutConfig];
                    const temp = newConfig[index - 1];
                    newConfig[index - 1] = newConfig[index];
                    newConfig[index] = temp;
                    setProfileForm({ ...profileForm, layoutConfig: newConfig });
                  };

                  const moveDown = () => {
                    if (index === profileForm.layoutConfig.length - 1) return;
                    const newConfig = [...profileForm.layoutConfig];
                    const temp = newConfig[index + 1];
                    newConfig[index + 1] = newConfig[index];
                    newConfig[index] = temp;
                    setProfileForm({ ...profileForm, layoutConfig: newConfig });
                  };

                  const toggleVisibility = (checked: boolean) => {
                    const newConfig = [...profileForm.layoutConfig];
                    newConfig[index].visible = checked;
                    setProfileForm({ ...profileForm, layoutConfig: newConfig });
                  };

                  const changeWidth = (val: string) => {
                    const newConfig = [...profileForm.layoutConfig];
                    newConfig[index].width = val;
                    setProfileForm({ ...profileForm, layoutConfig: newConfig });
                  }

                  return (
                    <div key={section.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md bg-card/50 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={moveUp} disabled={index === 0}>
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={moveDown} disabled={index === profileForm.layoutConfig.length - 1}>
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                        <span className="font-medium text-sm">{getLabel(section.id)}</span>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                        <div className="flex flex-col items-end gap-1">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Genişlik</Label>
                          <Select value={section.width || "full"} onValueChange={changeWidth}>
                            <SelectTrigger className="w-[110px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">Tam</SelectItem>
                              <SelectItem value="half">Yarım</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Durum</Label>
                          <Switch checked={section.visible} onCheckedChange={toggleVisibility} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
              <CardFooter>
                <Button onClick={() => updateProfile.mutate(profileForm)} disabled={updateProfile.isPending} className="w-full">
                  {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Düzeni ve Ayarları Kaydet
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs >
      </div >
    </div >
  );
}
