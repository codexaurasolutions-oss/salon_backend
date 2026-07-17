import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Mail, Phone, MapPin, Loader2, FileText, CheckCircle2, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";

export default function PublicInvoicePage() {
  const { id } = useParams();
  const ownerEmail = "noamskin@gmail.com";
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://salonbackend-production-c623.up.railway.app/api';
        const res = await fetch(`${VITE_API_BASE_URL}/bookings/${id}/invoice`);
        if (!res.ok) throw new Error("Invoice not found or could not be loaded.");
        const data = await res.json();
        
        if (data.invoice?.pdfUrl) {
          window.location.replace(data.invoice.pdfUrl);
          return;
        }

        setInvoice(data.invoice);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0b]">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0b] p-4">
        <Card className="max-w-md w-full border-0 shadow-lg text-center">
          <CardContent className="pt-12 pb-12">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Invoice Not Found</h2>
            <p className="text-muted-foreground">{error || "The requested invoice could not be located."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaid = invoice.status === 'paid' || invoice.status === 'completed';

  return (
    <div className="min-h-screen pb-12 pt-6 px-4 sm:px-6 bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto">
        <Card className="border-0 shadow-2xl overflow-hidden bg-white">
          <div className="h-2 w-full bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37]" />
          
          <CardContent className="p-6 sm:p-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-12">
              <div>
                <img 
                  src={logo}
                  alt="Noamskin Logo"
                  className="h-10 sm:h-12 object-contain mb-6"
                />
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-slate-900">INVOICE</h1>
                <p className="text-slate-500 font-mono">{invoice.id}</p>
              </div>
              
              <div className="text-left sm:text-right space-y-2">
                {isPaid ? (
                  <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 px-4 py-1.5 text-sm font-bold uppercase tracking-widest mb-4">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Paid
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/20 text-amber-700 bg-amber-500/10 px-4 py-1.5 text-sm font-bold uppercase tracking-widest mb-4">
                    Pending
                  </Badge>
                )}
                
                <div className="flex items-center sm:justify-end gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(invoice.date), "MMMM d, yyyy")}
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12 p-6 rounded-xl bg-white border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">From</p>
                <p className="font-bold text-lg text-slate-900 mb-2">{invoice.salon.name}</p>
                <div className="space-y-1.5 text-sm text-slate-500">
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Setia Alam, Malaysia</p>
                  <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {ownerEmail}</p>
                  <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {invoice.salon.phone || '+60 12-345 6789'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Bill To</p>
                <p className="font-bold text-lg text-slate-900 mb-2">{invoice.customer}</p>
                <div className="space-y-1.5 text-sm text-slate-500">
                  {invoice.customerEmail && <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {invoice.customerEmail}</p>}
                  {invoice.customerPhone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {invoice.customerPhone}</p>}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-12 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 font-semibold w-full">Description</th>
                    <th className="py-3 px-4 font-semibold text-right">Qty</th>
                    <th className="py-3 pl-4 font-semibold text-right min-w-[120px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(() => {
                    let items = [];
                    if (invoice.notes && invoice.notes.includes('ITEMS: {')) {
                      try {
                        const jsonStr = invoice.notes.substring(invoice.notes.indexOf('ITEMS: ') + 7);
                        const parsed = JSON.parse(jsonStr);
                        if (parsed.items && Array.isArray(parsed.items)) {
                          items = parsed.items;
                        }
                      } catch (e) {}
                    }
                    if (items.length === 0) {
                      items = [{
                        name: invoice.service,
                        price: invoice.subtotal,
                        quantity: 1,
                        staff: invoice.staff,
                        type: 'service'
                      }];
                    }
                    return items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-4">
                          <p className="font-bold text-slate-900 text-base">{item.name}</p>
                          <p className="text-slate-500 text-xs mt-1 capitalize">{item.type === 'service' ? `Specialist: ${(!item.staff || item.staff === 'N/A' || item.staff === 'na' || !invoice.staff || invoice.staff === 'N/A' || invoice.staff === 'na') ? '-' : invoice.staff}` : 'Product'}</p>
                        </td>
                        <td className="py-4 px-4 text-right text-slate-500">{item.quantity}</td>
                        <td className="py-4 pl-4 text-right font-medium text-slate-900">MYR {(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex flex-col items-end gap-3 max-w-sm ml-auto">
              {invoice.discount > 0 && (
                <div className="flex justify-between w-full text-sm text-red-500">
                  <span>Discount</span>
                  <span>- MYR {invoice.discount.toFixed(2)}</span>
                </div>
              )}
              
              {invoice.coinsUsed > 0 && (
                <div className="flex justify-between w-full text-sm text-amber-500">
                  <span>Coins Redeemed ({invoice.coinsUsed})</span>
                  <span>- MYR {invoice.coinValue.toFixed(2)}</span>
                </div>
              )}

              <div className="h-px w-full bg-slate-200 my-2" />
              
              <div className="flex justify-between w-full items-center">
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-3xl font-black text-[#d4af37]">
                  MYR {invoice.amount.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between w-full text-sm text-slate-500 mt-2">
                <span>Payment Method</span>
                <span className="font-medium text-slate-900 capitalize">{invoice.paymentMethod}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
              <p className="mb-2">Thank you for choosing Noam Skin.</p>
              <p>For any inquiries regarding this invoice, please contact us at {ownerEmail}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
