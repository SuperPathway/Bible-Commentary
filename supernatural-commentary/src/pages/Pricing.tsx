import React, { useEffect, useState } from 'react';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Star, Zap, Users } from 'lucide-react';

export default function Pricing() {
  const [user, setUser] = useState<any>(null);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    (async () => setUser(await User.me()))();
  }, []);

  const handleSelectPlan = async (plan: string) => {
    const current = await User.me();
    if (!current) {
      await User.login();
      setUser(await User.me());
      return;
    }
    if (plan === 'free') {
      await User.updateMyUserData({ subscription_plan: 'free', usage_count: 0 });
      setUser((prev: any) => ({ ...prev, subscription_plan: 'free', usage_count: 0 }));
      return;
    }
    const confirmed = window.confirm(`Subscribe to ${plan}?`);
    if (confirmed) {
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + (isYearly ? 12 : 1));
      await User.updateMyUserData({ subscription_plan: plan as any, subscription_end: subscriptionEnd.toISOString(), payment_status: 'active', usage_count: 0 });
      setUser((prev: any) => ({ ...prev, subscription_plan: plan, subscription_end: subscriptionEnd.toISOString(), payment_status: 'active', usage_count: 0 }));
      alert(`Successfully subscribed to ${plan} plan!`);
    }
  };

  const plans = [
    { name: 'Free', price: 0, yearlyPrice: 0, description: 'Start your spiritual journey', features: ['3 Free Commentary Uses (One-off)', 'Access to All 8 Modules', 'Community Support'], color: 'gray', icon: Users },
    { name: 'Basic', price: 19, yearlyPrice: 15, description: 'For the growing believer', features: ['20 Uses per Month', 'Access to All 8 Modules', 'Email Support'], color: 'purple', icon: Zap },
    { name: 'Standard', price: 39, yearlyPrice: 31, description: 'For deeper study & ministry', features: ['45 Uses per Month', 'Access to All 8 Modules', 'Priority Support', 'Monthly Webinars'], color: 'blue', icon: Star, popular: true },
    { name: 'Pro', price: 99, yearlyPrice: 79, description: 'For ministry professionals', features: ['110 Uses per Month', 'Access to All 8 Modules', '1-on-1 Consultations', 'Early Access'], color: 'amber', icon: Crown },
  ];

  const colorClasses: any = {
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', button: 'bg-gray-600 hover:bg-gray-700', badge: 'bg-gray-100 text-gray-800' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', button: 'bg-purple-600 hover:bg-purple-700', badge: 'bg-purple-100 text-purple-800' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', button: 'bg-blue-600 hover:bg-blue-700', badge: 'bg-blue-100 text-blue-800' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', button: 'bg-amber-600 hover:bg-amber-700', badge: 'bg-amber-100 text-amber-800' },
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Choose Your</span>
              <br />
              <span className="text-gray-900">Spiritual Journey</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">Unlock deeper supernatural insights with our premium plans</p>
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
              <button onClick={() => setIsYearly(!isYearly)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isYearly ? 'bg-purple-600' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>Yearly</span>
              {isYearly && <Badge className="bg-green-100 text-green-800 ml-2">Save 20%</Badge>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => {
              const colors = colorClasses[plan.color];
              const Icon = plan.icon as any;
              const currentPrice = isYearly ? plan.yearlyPrice : plan.price;
              const isCurrentPlan = user?.subscription_plan === plan.name.toLowerCase();
              return (
                <Card key={plan.name} className={`relative flex flex-col ${colors.bg} ${colors.border} ${plan.popular ? 'ring-2 ring-blue-500 ring-offset-2' : ''} hover:shadow-lg transition-shadow`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors.badge}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                    <div className="mt-4">
                      <div className="text-4xl font-bold text-gray-900">
                        ${currentPrice}
                        {plan.price > 0 && (
                          <span className="text-lg font-normal text-gray-500">/{isYearly ? 'year' : 'month'}</span>
                        )}
                      </div>
                      {isYearly && plan.price > 0 && (
                        <div className="text-sm text-gray-500 line-through">${plan.price}/month</div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 flex-grow flex flex-col">
                    <ul className="space-y-3 mb-6 flex-grow">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => handleSelectPlan(plan.name.toLowerCase())} className={`w-full mt-auto ${colors.button} text-white`} disabled={isCurrentPlan}>
                      {isCurrentPlan ? 'Current Plan' : `Choose ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}