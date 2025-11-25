import { useState } from 'react';
import { Check, Sparkles, Zap, Crown, X } from 'lucide-react';
import './Pricing.css';
import Footer from "../../../components/Footer";
import EmptyNavbar from "../../../components/EmptyNavbar";
import Box from '@mui/material/Box';

export default function Pricing() {
  const plans = {
    free: {
      name: 'Free',
      icon: Sparkles,
      price: { monthly: 0 },
      description: 'Perfect for getting started',
      gradientColors: { from: '#9ca3af', to: '#6b7280' }
    },
    pro: {
      name: 'Pro',
      icon: Zap,
      price: { monthly: 1.99 },
      description: 'For serious preparation',
      popular: true,
      gradientColors: { from: '#3b82f6', to: '#9333ea' }
    },
    premium: {
      name: 'Premium',
      icon: Crown,
      price: { monthly: 9.99 },
      description: 'Comprehensive preparation',
      gradientColors: { from: '#9333ea', to: '#ec4899' }
    }
  };

  const comparisonData = [
    { feature: 'Ads', free: false, pro: true, premium: true },
    { feature: 'Extra Tools & Analysis', free: false, pro: false, premium: true },
    { feature: 'Daily Interviews', free: '20 (watch ads)', pro: '20', premium: 'Unlimited' },
    { feature: 'Session Retention', free: '30 days', pro: 'Forever', premium: 'Forever' },
  ];

  return (
    <Box>
        <EmptyNavbar/>
        <Box sx={{ minHeight: '100dvh' }}>
            <div className="PricingPlan-container">
            {/* Header */}
            <div className="PricingPlan-header">
                <h1 className="PricingPlan-title">Choose Your Plan</h1>
                <p className="PricingPlan-subtitle">
                Unlock your interview potential with the perfect plan for your goals
                </p>
            </div>

            {/* Plan Cards */}
            <div className="PricingPlan-cardsContainer">
                {Object.entries(plans).map(([key, plan]) => {
                const Icon = plan.icon;
                return (
                    <div
                    key={key}
                    className={`PricingPlan-card ${plan.popular ? 'PricingPlan-popularCard' : ''}`}
                    >
                    {plan.popular && (
                        <div className="PricingPlan-popularBadge">
                        <Sparkles size={14} style={{ marginRight: '4px' }} />
                        Most Popular
                        </div>
                    )}
                    
                    <div className="PricingPlan-cardHeader">
                        <div 
                        className="PricingPlan-iconWrapper"
                        style={{
                            background: `linear-gradient(135deg, ${plan.gradientColors.from} 0%, ${plan.gradientColors.to} 100%)`
                        }}
                        >
                        <Icon size={28} color="white" />
                        </div>
                        <h3 className="PricingPlan-planName">{plan.name}</h3>
                        <p className="PricingPlan-planDescription">{plan.description}</p>
                        
                        <div className="PricingPlan-priceContainer">
                        <span className="PricingPlan-currency">$</span>
                        <span className="PricingPlan-price">{plan.price.monthly}</span>
                        <span className="PricingPlan-period">/month</span>
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>

            {/* Comparison Table */}
            <div className="PricingPlan-comparisonSection">
                <h2 className="PricingPlan-comparisonTitle">Compare Plans</h2>
                <div className="PricingPlan-tableWrapper">
                <table className="PricingPlan-table">
                    <thead>
                    <tr>
                        <th className="PricingPlan-tableHeaderFirst">Feature</th>
                        <th className="PricingPlan-tableHeader">Free</th>
                        <th className="PricingPlan-tableHeader PricingPlan-popularColumn">Pro</th>
                        <th className="PricingPlan-tableHeader">Premium</th>
                    </tr>
                    </thead>
                    <tbody>
                    {comparisonData.map((row, i) => (
                        <tr key={i}>
                        <td className="PricingPlan-tableFeature">{row.feature}</td>
                        <td className="PricingPlan-tableCell">
                            {typeof row.free === 'boolean' ? (
                            row.free ? <Check size={20} color="#10b981" /> : <X size={20} color="#ef4444"/>
                            ) : row.free}
                        </td>
                        <td className="PricingPlan-tableCell PricingPlan-popularColumn">
                            {typeof row.pro === 'boolean' ? (
                            row.pro ? <Check size={20} color="#10b981" /> : <X size={20} color="#ef4444" />
                            ) : row.pro}
                        </td>
                        <td className="PricingPlan-tableCell">
                            {typeof row.premium === 'boolean' ? (
                            row.premium ? <Check size={20} color="#10b981" /> : <X size={20} color="#ef4444" />
                            ) : row.premium}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
                </div>
                <div style={{marginTop: '35px'}}>
                    <Footer position="static" textColor="black" backgroundColor="#F3F1EA" />
                </div>
            </div>
        </Box>
    </Box>
  );
}