import { useState, useEffect } from 'react';
import { ref, get, update } from "firebase/database";
import { database } from '../../../lib/firebase.jsx';
import Box from '@mui/material/Box';
import DefaultAppLayout from "../../DefaultAppLayout.jsx";
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import "./SettingsPlan.css";

export default function SettingsPlan() {
    const [error, setError] = useState('');
    const [isChangingPlan, setIsChangingPlan] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        subscription: {
            currentPlan: 'pro', // 'free', 'pro', 'enterprise'
            billingCycle: 'monthly', // 'monthly', 'annual'
            startDate: '2025-09-26',
            renewalDate: '2025-11-26',
            status: 'active' // 'active', 'cancelled', 'expired'
        }
    });

    // Plan definitions
    const plans = {
        free: {
            name: 'Free',
            icon: Sparkles,
            price: { monthly: 0, annual: 0 },
            description: 'Perfect for getting started',
            features: [
                'Up to 5 projects',
                'Basic templates',
                'Community support',
                '1 GB storage',
                'Basic analytics'
            ],
            limitations: [
                'Limited features',
                'No priority support'
            ]
        },
        pro: {
            name: 'Pro',
            icon: Zap,
            price: { monthly: 29.99, annual: 299.99 },
            description: 'For professionals and growing teams',
            features: [
                'Unlimited projects',
                'Premium templates',
                'Priority support',
                '50 GB storage',
                'Advanced analytics',
                'Custom branding',
                'API access',
                'Team collaboration (up to 5 members)'
            ],
            popular: true
        },
        enterprise: {
            name: 'Enterprise',
            icon: Crown,
            price: { monthly: 99.99, annual: 999.99 },
            description: 'For large organizations',
            features: [
                'Everything in Pro',
                'Unlimited team members',
                'Dedicated account manager',
                'Unlimited storage',
                'Custom integrations',
                'SLA guarantee',
                'Advanced security',
                'Custom contracts',
                'On-premise deployment option'
            ]
        }
    };

    useEffect(() => {
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };

        const userId = getCookie('user_id');
        if (userId) {
            setFormData((prev) => ({ ...prev, userId }));
        } else {
            console.log('No user_id cookie found');
        }
    }, []);

    useEffect(() => {
        const fetchSubscription = async () => {
            if (!formData.userId) return;
            try {
                const snapshot = await get(ref(database, `users/${formData.userId}/subscription`));
                if (snapshot.exists()) {
                    setFormData(prev => ({
                        ...prev,
                        subscription: snapshot.val()
                    }));
                }
            } catch (err) {
                console.error('Error fetching subscription:', err);
                setError('Failed to fetch subscription data.');
            }
        };
        fetchSubscription();
    }, [formData.userId]);

    const handleChangePlan = async (newPlan) => {
        if (newPlan === formData.subscription.currentPlan) {
            return;
        }

        if (!confirm(`Are you sure you want to ${newPlan === 'free' ? 'downgrade' : 'upgrade'} to ${plans[newPlan].name}?`)) {
            return;
        }

        setIsChangingPlan(true);
        try {
            const today = new Date();
            const renewalDate = new Date(today);
            renewalDate.setMonth(renewalDate.getMonth() + 1);

            await update(ref(database, `users/${formData.userId}/subscription`), {
                currentPlan: newPlan,
                startDate: today.toISOString().split('T')[0],
                renewalDate: renewalDate.toISOString().split('T')[0],
                status: 'active'
            });

            setFormData(prev => ({
                ...prev,
                subscription: {
                    ...prev.subscription,
                    currentPlan: newPlan,
                    startDate: today.toISOString().split('T')[0],
                    renewalDate: renewalDate.toISOString().split('T')[0],
                    status: 'active'
                }
            }));

            alert(`Successfully ${newPlan === 'free' ? 'downgraded' : 'upgraded'} to ${plans[newPlan].name}!`);
        } catch (err) {
            console.error('Error changing plan:', err);
            alert('Failed to change plan.');
        } finally {
            setIsChangingPlan(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing cycle.')) {
            return;
        }

        try {
            await update(ref(database, `users/${formData.userId}/subscription`), {
                status: 'cancelled'
            });

            setFormData(prev => ({
                ...prev,
                subscription: {
                    ...prev.subscription,
                    status: 'cancelled'
                }
            }));

            alert('Subscription cancelled. You will have access until ' + formData.subscription.renewalDate);
        } catch (err) {
            console.error('Error cancelling subscription:', err);
            alert('Failed to cancel subscription.');
        }
    };

    const handleToggleBillingCycle = async () => {
        const newCycle = formData.subscription.billingCycle === 'monthly' ? 'annual' : 'monthly';
        
        try {
            await update(ref(database, `users/${formData.userId}/subscription`), {
                billingCycle: newCycle
            });

            setFormData(prev => ({
                ...prev,
                subscription: {
                    ...prev.subscription,
                    billingCycle: newCycle
                }
            }));
        } catch (err) {
            console.error('Error updating billing cycle:', err);
            alert('Failed to update billing cycle.');
        }
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    const currentPlan = formData.subscription.currentPlan;
    const billingCycle = formData.subscription.billingCycle;

    return (
        <Box>
            <DefaultAppLayout>
                <div className="settings-page">
                    <div className="settings-container">
                        <div className="glass-container">
                            <div className='settings-navbar'>
                                <a href="/settings/profile" className="settings-navlink">Profile</a>
                                <a href="/settings/billings" className="settings-navlink">Billings</a>
                                <a href="/settings/plan" className="settings-navlink">Plan</a>
                                <a href="/settings/notifications" className="settings-navlink">Notifications</a>
                            </div>
                            <h1 className="settings-title-profile">Subscription Plan</h1>

                            <div className="settings-content">
                                {/* Current Plan Card */}
                                <div className="current-plan-card">
                                    <div className="current-plan-header">
                                        <div>
                                            <h2>Current Plan</h2>
                                            <div className="current-plan-name">
                                                {plans[currentPlan].name}
                                                {formData.subscription.status === 'cancelled' && (
                                                    <span className="cancelled-badge">Cancelled</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="current-plan-price">
                                            ${plans[currentPlan].price[billingCycle]}
                                            <span className="price-period">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                        </div>
                                    </div>

                                    <div className="info-row">
                                        <div className="info-row-content">
                                            <div className="info-field">
                                                <label className="info-label">Billing Cycle</label>
                                                <div className="info-value">{billingCycle}</div>
                                            </div>
                                            <div className="billing-toggle">
                                                <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
                                                <label className="toggle-switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={billingCycle === 'annual'}
                                                        onChange={handleToggleBillingCycle}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                                <span className={billingCycle === 'annual' ? 'active' : ''}>
                                                    Annual <span className="save-badge">Save 17%</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="info-row">
                                        <div className="info-row-content">
                                            <div className="info-field">
                                                <label className="info-label">Start Date</label>
                                                <div className="info-value">{formData.subscription.startDate}</div>
                                            </div>
                                            <div className="info-spacer"></div>
                                        </div>
                                    </div>

                                    <div className="info-row info-row-last">
                                        <div className="info-row-content">
                                            <div className="info-field">
                                                <label className="info-label">
                                                    {formData.subscription.status === 'cancelled' ? 'Access Until' : 'Next Renewal'}
                                                </label>
                                                <div className="info-value">{formData.subscription.renewalDate}</div>
                                            </div>
                                            <div className="info-spacer"></div>
                                        </div>
                                    </div>

                                    {currentPlan !== 'free' && formData.subscription.status !== 'cancelled' && (
                                        <div className="cancel-subscription-section">
                                            <button 
                                                onClick={handleCancelSubscription}
                                                className="button-cancel-subscription"
                                            >
                                                Cancel Subscription
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Available Plans */}
                                <div className="plans-section">
                                    <h2>Available Plans</h2>
                                    <div className="plans-grid">
                                        {Object.entries(plans).map(([planKey, plan]) => {
                                            const Icon = plan.icon;
                                            const isCurrentPlan = planKey === currentPlan;
                                            
                                            return (
                                                <div 
                                                    key={planKey} 
                                                    className={`plan-card ${isCurrentPlan ? 'current' : ''} ${plan.popular ? 'popular' : ''}`}
                                                >
                                                    {plan.popular && (
                                                        <div className="popular-badge">Most Popular</div>
                                                    )}
                                                    
                                                    <div className="plan-header">
                                                        <Icon className="plan-icon" size={32} />
                                                        <h3>{plan.name}</h3>
                                                        <p className="plan-description">{plan.description}</p>
                                                    </div>

                                                    <div className="plan-price">
                                                        <span className="price-amount">
                                                            ${plan.price[billingCycle]}
                                                        </span>
                                                        <span className="price-period">
                                                            /{billingCycle === 'monthly' ? 'month' : 'year'}
                                                        </span>
                                                    </div>

                                                    <div className="plan-features">
                                                        {plan.features.map((feature, index) => (
                                                            <div key={index} className="feature-item">
                                                                <Check size={16} className="feature-check" />
                                                                <span>{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <button
                                                        onClick={() => handleChangePlan(planKey)}
                                                        disabled={isCurrentPlan || isChangingPlan}
                                                        className={`plan-button ${isCurrentPlan ? 'current-plan-button' : ''}`}
                                                    >
                                                        {isCurrentPlan ? 'Current Plan' : planKey === 'free' ? 'Downgrade' : 'Upgrade'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Plan Comparison */}
                                <div className="comparison-section">
                                    <h2>Compare Plans</h2>
                                    <div className="comparison-note">
                                        All plans include our core features with different limits and capabilities
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DefaultAppLayout>
        </Box>
    );
}