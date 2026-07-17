import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('booking_id');
    const statusId = searchParams.get('status_id'); // ToyyibPay might append this

    useEffect(() => {
        // We could technically verify status here again via API
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#F3EEEA]">
            <Navbar />

            <main className="container mx-auto px-4 max-w-3xl pt-32 pb-20 text-center">
                <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-[#1A1A1A]/5 mt-10">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>

                    <h1 className="text-4xl font-['DM_Serif_Display'] text-[#1A1A1A] mb-4">Payment Successful!</h1>
                    <p className="text-xl text-slate-500 font-medium mb-2">
                        Your transaction has been processed successfully.
                    </p>

                    {bookingId && (
                        <div className="inline-block mt-4 px-6 py-2 bg-slate-50 rounded-full border border-slate-100">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mr-2">Reference:</span>
                            <span className="text-sm font-black text-slate-900">#{bookingId}</span>
                        </div>
                    )}

                    <div className="mt-12 p-8 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-left space-y-4">
                        <p className="text-sm text-slate-500 leading-relaxed italic">
                            Your session has been logged in our system. We have sent a confirmation email with all the details of your appointment.
                        </p>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-tight">
                            <Calendar className="w-4 h-4" />
                            <span>Check your dashboard for details</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                        <Button asChild className="h-14 px-8 rounded-full bg-[#1A1A1A] text-white hover:bg-black font-bold text-lg">
                            <Link to="/my-bookings" className="flex items-center gap-2">
                                View My Bookings <ArrowRight className="w-5 h-5" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-14 px-8 rounded-full border-slate-200 text-[#1A1A1A] font-bold text-lg hover:bg-slate-50">
                            <Link to="/">Return Home</Link>
                        </Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PaymentSuccess;
