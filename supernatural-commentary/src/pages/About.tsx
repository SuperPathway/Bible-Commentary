import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Sparkles, Crown, Users, Zap, Church, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function About() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">About Supernatural</span>
              <br />
              <span className="text-gray-900">Commentary</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unlocking divine revelation and supernatural understanding of God's Word through the lens of Supernatural Revelation
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <Card className="holy-glow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <span>Our Mission</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We provide believers with tools to access deeper spiritual truths in Scripture, bringing Heaven's perspective to everyday life.
                </p>
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                  <p className="text-purple-800 italic font-medium">
                    "Acts was not a historical exception—it is the template for normal Christian living."
                  </p>
                  <p className="text-sm text-purple-600 mt-2">- Founder</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Church className="w-6 h-6 text-purple-600" />
                  <span>Ministry Foundation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Church className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Salvation Centre Ministries – Full Gospel</span>
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <Crown className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Gateway to the Heavenlies</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  We believe every believer has access to supernatural authority. We operate as Heaven's Embassy on earth, offering dual citizenship benefits.
                </p>
                <Link to={createPageUrl('Contact')} className="inline-flex items-center text-purple-800 hover:text-purple-600 font-medium">Contact our ministry →</Link>
              </CardContent>
            </Card>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              <span className="gradient-text">Holy Spirit and the Supernatural Nature of Christ</span>
            </h2>
            <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
              Our core teachings focus on the Supernatural Energy that flows from the glorified Christ, unlocking supernatural authority.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[{ icon: Zap, title: 'Operating from the Heavenly places', desc: 'Access Heaven\'s power' }, { icon: Church, title: 'Heaven\'s Embassy', desc: 'Divine authority in action' }, { icon: Users, title: 'Dual Citizenship', desc: 'Throne room to marketplace' }, { icon: Shield, title: 'Spirit Posture', desc: 'Supernatural Power Blocks' }, { icon: Heart, title: 'Divine Connection', desc: 'Heaven\'s GPS for networks' }, { icon: Crown, title: 'End-Time Bride', desc: 'Ultimate authority for harvest' }].map((item, idx) => (
                <Card key={idx} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-gradient-to-r from-purple-50 to-amber-50 border-2 border-purple-200">
            <CardContent className="text-center p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Experience Supernatural Commentary?</h2>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">Begin your journey into divine revelation and supernatural understanding of God\'s Word.</p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to={createPageUrl('Home')} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center">Try Commentary Now</Link>
                <Link to={createPageUrl('Pricing')} className="bg-white hover:bg-gray-50 text-purple-800 px-8 py-3 rounded-lg font-semibold border-2 border-purple-600 transition-colors inline-flex items-center justify-center">View Plans</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}