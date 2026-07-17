import { CheckCircle2 } from "lucide-react";

export const ApprovedBadge = () => (
    <div className="bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md border border-slate-100/50">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#b07d62] fill-[#b07d62]/5" strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-widest text-[#1A2338]">
            Approved
        </span>
    </div>
);
