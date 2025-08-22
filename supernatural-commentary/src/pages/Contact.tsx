import React, { useState } from 'react';
import { ContactMessage } from '@/entities/ContactMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitted(false);
    setSubmissionError(null);
    try {
      await ContactMessage.create(formData as any);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmissionError('There was an error sending your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Get in Touch</span>
            </h1>
            <p className="text-xl text-gray-600">Prayer, questions, testimonies—send us a note.</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">Thank you for your message! We'll get back to you soon.</AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submissionError && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{submissionError}</AlertDescription>
                    </Alert>
                  )}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className="border-2 border-gray-300 focus:border-purple-500" placeholder="Full name" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="border-2 border-gray-300 focus:border-purple-500" placeholder="email@example.com" />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                    <Textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={6} className="border-2 border-gray-300 focus:border-purple-500 resize-none" placeholder="Share your thoughts, questions, or testimonies..." />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-semibold">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}