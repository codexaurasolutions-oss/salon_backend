import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Package, Truck, CheckCircle, XCircle, MapPin, Phone, User, Globe, Eye, FileText, Printer } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any>(null);
    const { toast } = useToast();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await api.admin.getOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast({
                title: "Error",
                description: "Failed to load orders.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await api.admin.updateOrderStatus(orderId, newStatus);
            toast({
                title: "Status Updated",
                description: `Order status changed to ${newStatus}.`,
            });
            // Update local state
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Could not update order status.",
                variant: "destructive"
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'placed': return 'bg-yellow-100 text-yellow-800';
            case 'dispatched': return 'bg-blue-100 text-blue-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Manage Orders</h1>
                        <p className="text-slate-400 font-medium">Track and manage customer product orders</p>
                    </div>
                    <Button onClick={fetchOrders} className="bg-white/10 text-white hover:bg-white/20 border-white/10">
                        <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-accent" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-slate-700">
                        <Package className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                        <h3 className="text-xl font-bold text-white">No orders found</h3>
                        <p className="text-slate-400">Orders placed by customers will appear here.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="p-6">Order ID</th>
                                        <th className="p-6">Customer</th>
                                        <th className="p-6">Items</th>
                                        <th className="p-6">Amount</th>
                                        <th className="p-6">Date</th>
                                        <th className="p-6">Status</th>
                                        <th className="p-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-6 font-mono text-xs text-slate-500">#{order.id.substring(0, 8)}...</td>
                                            <td className="p-6">
                                                <div
                                                    className="font-bold text-[#1A1A1A] cursor-pointer hover:text-accent transition-colors flex items-center gap-2 group"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    {order.customer_name}
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-accent opacity-0 group-hover:opacity-100 transition-all" />
                                                </div>
                                                <div className="text-xs text-slate-400">{order.customer_email}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="space-y-1">
                                                    {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="text-sm text-slate-600">
                                                            {item.quantity}x {item.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-6 font-bold text-emerald-600">RM {parseFloat(order.total_amount).toFixed(2)}</td>
                                            <td className="p-6 text-sm text-slate-500">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-6">
                                                <Badge className={`${getStatusColor(order.status)} border-none capitalize px-3 py-1`}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-10 w-10 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-full"
                                                        onClick={() => setSelectedInvoiceOrder(order)}
                                                        title="View Invoice"
                                                    >
                                                        <FileText className="w-5 h-5" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-10 w-10 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-full"
                                                        onClick={() => setSelectedOrder(order)}
                                                        title="View Client Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </Button>
                                                    <Select
                                                        value={order.status}
                                                        onValueChange={(val) => handleStatusChange(order.id, val)}
                                                    >
                                                        <SelectTrigger className="w-[160px] h-10 bg-white border-slate-200 text-slate-800 font-bold rounded-full shadow-sm hover:border-accent/50 hover:shadow-md transition-all duration-200">
                                                            <SelectValue placeholder="Update Status" />
                                                        </SelectTrigger>
                                                    <SelectContent className="rounded-xl p-1">
                                                        <SelectItem value="placed" className="rounded-lg focus:bg-slate-50 my-1 cursor-pointer">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                                                                    <Package className="w-3.5 h-3.5 text-amber-600" />
                                                                </div>
                                                                <span className="font-bold text-slate-700">Placed</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="dispatched" className="rounded-lg focus:bg-slate-50 my-1 cursor-pointer">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                                                                </div>
                                                                <span className="font-bold text-slate-700">Dispatched</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="delivered" className="rounded-lg focus:bg-slate-50 my-1 cursor-pointer">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                                </div>
                                                                <span className="font-bold text-slate-700">Delivered</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="cancelled" className="rounded-lg focus:bg-slate-50 my-1 cursor-pointer">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                                                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                                                                </div>
                                                                <span className="font-bold text-slate-700">Cancelled</span>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                    </Select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden bg-white border-none shadow-2xl">
                    <div className="bg-slate-50 p-6 border-b border-slate-100">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-accent" />
                                Shipping Details
                            </DialogTitle>
                            <DialogDescription className="text-slate-500">
                                Delivery information for Order #{selectedOrder?.id?.substring(0, 8)}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {selectedOrder && selectedOrder.shipping_address ? (
                        <div className="p-6 space-y-6">
                            <div className="grid gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recipient</p>
                                        <p className="font-semibold text-slate-900 text-lg">
                                            {selectedOrder.customer_name}
                                        </p>
                                        <p className="text-slate-500 text-sm">{selectedOrder.customer_email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</p>
                                        <p className="font-medium text-slate-900">
                                            {selectedOrder.shipping_address?.phone || selectedOrder.customer_phone || selectedOrder.phone || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Address</p>
                                        <p className="font-medium text-slate-900 leading-relaxed">
                                            {selectedOrder.shipping_address.address}
                                            {selectedOrder.shipping_address.apartment && <>, {selectedOrder.shipping_address.apartment}</>}
                                        </p>
                                        <p className="text-slate-600">
                                            {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postalCode || selectedOrder.shipping_address.zip}
                                        </p>
                                        {selectedOrder.shipping_address.country && (
                                            <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-sm">
                                                <Globe className="w-3.5 h-3.5" />
                                                {selectedOrder.shipping_address.country}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mt-2">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-500 text-sm">Order Status</span>
                                    <Badge className={`${getStatusColor(selectedOrder.status)} border-none capitalize`}>
                                        {selectedOrder.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-sm">Total Amount</span>
                                    <span className="font-bold text-slate-900">RM {parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-10 text-center">
                            <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No shipping address provided for this order.</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={!!selectedInvoiceOrder} onOpenChange={(open) => !open && setSelectedInvoiceOrder(null)}>
                <DialogContent className="w-[95vw] sm:w-full sm:max-w-[680px] max-h-[90vh] overflow-y-auto rounded-2xl p-0 bg-white border-none shadow-2xl mx-auto">
                    <style>{`
                        @media print {
                            @page { margin: 0; size: auto; }
                            body { background: white !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                            body > * { display: none !important; }
                            body > div[data-radix-portal] { display: block !important; position: relative !important; width: 100% !important; }
                            div[data-state="open"], div[class*="fixed"], div[class*="Overlay"] { background: none !important; backdrop-filter: none !important; }
                            div[role="dialog"] { position: absolute !important; transform: none !important; left: 0 !important; top: 0 !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; background: white !important; box-shadow: none !important; border: none !important; display: block !important; overflow: visible !important; max-height: none !important; }
                            .print\\:hidden, button, [role="button"] { display: none !important; }
                            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-shadow: none !important; text-shadow: none !important; }
                            #print-invoice { margin: 0 !important; padding: 2cm !important; width: 100% !important; background: white !important; }
                        }
                    `}</style>
                    <div id="print-invoice" className="p-5 sm:p-8 bg-white">
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                            <div>
                                <img
                                    src={logo}
                                    alt="Noamskin"
                                    className="h-8 object-contain mb-3"
                                />
                                <p className="text-xs text-slate-500">Setia Alam, Malaysia</p>
                                <p className="text-xs text-slate-500">noamskin@gmail.com</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">INVOICE</h1>
                                <p className="text-xs font-mono text-slate-400 mt-1">#{selectedInvoiceOrder?.id?.substring(0, 8).toUpperCase()}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {selectedInvoiceOrder ? new Date(selectedInvoiceOrder.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                                </p>
                                <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-bold uppercase ${
                                    selectedInvoiceOrder?.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                    selectedInvoiceOrder?.status === 'dispatched' ? 'bg-blue-100 text-blue-700' :
                                    selectedInvoiceOrder?.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                    'bg-amber-100 text-amber-700'
                                }`}>{selectedInvoiceOrder?.status}</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-200 mb-6" />

                        {/* From / Bill To */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">From</p>
                                <p className="font-bold text-slate-900">Noam Skin</p>
                                <p className="text-sm text-slate-500">noamskin@gmail.com</p>
                                <p className="text-sm text-slate-500">Setia Alam, Malaysia</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 break-all">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Bill To</p>
                                <p className="font-bold text-slate-900">{selectedInvoiceOrder?.customer_name || 'N/A'}</p>
                                <p className="text-sm text-slate-500">{selectedInvoiceOrder?.customer_email || 'N/A'}</p>
                                {selectedInvoiceOrder?.shipping_address?.phone && (
                                    <p className="text-sm text-slate-500">{selectedInvoiceOrder.shipping_address.phone}</p>
                                )}
                                {selectedInvoiceOrder?.shipping_address?.address && (
                                    <p className="text-sm text-slate-500 mt-1">
                                        {selectedInvoiceOrder.shipping_address.address}
                                        {selectedInvoiceOrder.shipping_address.city && `, ${selectedInvoiceOrder.shipping_address.city}`}
                                        {selectedInvoiceOrder.shipping_address.state && `, ${selectedInvoiceOrder.shipping_address.state}`}
                                        {selectedInvoiceOrder.shipping_address.postalCode && ` ${selectedInvoiceOrder.shipping_address.postalCode}`}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="rounded-xl overflow-hidden border border-slate-200 mb-6">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-900 text-white">
                                        <th className="px-5 py-3 font-bold uppercase text-xs tracking-wider">Item</th>
                                        <th className="px-5 py-3 font-bold uppercase text-xs tracking-wider text-center hidden sm:table-cell">Qty</th>
                                        <th className="px-5 py-3 font-bold uppercase text-xs tracking-wider text-right hidden sm:table-cell">Price</th>
                                        <th className="px-5 py-3 font-bold uppercase text-xs tracking-wider text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInvoiceOrder?.items?.map((item: any, idx: number) => (
                                        <>
                                            <tr key={`item-${idx}`} className="border-t border-slate-100">
                                                <td className="px-5 py-4 font-semibold text-slate-800">{item.name}</td>
                                                <td className="px-5 py-4 text-center text-slate-600 hidden sm:table-cell">{item.quantity}</td>
                                                <td className="px-5 py-4 text-right text-slate-600 hidden sm:table-cell">RM {parseFloat(item.price || 0).toFixed(2)}</td>
                                                <td className="px-5 py-4 text-right font-bold text-slate-900">RM {(item.quantity * item.price).toFixed(2)}</td>
                                            </tr>
                                            {/* Mobile row for qty/price */}
                                            <tr key={`mobile-${idx}`} className="sm:hidden border-t border-slate-50 bg-slate-50/50">
                                                <td className="px-5 py-2 text-xs text-slate-400" colSpan={2}>
                                                    Qty: <span className="font-medium text-slate-600">{item.quantity}</span>
                                                    &nbsp;·&nbsp; Price: <span className="font-medium text-slate-600">RM {parseFloat(item.price || 0).toFixed(2)}</span>
                                                </td>
                                            </tr>
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-start sm:justify-end mb-8 w-full">
                            <div className="w-full sm:w-64 bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-2">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Subtotal</span>
                                    <span>RM {parseFloat(selectedInvoiceOrder?.total_amount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Shipping</span>
                                    <span className="text-emerald-600 font-medium">Free</span>
                                </div>
                                <div className="h-px bg-slate-200 my-1" />
                                <div className="flex justify-between font-black text-slate-900">
                                    <span>Total</span>
                                    <span className="text-lg">RM {parseFloat(selectedInvoiceOrder?.total_amount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="h-px bg-slate-200 mb-4" />
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <p className="text-xs text-slate-400">Thank you for your order! — Noamskin</p>
                            <p className="text-xs text-slate-400">noamskin@gmail.com</p>
                        </div>
                    </div>

                    {/* Print Button - hidden on print */}
                    <div className="flex flex-wrap justify-end gap-3 px-5 sm:px-8 py-4 bg-slate-50 border-t border-slate-100 print:hidden">
                        <Button variant="ghost" onClick={() => setSelectedInvoiceOrder(null)} className="rounded-xl font-bold text-slate-600 w-full sm:w-auto">Close</Button>
                        <Button onClick={() => window.print()} className="rounded-xl bg-slate-900 hover:bg-black text-white font-bold px-6 w-full sm:w-auto">
                            <Printer className="w-4 h-4 mr-2" /> Print Invoice
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminOrdersPage;
