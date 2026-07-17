import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Send, Loader2 } from "lucide-react";

/**
 * 📧 TEST EMAIL PAGE
 * Exercises the migrated Node mail endpoint.
 */
const TestEmail = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        to: "amanajeetthakur644@gmail.com",
        subject: "Test Email from Localhost",
        message: "Hello! This is a test email sent from the migrated React + Node environment."
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://salonbackend-production-c623.up.railway.app/api";
            const response = await fetch(`${apiBaseUrl}/mail/test`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to: formData.to,
                    subject: formData.subject,
                    body: formData.message,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success("Email sent successfully! Check your inbox.");
            } else {
                toast.error(result.error || "Failed to send email.");
            }
        } catch (error) {
            console.error("Mail Error:", error);
            toast.error("Network error. Make sure your Node backend is running on port 5000.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-indigo-500">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                        <Mail className="text-indigo-600" size={24} />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Email Route Tester
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                        Sends a test request through the Node mail endpoint
                    </p>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">To (Recipient)</label>
                            <Input
                                type="email"
                                placeholder="recipient@example.com"
                                value={formData.to}
                                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject</label>
                            <Input
                                placeholder="Email Subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message Body</label>
                            <Textarea
                                placeholder="Write your test message here..."
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Test Email
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default TestEmail;
