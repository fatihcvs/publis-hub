import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@shared/schema";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LayoutSection {
    id: string;
    width: "full" | "half";
    visible: boolean;
}

const SECTION_LABELS: Record<string, string> = {
    bio: "Biyografi",
    socials: "Sosyal Medya",
    kick: "Kick Widget",
    lol: "League of Legends",
    sponsors: "Sponsorlar",
    games: "Oyunlar",
    contact: "İletişim",
};

function SortableItem({
    section,
    onToggleVisibility,
    onChangeWidth,
}: {
    section: LayoutSection;
    onToggleVisibility: (id: string) => void;
    onChangeWidth: (id: string, width: "full" | "half") => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors bg-background"
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
            >
                <GripVertical className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="flex-1">
                <div className="font-semibold">{SECTION_LABELS[section.id] || section.id}</div>
                <div className="text-sm text-muted-foreground">ID: {section.id}</div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Label className="text-sm">Genişlik:</Label>
                    <Select
                        value={section.width}
                        onValueChange={(value: "full" | "half") => onChangeWidth(section.id, value)}
                    >
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="full">Tam Genişlik</SelectItem>
                            <SelectItem value="half">Yarım Genişlik</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Label className="text-sm">Görünür:</Label>
                    <Switch
                        checked={section.visible}
                        onCheckedChange={() => onToggleVisibility(section.id)}
                    />
                </div>
            </div>
        </div>
    );
}

export function AdminLayoutPage() {
    const { toast } = useToast();

    const { data: profile } = useQuery<Profile>({
        queryKey: ["/api/profile"],
    });

    const [layoutConfig, setLayoutConfig] = useState<LayoutSection[]>([]);

    useEffect(() => {
        if (profile?.layoutConfig && (profile.layoutConfig as LayoutSection[]).length > 0) {
            setLayoutConfig(profile.layoutConfig as LayoutSection[]);
        } else if (profile !== undefined) {
            // Default layout when no config saved yet
            setLayoutConfig([
                { id: "bio", width: "full", visible: true },
                { id: "socials", width: "full", visible: true },
                { id: "kick", width: "full", visible: true },
                { id: "lol", width: "half", visible: false },
                { id: "sponsors", width: "full", visible: true },
                { id: "games", width: "full", visible: true },
                { id: "contact", width: "full", visible: true },
            ]);
        }
    }, [profile]);


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const updateProfile = useMutation({
        mutationFn: (data: Partial<Profile>) => apiRequest("PUT", "/api/admin/profile", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
            toast({ title: "Layout güncellendi" });
        },
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLayoutConfig((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const toggleVisibility = (id: string) => {
        const updated = layoutConfig.map(section =>
            section.id === id ? { ...section, visible: !section.visible } : section
        );
        setLayoutConfig(updated);
    };

    const changeWidth = (id: string, width: "full" | "half") => {
        const updated = layoutConfig.map(section =>
            section.id === id ? { ...section, width } : section
        );
        setLayoutConfig(updated);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Layout Düzenleyici</h1>
                <p className="text-muted-foreground">Sayfa bölümlerinin sırasını, görünürlüğünü ve genişliğini ayarlayın</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Bölüm Ayarları</CardTitle>
                    <CardDescription>Bölümleri sürükleyerek sıralayın, göster/gizle ve genişliğini ayarlayın</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={layoutConfig.map(s => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {layoutConfig.map((section) => (
                                <SortableItem
                                    key={section.id}
                                    section={section}
                                    onToggleVisibility={toggleVisibility}
                                    onChangeWidth={changeWidth}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </CardContent>
            </Card>

            <Button onClick={() => updateProfile.mutate({ layoutConfig })} disabled={updateProfile.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Layout'u Kaydet
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Önizleme</CardTitle>
                    <CardDescription>Değişiklikleri görmek için ana sayfayı ziyaret edin</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" onClick={() => window.open("/", "_blank")}>
                        Ana Sayfayı Aç
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
