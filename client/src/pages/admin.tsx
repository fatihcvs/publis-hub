import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Save, LogOut, ArrowLeft, Pencil, X, ChevronUp, ChevronDown, Upload, Loader2 } from "lucide-react";
import { Link } from "wouter";
import type { Profile, SocialLink, Sponsor, DiscountCode } from "@shared/schema";

export default function Admin() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({ name: "", title: "", bio: "", avatarUrl: "" });
  const [newLink, setNewLink] = useState({ platform: "", url: "", followerCount: "", badge: "", description: "" });
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
        name: profile.name || "",
        title: profile.title || "",
        bio: profile.bio || "",
        avatarUrl: profile.avatarUrl || "",
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
      setNewLink({ platform: "", url: "", followerCount: "", badge: "", description: "" });
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
      const { platform, url, followerCount, badge, description } = data.updates;
      const sanitized = {
        platform,
        url,
        followerCount: followerCount || undefined,
        badge: badge || undefined,
        description: description || undefined,
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

        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div>
              <Label>Bio</Label>
              <Textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Kısa açıklama"
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
            <Button onClick={() => updateProfile.mutate(profileForm)} disabled={updateProfile.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Kaydet
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
              <Button 
                onClick={() => createLink.mutate({
                  ...newLink,
                  followerCount: newLink.followerCount || undefined,
                  badge: newLink.badge || undefined,
                  description: newLink.description || undefined,
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
      </div>
    </div>
  );
}
