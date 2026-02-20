import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@shared/schema";

export function AdminContactPage() {
    const { toast } = useToast();

    const { data: profile } = useQuery<Profile>({
        queryKey: ["/api/profile"],
    });

    const [contactForm, setContactForm] = useState({
        contactEmail: "",
        contactPhone: "",
        contactAddress: "",
    });

    useEffect(() => {
        if (profile) {
            setContactForm({
                contactEmail: (profile as any).contactEmail || "",
                contactPhone: (profile as any).contactPhone || "",
                contactAddress: (profile as any).contactAddress || "",
            });
        }
    }, [profile]);

    const updateProfile = useMutation({
        mutationFn: (data: Partial<Profile>) => apiRequest("PUT", "/api/admin/profile", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
            toast({ title: "İletişim bilgileri güncellendi" });
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">İletişim</h1>
                <p className="text-muted-foreground">İletişim bilgilerinizi yönetin</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>İletişim Bilgileri</CardTitle>
                    <CardDescription>Ziyaretçilerin sizinle iletişime geçmesi için bilgiler</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="email">E-posta Adresi</Label>
                        <div className="relative mt-2">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                value={contactForm.contactEmail}
                                onChange={(e) => setContactForm({ ...contactForm, contactEmail: e.target.value })}
                                placeholder="ornek@email.com"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="phone">Telefon Numarası</Label>
                        <div className="relative mt-2">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="phone"
                                type="tel"
                                value={contactForm.contactPhone}
                                onChange={(e) => setContactForm({ ...contactForm, contactPhone: e.target.value })}
                                placeholder="+90 555 123 4567"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="address">Adres</Label>
                        <div className="relative mt-2">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Textarea
                                id="address"
                                value={contactForm.contactAddress}
                                onChange={(e) => setContactForm({ ...contactForm, contactAddress: e.target.value })}
                                placeholder="Şehir, Ülke"
                                rows={3}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <Button onClick={() => updateProfile.mutate(contactForm)} disabled={updateProfile.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Kaydet
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sosyal Medya İletişim</CardTitle>
                    <CardDescription>Sosyal medya hesaplarınız üzerinden de iletişime geçilebilir</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Sosyal medya linklerinizi <strong>Sosyal Medya</strong> sayfasından yönetebilirsiniz.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
