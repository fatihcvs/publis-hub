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
import { Trash2, Plus, Save, LogOut, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Profile, SocialLink, Sponsor, DiscountCode } from "@shared/schema";

export default function Admin() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({ name: "", title: "", bio: "", avatarUrl: "" });
  const [newLink, setNewLink] = useState({ platform: "", url: "" });
  const [newSponsor, setNewSponsor] = useState({ name: "", description: "", websiteUrl: "" });
  const [newCode, setNewCode] = useState({ code: "", description: "", discountPercent: "", url: "", sponsorId: "" });

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
    mutationFn: (data: { platform: string; url: string }) => 
      apiRequest("POST", "/api/admin/social-links", { ...data, displayOrder: socialLinks.length, isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
      setNewLink({ platform: "", url: "" });
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

  const createSponsor = useMutation({
    mutationFn: (data: { name: string; description: string; websiteUrl: string }) =>
      apiRequest("POST", "/api/admin/sponsors", { ...data, displayOrder: sponsors.length, isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sponsors"] });
      setNewSponsor({ name: "", description: "", websiteUrl: "" });
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

  const createCode = useMutation({
    mutationFn: (data: { code: string; description: string; discountPercent?: number; url: string; sponsorId?: string }) =>
      apiRequest("POST", "/api/admin/discount-codes", { ...data, displayOrder: discountCodes.length, isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discount-codes"] });
      setNewCode({ code: "", description: "", discountPercent: "", url: "", sponsorId: "" });
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
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Admin Panel</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => logout()}>
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
              <Label>Avatar URL</Label>
              <Input
                value={profileForm.avatarUrl}
                onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                placeholder="https://..."
              />
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
            {socialLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-2 p-2 border rounded-md">
                <span className="flex-1 font-medium">{link.platform}</span>
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">{link.url}</span>
                <Button variant="ghost" size="icon" onClick={() => deleteLink.mutate(link.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
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
              <Button onClick={() => createLink.mutate(newLink)} disabled={!newLink.platform || !newLink.url}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sponsorlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sponsors.map((sponsor) => (
              <div key={sponsor.id} className="flex items-center gap-2 p-2 border rounded-md">
                <span className="flex-1 font-medium">{sponsor.name}</span>
                <Button variant="ghost" size="icon" onClick={() => deleteSponsor.mutate(sponsor.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            <div className="space-y-2">
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
              <Button onClick={() => createSponsor.mutate(newSponsor)} disabled={!newSponsor.name || !newSponsor.websiteUrl}>
                <Plus className="w-4 h-4 mr-2" />
                Sponsor Ekle
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oyun Kodları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {discountCodes.map((code) => (
              <div key={code.id} className="flex items-center gap-2 p-2 border rounded-md">
                <code className="font-mono font-semibold">{code.code}</code>
                <span className="flex-1 text-sm text-muted-foreground">{code.description}</span>
                <Button variant="ghost" size="icon" onClick={() => deleteCode.mutate(code.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            <div className="space-y-2">
              <Input
                value={newCode.code}
                onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                placeholder="Kod"
              />
              <Input
                value={newCode.description}
                onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                placeholder="Açıklama"
              />
              <Input
                value={newCode.discountPercent}
                onChange={(e) => setNewCode({ ...newCode, discountPercent: e.target.value })}
                placeholder="İndirim % (opsiyonel)"
                type="number"
              />
              <Input
                value={newCode.url}
                onChange={(e) => setNewCode({ ...newCode, url: e.target.value })}
                placeholder="Link (opsiyonel)"
              />
              <Button 
                onClick={() => createCode.mutate({
                  ...newCode,
                  discountPercent: newCode.discountPercent ? parseInt(newCode.discountPercent) : undefined,
                  sponsorId: newCode.sponsorId || undefined,
                })} 
                disabled={!newCode.code}
              >
                <Plus className="w-4 h-4 mr-2" />
                Kod Ekle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
