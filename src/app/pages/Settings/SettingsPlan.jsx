import { useState, useEffect } from 'react';
import { ref, get, update } from "firebase/database";
import { database } from '../../../lib/firebase.jsx';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import "./SettingsPlan.css";

export default function SettingsPlan() {
    const [error, setError] = useState('');
    const [isChangingPlan, setIsChangingPlan] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        subscription: {
            currentPlan: 'pro',
            billingCycle: 'monthly',
            startDate: '2025-09-26',
            renewalDate: '2025-11-26',
            status: 'active'
        }
    });

    const plans = {
        free: {
            name: 'Free',
            icon: Sparkles,
            price: { monthly: 0, annual: 0 },
            description: 'Perfect for getting started',
            features: [
                'Unlimited interviews',
                'Ads supported',
                'Sessions deleted after 30 days',
                'Manual session deletion available'
            ]
        },
        pro: {
            name: 'Pro',
            icon: Zap,
            price: { monthly: 1.99, annual: 19.99 },
            description: 'For serious interview prep',
            features: [
                'Unlimited interviews',
                'No ads',
                'Sessions deleted after 30 days',
                'Manual session deletion available'
            ],
            popular: true
        },
        premium: {
            name: 'Premium',
            icon: Crown,
            price: { monthly: 4.99, annual: 49.99 },
            description: 'For comprehensive preparation',
            features: [
                'Unlimited interviews',
                'No ads',
                'Keep all interviews forever',
                'Extra tools and deeper analysis',
                'Manual session deletion available'
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

    // Auto-migrate old plan names to new ones
    useEffect(() => {
        const migrateOldPlan = async () => {
            if (!formData.userId || !formData.subscription.currentPlan) return;

            // Map old plan names to new ones
            const planMigrations = {
                'enterprise': 'premium'
            };

            const oldPlan = formData.subscription.currentPlan;
            const newPlan = planMigrations[oldPlan] || oldPlan;

            // If plan doesn't exist in our plans object, migrate to free
            if (!plans[newPlan]) {
                try {
                    await update(ref(database, `users/${formData.userId}/subscription`), {
                        currentPlan: 'free'
                    });
                    setFormData(prev => ({
                        ...prev,
                        subscription: {
                            ...prev.subscription,
                            currentPlan: 'free'
                        }
                    }));
                } catch (err) {
                    console.error('Error migrating plan:', err);
                }
            } else if (oldPlan !== newPlan) {
                // Migrate to mapped plan
                try {
                    await update(ref(database, `users/${formData.userId}/subscription`), {
                        currentPlan: newPlan
                    });
                    setFormData(prev => ({
                        ...prev,
                        subscription: {
                            ...prev.subscription,
                            currentPlan: newPlan
                        }
                    }));
                } catch (err) {
                    console.error('Error migrating plan:', err);
                }
            }
        };
        migrateOldPlan();
    }, [formData.userId, formData.subscription.currentPlan]);

    const handleChangePlan = async (newPlan) => {
        if (newPlan === formData.subscription.currentPlan) return;

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
        } catch (err) {
            console.error('Error changing plan:', err);
        } finally {
            setIsChangingPlan(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Are you sure you want to cancel your subscription?')) return;

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
        } catch (err) {
            console.error('Error cancelling subscription:', err);
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
        }
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    const currentPlan = plans[formData.subscription.currentPlan]
        ? formData.subscription.currentPlan
        : 'free';
    const billingCycle = formData.subscription.billingCycle;

    return (
        <div className="SettingsPlan-content">
            {/* Current Plan */}
            <div className="SettingsPlan-field-row">
                <label className="SettingsPlan-field-label">Current Plan</label>
                <div className="SettingsPlan-field-input-wrapper">
                    <div className="SettingsPlan-current-plan">
                        <span className="plan-name-large">{plans[currentPlan].name}</span>
                        {formData.subscription.status === 'cancelled' && (
                            <span className="SettingsPlan-cancelled-badge">Cancelled</span>
                        )}
                        <span className="plan-price-large">
                            ${plans[currentPlan].price[billingCycle]}
                            <span className="price-period-small">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Billing Cycle */}
            <div className="SettingsPlan-field-row">
                <label className="SettingsPlan-field-label">Billing Cycle</label>
                <div className="SettingsPlan-field-input-wrapper">
                    <div className="SettingsPlan-billing-toggle">
                        <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
                        <label className="SettingsPlan-toggle-switch">
                            <input
                                type="checkbox"
                                checked={billingCycle === 'annual'}
                                onChange={handleToggleBillingCycle}
                            />
                            <span className="SettingsPlan-toggle-slider"></span>
                        </label>
                        <span className={billingCycle === 'annual' ? 'active' : ''}>
                            Annual <span className="SettingsPlan-save-badge">Save 17%</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Start Date */}
            <div className="SettingsPlan-field-row">
                <label className="SettingsPlan-field-label">Start Date</label>
                <div className="SettingsPlan-field-input-wrapper">
                    <div className="SettingsPlan-field-display">
                        {formData.subscription.startDate}
                    </div>
                </div>
            </div>

            {/* Next Renewal */}
            <div className="SettingsPlan-field-row">
                <label className="SettingsPlan-field-label">
                    {formData.subscription.status === 'cancelled' ? 'Access Until' : 'Next Renewal'}
                </label>
                <div className="SettingsPlan-field-input-wrapper">
                    <div className="SettingsPlan-field-display">
                        {formData.subscription.renewalDate}
                    </div>
                </div>
            </div>

            {/* Cancel Subscription */}
            {currentPlan !== 'free' && formData.subscription.status !== 'cancelled' && (
                <div className="SettingsPlan-field-row">
                    <label className="SettingsPlan-field-label"></label>
                    <div className="SettingsPlan-field-input-wrapper">
                        <button
                            onClick={handleCancelSubscription}
                            className="SettingsPlan-btn-cancel-subscription"
                        >
                            Cancel Subscription
                        </button>
                    </div>
                </div>
            )}

            {/* Available Plans Section */}
            <div className="SettingsPlan-section">
                <h3 className="SettingsPlan-section-title">Available Plans</h3>
                <div className="SettingsPlan-plans-grid">
                    {Object.entries(plans).map(([planKey, plan]) => {
                        const Icon = plan.icon;
                        const isCurrentPlan = planKey === currentPlan;

                        return (
                            <div
                                key={planKey}
                                className={`SettingsPlan-plan-card ${isCurrentPlan ? 'current' : ''} ${plan.popular ? 'popular' : ''}`}
                            >
                                {plan.popular && (
                                    <div className="SettingsPlan-popular-badge">Most Popular</div>
                                )}

                                <div className="SettingsPlan-plan-header">
                                    <Icon className="SettingsPlan-plan-icon" size={32} />
                                    <h4>{plan.name}</h4>
                                    <p className="SettingsPlan-plan-description">{plan.description}</p>
                                </div>

                                <div className="SettingsPlan-plan-price">
                                    <span className="price-amount">
                                        ${plan.price[billingCycle]}
                                    </span>
                                    <span className="price-period">
                                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                                    </span>
                                </div>

                                <div className="SettingsPlan-plan-features">
                                    {plan.features.map((feature, index) => (
                                        <div key={index} className="SettingsPlan-feature-item">
                                            <Check size={16} className="feature-check" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleChangePlan(planKey)}
                                    disabled={isCurrentPlan || isChangingPlan}
                                    className={`SettingsPlan-plan-button ${isCurrentPlan ? 'current-plan-button' : ''}`}
                                >
                                    {isCurrentPlan ? 'Current Plan' : planKey === 'free' ? 'Downgrade' : 'Upgrade'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
