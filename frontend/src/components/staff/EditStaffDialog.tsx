import { useState, useEffect, useRef } from "react";
import { Loader2, Save, X, UserCog, Info, UploadCloud, ImageIcon, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { countryCodes } from "@/utils/countryCodes";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { StaffMember } from "@/types/staff";

interface EditStaffDialogProps {
    staff: StaffMember;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    canEditRole?: boolean;
}

export function EditStaffDialog({ staff, isOpen, onClose, onSuccess, canEditRole = false }: EditStaffDialogProps) {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [allServices, setAllServices] = useState<any[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const getPhoneData = (phone: string | null) => {
        if (!phone) return { code: "Malaysia-+60", number: "" };
        const matchedCode = countryCodes
            .filter(c => phone.startsWith(c.code))
            .sort((a, b) => b.code.length - a.code.length)[0];

        if (matchedCode) {
            return { code: `${matchedCode.country}-${matchedCode.code}`, number: phone.slice(matchedCode.code.length) };
        }
        return { code: "Malaysia-+60", number: phone.replace(/^\+/, "") };
    };

    const initialPhone = getPhoneData(staff.phone);

    const [formData, setFormData] = useState({
        name: staff.display_name,
        email: staff.email || "",
        phone: initialPhone.number,
        countryCode: initialPhone.code,
        role: (staff.role || "staff") as "staff",
        commission: staff.commission_percentage?.toString() || "0",
        specializations: Array.isArray(staff.specializations)
            ? staff.specializations.join(", ")
            : (staff.specializations || ""),
        avatar_url: staff.avatar_url || "",
        is_active: staff.is_active,
        password: "",
        assigned_services: staff.assigned_services || []
    });
    const [showPassword, setShowPassword] = useState(false);

    const fetchServices = async () => {
        if (!staff.salon_id) return;
        setLoadingServices(true);
        try {
            const data = await api.services.getBySalon(staff.salon_id);
            setAllServices(data);
        } catch (error) {
            console.error("Failed to fetch services", error);
        } finally {
            setLoadingServices(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchServices();
        }
    }, [isOpen, staff.salon_id]);

    useEffect(() => {
        const phone = getPhoneData(staff.phone);
        setFormData({
            name: staff.display_name,
            email: staff.email || "",
            phone: phone.number,
            countryCode: phone.code,
            role: (staff.role || "staff") as "staff",
            commission: staff.commission_percentage?.toString() || "0",
            specializations: Array.isArray(staff.specializations)
                ? staff.specializations.join(", ")
                : (staff.specializations || ""),
            avatar_url: staff.avatar_url || "",
            is_active: staff.is_active,
            password: "",
            assigned_services: staff.assigned_services || []
        });
        setShowPassword(false);
    }, [staff]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        setUploading(true);
        try {
            const result = await api.uploads.upload(file);
            setFormData(prev => ({ ...prev, avatar_url: result.url }));
            toast({ title: "Upload Success", description: "Profile image has been synchronized." });
        } catch (error) {
            toast({ title: "Upload Failed", description: "Could not process image.", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            await uploadFile(file);
        }
    };

    const handleSave = async () => {
        if (!formData.name) return;

        setSaving(true);
        try {
            const dialCode = formData.countryCode.split('-').pop() || "";
            const fullPhone = formData.phone ? `${dialCode}${formData.phone}` : null;
            await api.staff.update(staff.id, {
                display_name: formData.name,
                email: formData.email || null,
                phone: fullPhone,
                specializations: formData.specializations.split(",").map(s => s.trim()).filter(Boolean),
                commission_percentage: parseInt(formData.commission) || 0,
                role: formData.role,
                avatar_url: formData.avatar_url || null,
                is_active: formData.is_active,
                password: formData.password || null,
            });

            // Sync services separately
            await api.staff.syncServices(staff.id, formData.assigned_services);

            toast({
                title: "Dossier Updated",
                description: `Records and service assignments for ${formData.name} have been synchronized.`,
            });

            onSuccess();
            onClose();
        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.message || "Could not update staff records.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl rounded-[2rem] border border-border/50 shadow-2xl p-0 overflow-hidden bg-card group/modal">
                <div className="bg-[#55402f] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <DialogHeader className="relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                                <UserCog className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold tracking-tight uppercase">Update Personnel Registry</DialogTitle>
                                <DialogDescription className="text-white/80 font-medium text-xs mt-1 tracking-widest uppercase">
                                    Modifying records for ID: {staff.id.slice(0, 16).toUpperCase()}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <style gutter-attr="modal-close-override">{`
                        [data-radix-collection-item] button, 
                        .group\\/modal button[aria-label="Close"],
                        button[class*="DialogPrimitive.Close"] {
                            color: white !important;
                            opacity: 1 !important;
                        }
                    `}</style>
                </div>

                <div className="p-10 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto px-1 scrollbar-hide">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-1">Legal Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="h-14 bg-muted/20 border-border/50 rounded-xl font-bold px-5 focus:ring-2 focus:ring-accent/10 transition-all text-foreground placeholder:text-muted-foreground/30"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-role" className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-1">Access Designation</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(v: "staff") => setFormData(prev => ({ ...prev, role: v }))}
                                disabled={!canEditRole}
                            >
                                <SelectTrigger className="h-14 bg-muted/20 border-border/50 rounded-xl font-bold px-5 focus:ring-2 focus:ring-accent/10 transition-all text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border border-border/50 shadow-2xl bg-card">
                                    <SelectItem value="staff" className="font-bold py-3 rounded-xl text-foreground focus:bg-accent/10 cursor-pointer">STAFF MEMBER</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email" className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-1">Registry Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="h-14 bg-muted/20 border-border/50 rounded-xl font-bold px-5 focus:ring-2 focus:ring-accent/10 transition-all text-foreground placeholder:text-muted-foreground/30"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-1">Update Access Pass (Optional)</Label>
                            <div className="relative">
                                <Input
                                    id="edit-password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder="Leave blank to keep current"
                                    className="h-14 bg-muted/20 border-border/50 rounded-xl font-bold px-5 pr-12 focus:ring-2 focus:ring-accent/10 transition-all text-foreground placeholder:text-muted-foreground/30"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-1">Secure Contact</Label>
                            <div className="flex gap-2">
                                <Select
                                    value={formData.countryCode}
                                    onValueChange={(v) => setFormData(prev => ({ ...prev, countryCode: v }))}
                                >
                                    <SelectTrigger className="w-[100px] h-14 bg-muted/20 border-border/50 rounded-xl font-bold px-3 focus:ring-2 focus:ring-accent/10 transition-all text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border border-border/50 shadow-2xl bg-card max-h-[300px]">
                                        {countryCodes.sort((a, b) => a.country.localeCompare(b.country)).map((c) => (
                                            <SelectItem key={`${c.country}-${c.code}`} value={`${c.country}-${c.code}`} className="font-bold py-3 rounded-lg cursor-pointer text-foreground hover:bg-muted transition-colors">
                                                <span className="flex items-center gap-2">
                                                    <span>{c.flag}</span>
                                                    <span>{c.code}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    id="edit-phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '') }))}
                                    className="h-14 bg-muted/20 border-border/50 rounded-xl font-bold px-5 flex-1 focus:ring-2 focus:ring-accent/10 transition-all text-foreground placeholder:text-muted-foreground/30"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 md:col-span-2 pt-4 border-t border-border/30">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-1">Assigned Services</Label>
                            {loadingServices ? (
                                <div className="flex items-center gap-2 p-4 justify-center bg-muted/20 rounded-xl border border-border/50">
                                    <Loader2 className="w-5 h-5 animate-spin text-accent" />
                                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Loading Matrix...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                                    {allServices.map((service) => (
                                        <div key={service.id} className="flex items-center space-x-3 p-4 rounded-xl bg-muted/10 border border-border/50 hover:border-accent/30 transition-all">
                                            <Checkbox
                                                id={`edit-service-${service.id}`}
                                                checked={formData.assigned_services.includes(service.id)}
                                                onCheckedChange={(checked) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        assigned_services: checked
                                                            ? [...prev.assigned_services, service.id]
                                                            : prev.assigned_services.filter(id => id !== service.id)
                                                    }));
                                                }}
                                                className="border-border/50"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <Label
                                                    htmlFor={`edit-service-${service.id}`}
                                                    className="text-xs font-black text-foreground/90 uppercase cursor-pointer block truncate"
                                                >
                                                    {service.name}
                                                </Label>
                                                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest truncate">{service.category || 'General'}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {allServices.length === 0 && (
                                        <div className="col-span-2 text-center py-10 bg-muted/10 rounded-2xl border border-dashed border-border/50">
                                            <p className="text-xs font-bold text-muted-foreground/40 uppercase">No services registered in this salon's matrix</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 md:col-span-2 pt-4 border-t border-border/30">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-1">Profile Intelligence (Avatar)</Label>

                            <div className="flex gap-6">
                                <div
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-32 h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group
                                        ${isDragging ? 'border-accent bg-accent/5 scale-105 ring-4 ring-accent/10' : formData.avatar_url ? 'border-accent/50' : 'border-border/50 hover:border-accent/30 bg-muted/20'}`}
                                >
                                    {uploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-6 h-6 text-accent animate-spin" />
                                            <span className="text-[8px] font-bold text-accent uppercase">Syncing...</span>
                                        </div>
                                    ) : formData.avatar_url ? (
                                        <>
                                            <img src={formData.avatar_url} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <UploadCloud className="w-6 h-6 text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center mb-2 group-hover:bg-accent/10 group-hover:scale-110 transition-all">
                                                {isDragging ? <UploadCloud className="w-5 h-5 text-accent animate-bounce" /> : <ImageIcon className="w-5 h-5 text-muted-foreground/40 group-hover:text-accent" />}
                                            </div>
                                            <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-tighter">{isDragging ? 'Release Now' : 'Import Asset'}</span>
                                        </>
                                    )}
                                    {isDragging && (
                                        <div className="absolute inset-0 bg-accent/10 backdrop-blur-[1px] flex items-center justify-center border-2 border-dashed border-accent">
                                            <UploadCloud className="w-8 h-8 text-accent animate-bounce" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-commission" className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-1">Commission Protocol (%)</Label>
                            <Input
                                id="edit-commission"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.commission}
                                onChange={(e) => setFormData(prev => ({ ...prev, commission: e.target.value }))}
                                className="h-14 bg-muted/20 border-border/50 rounded-xl font-bold px-5 focus:ring-2 focus:ring-accent/10 transition-all text-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-status" className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-1">Duty Status</Label>
                            <Select
                                value={formData.is_active ? "active" : "inactive"}
                                onValueChange={(v) => setFormData(prev => ({ ...prev, is_active: v === "active" }))}
                            >
                                <SelectTrigger className="h-14 bg-muted/20 border-border/50 rounded-xl font-bold px-5 focus:ring-2 focus:ring-accent/10 transition-all text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border border-border/50 shadow-2xl bg-card">
                                    <SelectItem value="active" className="font-bold py-3 rounded-xl text-emerald-400 focus:bg-accent/10 cursor-pointer">ACTIVE DUTY</SelectItem>
                                    <SelectItem value="inactive" className="font-bold py-3 rounded-xl text-rose-400 focus:bg-accent/10 cursor-pointer">LOGGED OFF (INACTIVE)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="edit-specs" className="text-[10px] font-black uppercase tracking-[0.2em] text-accent ml-1">Operational Skills (Comma Separated)</Label>
                            <Input
                                id="edit-specs"
                                placeholder="Hair Styling, Skin Specialist..."
                                value={formData.specializations}
                                onChange={(e) => setFormData(prev => ({ ...prev, specializations: e.target.value }))}
                                className="h-14 bg-muted/20 border-border/50 rounded-xl font-bold px-5 focus:ring-2 focus:ring-accent/10 transition-all text-foreground placeholder:text-muted-foreground/30"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-4 pt-6 mt-4 border-t border-border/30 sm:flex-row">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={onClose}
                            className="h-14 px-8 rounded-xl font-black text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all flex-1 uppercase tracking-widest text-xs"
                        >
                            Abort
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={!formData.name || saving}
                            className="h-14 px-10 bg-accent hover:bg-accent/90 text-white font-black rounded-xl shadow-lg shadow-accent/20 flex-[2] transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {saving ? "Synchronizing..." : "Update Dossier"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
