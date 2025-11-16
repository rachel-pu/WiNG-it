import { useState, useEffect } from 'react';
import { ref, get, update } from "firebase/database";
import { database, createCheckoutSession, cancelSubscription } from '../../../lib/firebase.jsx';
import { Check, Zap, Crown, Sparkles, AlertCircle, CheckCircle, X } from 'lucide-react';
import { STRIPE_CONFIG } from '../../../config/stripe';
import "./SettingsPlan.css";

export default function SettingsPlan() {
    const [error, setError] = useState('');
    const [isChangingPlan, setIsChangingPlan] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        subscription: {
            tier: 'free',
            billingCycle: 'monthly',
            startDate: '',
            renewalDate: '',
            status: 'active'
        }
    });
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'confirm', // 'confirm' or 'alert'
        title: '',
        message: '',
        icon: null,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: null,
        onCancel: null
    });

    // Helper functions for modal
    const showConfirm = (title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', icon = 'alert') => {
        setModal({
            isOpen: true,
            type: 'confirm',
            title,
            message,
            icon,
            confirmText,
            cancelText,
            onConfirm,
            onCancel: () => setModal(prev => ({ ...prev, isOpen: false }))
        });
    };

    const showAlert = (title, message, icon = 'success') => {
        setModal({
            isOpen: true,
            type: 'alert',
            title,
            message,
            icon,
            confirmText: 'OK',
            onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
            onCancel: null
        });
    };

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
            if (!formData.userId || !formData.subscription.tier) return;

            // Map old plan names to new ones
            const planMigrations = {
                'enterprise': 'premium'
            };

            const oldPlan = formData.subscription.tier;
            const newPlan = planMigrations[oldPlan] || oldPlan;

            // If plan doesn't exist in our plans object, migrate to free
            if (!plans[newPlan]) {
                try {
                    await update(ref(database, `users/${formData.userId}/subscription`), {
                        tier: 'free'
                    });
                    setFormData(prev => ({
                        ...prev,
                        subscription: {
                            ...prev.subscription,
                            tier: 'free'
                        }
                    }));
                } catch (err) {
                    console.error('Error migrating plan:', err);
                }
            } else if (oldPlan !== newPlan) {
                // Migrate to mapped plan
                try {
                    await update(ref(database, `users/${formData.userId}/subscription`), {
                        tier: newPlan
                    });
                    setFormData(prev => ({
                        ...prev,
                        subscription: {
                            ...prev.subscription,
                            tier: newPlan
                        }
                    }));
                } catch (err) {
                    console.error('Error migrating plan:', err);
                }
            }
        };
        migrateOldPlan();
    }, [formData.userId, formData.subscription.tier]);

    const handleChangePlan = async (newPlan) => {
        if (newPlan === formData.subscription.tier) return;

        // Downgrade to free - no payment required
        if (newPlan === 'free') {
            showConfirm(
                'Downgrade to Free Plan',
                'Are you sure you want to downgrade to the Free plan? You will lose access to premium features.',
                async () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    setIsChangingPlan(true);
                    try {
                        // Cancel the existing subscription through Firebase Function
                        await cancelSubscription({ userId: formData.userId });

                        setFormData(prev => ({
                            ...prev,
                            subscription: {
                                ...prev.subscription,
                                tier: 'free',
                                status: 'cancelled'
                            }
                        }));

                        showAlert('Subscription Downgraded', 'Your subscription will be downgraded to Free at the end of your billing period.', 'success');
                    } catch (err) {
                        console.error('Error downgrading plan:', err);
                        showAlert('Downgrade Failed', 'Failed to downgrade plan. Please try again.', 'error');
                    } finally {
                        setIsChangingPlan(false);
                    }
                },
                'Downgrade',
                'Cancel',
                'alert'
            );
            return;
        }

        // Upgrade to paid plan - requires Stripe checkout
        const currentBillingCycle = formData.subscription.billingCycle || 'monthly';
        showConfirm(
            `Upgrade to ${plans[newPlan].name}`,
            `Upgrade to ${plans[newPlan].name} for $${plans[newPlan].price[currentBillingCycle]}/${currentBillingCycle === 'monthly' ? 'month' : 'year'}?`,
            async () => {
                setModal(prev => ({ ...prev, isOpen: false }));
                setIsChangingPlan(true);
                try {
                    // Get the Stripe Price ID based on plan and billing cycle
                    const priceId = STRIPE_CONFIG.prices[newPlan][currentBillingCycle];

                    if (!priceId) {
                        throw new Error('Price ID not configured for this plan');
                    }

                    // Create Stripe checkout session
                    const result = await createCheckoutSession({
                        userId: formData.userId,
                        priceId: priceId,
                        planName: newPlan
                    });

                    const { url } = result.data;

                    // Redirect to Stripe checkout
                    window.location.href = url;

                } catch (err) {
                    console.error('Error upgrading plan:', err);
                    showAlert('Upgrade Failed', 'Failed to start checkout. Please try again.', 'error');
                    setIsChangingPlan(false);
                }
            },
            'Upgrade',
            'Cancel',
            'alert'
        );
    };

    const handleCancelSubscription = async () => {
        showConfirm(
            'Cancel Subscription',
            'Are you sure you want to cancel your subscription? You will keep access until the end of your billing period.',
            async () => {
                setModal(prev => ({ ...prev, isOpen: false }));
                try {
                    await cancelSubscription({ userId: formData.userId });

                    setFormData(prev => ({
                        ...prev,
                        subscription: {
                            ...prev.subscription,
                            tier: 'free',
                            status: 'cancelled'
                        }
                    }));

                    showAlert('Subscription Cancelled', 'Your subscription has been cancelled. You will keep access until the end of your billing period.', 'success');
                } catch (err) {
                    console.error('Error cancelling subscription:', err);
                    showAlert('Cancellation Failed', 'Failed to cancel subscription. Please try again.', 'error');
                }
            },
            'Cancel Subscription',
            'Keep Subscription',
            'alert'
        );
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

    const currentPlan = plans[formData.subscription.tier]
        ? formData.subscription.tier
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
                                    {isCurrentPlan ? 'Selected' : planKey === 'free' ? 'Downgrade' : 'Upgrade'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Custom Modal */}
            {modal.isOpen && (
                <div className="SettingsPlan-modal-overlay" onClick={modal.onCancel}>
                    <div className="SettingsPlan-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="SettingsPlan-modal-close" onClick={modal.onCancel}>
                            <X size={20} />
                        </button>

                        <div className="SettingsPlan-modal-icon">
                            {modal.icon === 'success' && <CheckCircle size={48} className="icon-success" />}
                            {modal.icon === 'error' && <AlertCircle size={48} className="icon-error" />}
                            {modal.icon === 'alert' && <AlertCircle size={48} className="icon-alert" />}
                        </div>

                        <h3 className="SettingsPlan-modal-title">{modal.title}</h3>
                        <p className="SettingsPlan-modal-message">{modal.message}</p>

                        <div className="SettingsPlan-modal-buttons">
                            {modal.type === 'confirm' && (
                                <>
                                    <button
                                        className="SettingsPlan-modal-btn-secondary"
                                        onClick={modal.onCancel}
                                    >
                                        {modal.cancelText}
                                    </button>
                                    <button
                                        className="SettingsPlan-modal-btn-primary"
                                        onClick={modal.onConfirm}
                                    >
                                        {modal.confirmText}
                                    </button>
                                </>
                            )}
                            {modal.type === 'alert' && (
                                <button
                                    className="SettingsPlan-modal-btn-primary"
                                    onClick={modal.onConfirm}
                                >
                                    {modal.confirmText}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
