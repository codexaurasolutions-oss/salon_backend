import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";
import { useSearchParams } from "react-router-dom";
import {
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Smartphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/admin/AdminLayout";
import api from "@/services/api";
import { format } from "date-fns";
import { formatCompactNumber } from "@/lib/utils";

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  salon_name: string;
  customer_name: string;
  booking_id: string;
  created_at: string;
  processed_at: string | null;
  platform_fee: number;
  salon_payout: number;
  salon_email?: string;
  salon_address?: string;
  salon_phone?: string;
}

export default function AdminPaymentsEnhanced() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const handleDownloadPDF = () => {
    if (!selectedPayment) return;
    window.print();
    toast({ title: "Generating PDF", description: "Printing dialog opened for invoice " + selectedPayment.id });
  };

  const handleSendNotify = (type: 'sms' | 'whatsapp') => {
    if (!selectedPayment) return;
    const phone = selectedPayment.salon_phone || "";
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      toast({ title: "No Phone Number", description: "Salon does not have a phone number saved.", variant: "destructive" });
      return;
    }
    const message = `Hello, your platform invoice for ${selectedPayment.salon_name} is ready. ID: ${selectedPayment.id}, Amount: MYR ${selectedPayment.amount}.`;
    const encodedMsg = encodeURIComponent(message);
    const url = type === 'whatsapp' ? `https://wa.me/${cleanPhone}?text=${encodedMsg}` : `sms:${cleanPhone}?body=${encodedMsg}`;
    window.open(url, '_blank');
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getAllPayments();

      const paymentData: PaymentData[] = data.map((p: any) => ({
        id: p.id,
        amount: Number(p.amount),
        currency: 'MYR',
        status: p.status,
        payment_method: p.payment_method || 'System',
        salon_name: p.salon_name || p.salon?.name || 'Unknown Salon',
        customer_name: p.salon_name || p.salon?.name || 'System Generated',
        salon_email: p.salon_email || p.salon?.email || '',
        salon_address: p.salon_address || p.salon?.address || '',
        salon_phone: p.salon_phone || p.salon?.phone || '',
        booking_id: '',
        created_at: p.created_at,
        processed_at: p.paid_at || p.created_at,
        platform_fee: Number(p.amount), // For subscriptions, it's 100% revenue
        salon_payout: 0,
      }));

      setPayments(paymentData);
    } catch (error) {
      console.error("Local payment sync failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.salon_name.toLowerCase().includes(searchTerm.toLowerCase()) || p.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight">Financial Treasury</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Platform-wide MySQL Transactions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-white">MYR {totalRevenue}</p>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Settled Revenue</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm bg-white rounded-3xl p-6 flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Net Platform Revenue</p>
              <p className="text-2xl font-black text-slate-900">MYR {formatCompactNumber(totalRevenue)}</p>
            </div>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-3xl p-6 flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Settled Transactions</p>
              <p className="text-2xl font-black text-slate-900">{formatCompactNumber(payments.filter(p => p.status === 'completed').length)}</p>
            </div>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-3xl p-6 flex items-center gap-6">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-white tracking-widest">In-Progress Volume</p>
              <p className="text-2xl font-black text-slate-900">MYR {formatCompactNumber(payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0))}</p>
            </div>
          </Card>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
            <Input
              placeholder="Audit transactions by Saloon or Client..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-14 h-16 bg-white border-none shadow-sm rounded-2xl font-medium text-black"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 h-16 bg-white border-none rounded-2xl shadow-sm font-bold text-black">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Global Feed</SelectItem>
              <SelectItem value="completed">Settled</SelectItem>
              <SelectItem value="pending">Escrow</SelectItem>
              <SelectItem value="failed">Reverted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-black text-slate-900 h-14 px-8">TRANSACTION</TableHead>
                  <TableHead className="font-black text-slate-900">GROSS</TableHead>
                  <TableHead className="font-black text-slate-900">SALOON</TableHead>
                  <TableHead className="font-black text-slate-900">FEE</TableHead>
                  <TableHead className="font-black text-slate-900">STATUS</TableHead>
                  <TableHead className="font-black text-slate-900 text-right px-8">TIMESTAMP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map(p => (
                  <TableRow key={p.id} className="hover:bg-slate-50 transition-colors border-slate-50">
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 hover:bg-slate-200"
                          onClick={() => { setSelectedPayment(p); setShowDetailDialog(true); }}
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                        </Button>
                        <div>
                          <p className="font-black text-slate-900 text-xs tracking-tighter bg-slate-100 px-3 py-1 rounded-full inline-block">{p.id}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{p.customer_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-black text-slate-900 text-lg">MYR {p.amount}</p>
                    </TableCell>
                    <TableCell className="font-bold text-slate-600">
                      {p.salon_name}
                    </TableCell>
                    <TableCell className="font-black text-amber-600 text-sm">
                      - MYR {p.platform_fee}
                    </TableCell>
                    <TableCell>
                      {p.status === 'completed' ? (
                        <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1 font-bold">SETTLED</Badge>
                      ) : p.status === 'pending' ? (
                        <Badge className="bg-amber-50 text-amber-600 border-none px-4 py-1 font-bold">ESCROW</Badge>
                      ) : (
                        <Badge className="bg-red-50 text-red-600 border-none px-4 py-1 font-bold">FAILED</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <p className="text-xs font-black text-slate-900">{format(new Date(p.created_at), "MMM dd, yyyy")}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(p.created_at), "HH:mm")}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invoice Detail Dialog */}
        <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
          <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 rounded-2xl sm:rounded-[2rem] border-none shadow-2xl bg-white text-slate-900">
            <DialogHeader className="sr-only">
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>Invoice breakdown for selected transaction</DialogDescription>
            </DialogHeader>
            
            {selectedPayment && (
              <>
                <div id={`invoice-${selectedPayment.id}`} className="bg-white p-4 sm:p-10 relative print:p-8 w-full overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-[100px] -z-10 hidden sm:block" />
                  
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-10 print:mb-8 border-b border-slate-100 pb-6">
                    <div className="flex flex-col">
                      <img src={logo} alt="Noamskin Logo" className="h-8 sm:h-10 mb-3 sm:mb-4 w-auto object-contain object-left" />
                      <div className="space-y-0.5 text-xs sm:text-sm text-slate-500">
                        <p className="font-bold text-slate-800">Noamskin Platform HQ</p>
                        <p>Kuala Lumpur, Malaysia</p>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter mb-1">Invoice</h2>
                      <p className="font-mono font-bold text-slate-500 uppercase tracking-widest text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-md inline-block">#{selectedPayment.id?.substring(0, 8)}</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-400 mt-2">{format(new Date(selectedPayment.created_at || new Date()), "MMM dd, yyyy")}</p>
                    </div>
                  </div>

                  {/* From / Bill To Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                    <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100/80">
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1.5">From</p>
                      <p className="text-base font-black text-slate-900 mb-0.5">Noamskin</p>
                      <p className="text-xs sm:text-sm font-medium text-slate-600">noamskin@gmail.com</p>
                    </div>
                    <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100/80">
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1.5">Bill to</p>
                      <p className="text-base font-black text-slate-900 mb-0.5">{selectedPayment.salon_name}</p>
                      <p className="text-xs sm:text-sm font-medium text-slate-600 break-all">{selectedPayment.salon_email}</p>
                      <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">{selectedPayment.salon_address}</p>
                    </div>
                  </div>

                  {/* Description & Amount Breakout */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-6">
                    <div className="bg-[#1A1A1A] text-white font-bold uppercase tracking-widest text-[10px] px-4 py-3 flex justify-between items-center">
                      <span>Description</span>
                      <span className="text-right">Amount</span>
                    </div>
                    <div className="p-4 bg-white flex justify-between items-center gap-3 text-xs sm:text-sm font-medium text-slate-900 border-t border-slate-100">
                      <div className="pr-2 max-w-[65%] sm:max-w-none">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">Subscription / Processing Fee</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 break-all">Ref ID: {selectedPayment.id}</p>
                      </div>
                      <div className="text-right font-black text-slate-900 text-sm sm:text-base whitespace-nowrap bg-slate-100 px-3 py-1.5 rounded-lg">
                        MYR {selectedPayment.amount}
                      </div>
                    </div>
                  </div>

                  {/* Subtotal & Total Summary */}
                  <div className="flex justify-end pt-2 mb-2">
                    <div className="w-full sm:w-72 space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                      <div className="flex justify-between items-center font-medium text-xs sm:text-sm text-slate-600">
                        <span>Subtotal</span>
                        <span className="font-bold text-slate-900">RM {selectedPayment.amount}</span>
                      </div>
                      <div className="h-px bg-slate-200 my-1" />
                      <div className="flex justify-between items-center text-sm sm:text-lg font-black text-slate-900">
                        <span>Total</span>
                        <span className="text-slate-900 font-black">RM {selectedPayment.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 sm:p-6 bg-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 rounded-b-2xl sm:rounded-b-3xl print:hidden border-t border-slate-200/60">
                  <Button variant="ghost" onClick={() => setShowDetailDialog(false)} className="rounded-xl font-bold h-11 sm:h-10 text-slate-600 hover:bg-slate-200">Close</Button>
                  <Button variant="outline" onClick={handleDownloadPDF} className="rounded-xl font-bold border-slate-300 bg-white text-slate-800 h-11 sm:h-10 hover:bg-slate-50">
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </Button>
                  <Button onClick={() => handleSendNotify('whatsapp')} className="bg-accent text-white font-black rounded-xl px-6 h-11 sm:h-10 shadow-lg shadow-accent/20">
                    <Smartphone className="w-4 h-4 mr-2" /> WhatsApp Salon
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body > * {
            display: none !important;
          }
          body > div[data-radix-portal] {
            display: block !important;
            position: relative !important;
            width: 100% !important;
          }
          div[data-state="open"], div[class*="fixed"], div[class*="Overlay"] {
            background: none !important;
            backdrop-filter: none !important;
          }
          div[role="dialog"] {
            position: absolute !important;
            transform: none !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            display: block !important;
            overflow: visible !important;
            max-height: none !important;
          }
          .print-only {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 2cm !important;
            background: white !important;
          }
          .print\\:hidden, button, [role="button"] {
            display: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
