import { useState, useEffect } from 'react';
import { ref, get, update } from "firebase/database";
import { database, createCheckoutSession, cancelSubscription, updateSubscription } from '../../../lib/firebase.jsx';
import { Check, Zap, Crown, Sparkles, AlertCircle, CheckCircle, X } from 'lucide-react';
import { STRIPE_CONFIG } from '../../../config/stripe';
import "./SettingsBillingSubscription.css";

export default function SettingsBillingSubscription() {
    const [error, setError] = useState('');
    const [isChangingPlan, setIsChangingPlan] = useState(false);
    const [billingHistory, setBillingHistory] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
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
        type: 'confirm',
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

    // Check for success/cancel parameters from Stripe redirect
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const canceled = urlParams.get('canceled');

        if (success === 'true') {
            showAlert('Payment Successful!', 'Your subscription has been activated. Thank you for upgrading!', 'success');
            window.history.replaceState({}, '', window.location.pathname + '?tab=plan');
        } else if (canceled === 'true') {
            showAlert('Payment Canceled', 'Your payment was canceled. No charges were made.', 'error');
            window.history.replaceState({}, '', window.location.pathname + '?tab=plan');
        }
    }, []);

    const plans = {
        free: {
            name: 'Free',
            badge: 'FREE',
            badgeColor: '#ef4444',
            icon: Sparkles,
            price: 0,
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
            badge: 'PRO',
            badgeColor: '#f97316',
            icon: Zap,
            price: 1.99,
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
            badge: 'PREMIUM',
            badgeColor: '#10b981',
            icon: Crown,
            price: 4.99,
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
            setIsLoadingSubscription(true);
            try {
                // Search through all tiers to find the user
                const tiersSnapshot = await get(ref(database, 'userTiers'));
                if (tiersSnapshot.exists()) {
                    const tiers = tiersSnapshot.val();
                    let subscriptionData = null;

                    // Find user in any tier
                    for (const [tierName, users] of Object.entries(tiers || {})) {
                        if (users && users[formData.userId]) {
                            subscriptionData = users[formData.userId];
                            break;
                        }
                    }

                    if (subscriptionData) {
                        setFormData(prev => ({
                            ...prev,
                            subscription: subscriptionData
                        }));
                    }
                }
            } catch (err) {
                console.error('Error fetching subscription:', err);
                setError('Failed to fetch subscription data.');
            } finally {
                setIsLoadingSubscription(false);
            }
        };
        fetchSubscription();
    }, [formData.userId]);

    useEffect(() => {
        const fetchBillingHistory = async () => {
            if (!formData.userId) return;
            try {
                // Search through all tiers to find the user
                const tiersSnapshot = await get(ref(database, 'userTiers'));
                if (tiersSnapshot.exists()) {
                    const tiers = tiersSnapshot.val();

                    // Find user in any tier
                    for (const [tierName, users] of Object.entries(tiers || {})) {
                        if (users && users[formData.userId]) {
                            const billingHistory = users[formData.userId].billingHistory;
                            if (billingHistory) {
                                const historyArray = Object.values(billingHistory).sort((a, b) => {
                                    return new Date(b.date) - new Date(a.date);
                                });
                                setBillingHistory(historyArray);
                            }
                            break;
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching billing history:', err);
            }
        };
        fetchBillingHistory();
    }, [formData.userId]);

    // Helper function to parse date in either format (yyyy-mm-dd or mm-dd-yyyy)
    const parseDate = (dateStr) => {
        const parts = dateStr.split('-');
        // Check if first part is a 4-digit year (yyyy-mm-dd) or 2-digit month (mm-dd-yyyy)
        if (parts[0].length === 4) {
            // yyyy-mm-dd format
            return new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
            // mm-dd-yyyy format
            return new Date(parts[2], parts[0] - 1, parts[1]);
        }
    };

    // Helper function to format date consistently as mm-dd-yyyy
    const formatDate = (dateStr) => {
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
            // Convert yyyy-mm-dd to mm-dd-yyyy
            return `${parts[1]}-${parts[2]}-${parts[0]}`;
        }
        // Already in mm-dd-yyyy format
        return dateStr;
    };

    const handleChangePlan = async (newPlan) => {
        // Don't allow changing to the same plan
        if (newPlan === formData.subscription.tier) return;

        // SAFETY CHECK: Ensure subscription data is loaded before proceeding
        // This prevents creating duplicate subscriptions when subscription ID isn't loaded yet
        if (!formData.subscription || !formData.userId) {
            showAlert('Please Wait', 'Loading subscription data. Please try again in a moment.', 'warning');
            return;
        }

        // Define tier hierarchy for comparison
        const tierHierarchy = { free: 0, pro: 1, premium: 2 };
        const currentTier = formData.subscription.tier || 'free';
        const isUpgrade = tierHierarchy[newPlan] > tierHierarchy[currentTier];
        const isDowngrade = tierHierarchy[newPlan] < tierHierarchy[currentTier];

        // Handle downgrade to free
        if (newPlan === 'free') {
            showConfirm(
                'Downgrade to Free Plan',
                `Your ${plans[currentTier].name} plan will remain active until ${formData.subscription.renewalDate || 'the end of your billing period'}. After that, you'll be downgraded to Free.`,
                async () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    setIsChangingPlan(true);
                    try {
                        await cancelSubscription({ userId: formData.userId });

                        // Update local state to reflect pending cancellation
                        setFormData(prev => ({
                            ...prev,
                            subscription: {
                                ...prev.subscription,
                                status: 'pending_cancellation'
                            }
                        }));

                        showAlert(
                            'Downgrade Scheduled',
                            `Your subscription will end on ${formData.subscription.renewalDate || 'the renewal date'}. You'll keep access to ${plans[currentTier].name} features until then.`,
                            'success'
                        );
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

        // Handle downgrade between paid tiers (Premium → Pro)
        if (isDowngrade) {
            showConfirm(
                `Downgrade to ${plans[newPlan].name}`,
                `Your ${plans[currentTier].name} plan will remain active until ${formData.subscription.renewalDate || 'the end of your billing period'}. After that, your subscription will end and you can subscribe to ${plans[newPlan].name}.`,
                async () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    setIsChangingPlan(true);
                    try {
                        await cancelSubscription({
                            userId: formData.userId,
                            pendingTier: newPlan  // Store what they plan to downgrade to
                        });

                        // Update local state to reflect pending cancellation
                        setFormData(prev => ({
                            ...prev,
                            subscription: {
                                ...prev.subscription,
                                status: 'pending_cancellation',
                                pendingTier: newPlan
                            }
                        }));

                        showAlert(
                            'Downgrade Scheduled',
                            `Your ${plans[currentTier].name} plan will end on ${formData.subscription.renewalDate || 'the renewal date'}. You'll keep access to ${plans[currentTier].name} features until then.`,
                            'success'
                        );
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

        // Handle upgrade (Free → Pro, Free → Premium, or Pro → Premium)
        if (isUpgrade) {
            // If user has no active subscription, create new one via checkout
            if (!formData.subscription.stripeSubscriptionId || currentTier === 'free') {
                showConfirm(
                    `Upgrade to ${plans[newPlan].name}`,
                    `Upgrade to ${plans[newPlan].name} for $${plans[newPlan].price}/month?`,
                    async () => {
                        setModal(prev => ({ ...prev, isOpen: false }));
                        setIsChangingPlan(true);
                        try {
                            const priceId = STRIPE_CONFIG.prices[newPlan].monthly;
                            if (!priceId) {
                                throw new Error('Price ID not configured for this plan');
                            }
                            const result = await createCheckoutSession({
                                userId: formData.userId,
                                priceId: priceId,
                                planName: newPlan
                            });
                            const { url } = result.data;
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
            } else {
                // User has active subscription - upgrade immediately with proration
                const priceDifference = (plans[newPlan].price - plans[currentTier].price).toFixed(2);
                showConfirm(
                    `Upgrade to ${plans[newPlan].name}`,
                    `You'll be upgraded to ${plans[newPlan].name} immediately. You'll be charged a prorated amount of approximately $${priceDifference} for the remaining time in your current billing cycle. Your next bill will be $${plans[newPlan].price}/month.`,
                    async () => {
                        setModal(prev => ({ ...prev, isOpen: false }));
                        setIsChangingPlan(true);
                        try {
                            const priceId = STRIPE_CONFIG.prices[newPlan].monthly;
                            if (!priceId) {
                                throw new Error('Price ID not configured for this plan');
                            }
                            await updateSubscription({
                                userId: formData.userId,
                                priceId: priceId,
                                planName: newPlan
                            });

                            // Update local state to reflect the upgrade
                            setFormData(prev => ({
                                ...prev,
                                subscription: {
                                    ...prev.subscription,
                                    tier: newPlan,
                                    status: 'active'
                                }
                            }));

                            showAlert(
                                'Upgrade Successful!',
                                `You've been upgraded to ${plans[newPlan].name}. You now have access to all ${newPlan} features!`,
                                'success'
                            );
                        } catch (err) {
                            console.error('Error upgrading plan:', err);
                            showAlert('Upgrade Failed', 'Failed to upgrade plan. Please try again.', 'error');
                            setIsChangingPlan(false);
                        }
                    },
                    'Upgrade Now',
                    'Cancel',
                    'alert'
                );
            }
        }
    };

    const handleExportHistory = () => {
        // Convert billing history to CSV
        const headers = ['Amount', 'Purchase Date', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredHistory.map(item =>
                [item.amount, formatDate(item.date), item.status].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'billing-history.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Calculate remaining days if subscription is pending cancellation
    const calculateRemainingDays = () => {
        if (!formData.subscription.renewalDate) return null;
        const renewalDate = new Date(formData.subscription.renewalDate);
        const today = new Date();
        const diffTime = renewalDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    // Show loading state while subscription data is being fetched
    if (isLoadingSubscription) {
        return (
            <div className="BillingSubscription-container">
                <div className="BillingSubscription-header">
                    <div className="BillingSubscription-header-text">
                        <h2 className="BillingSubscription-title">Billing & Subscription</h2>
                        <p className="BillingSubscription-subtitle">
                            Loading your subscription...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const currentPlan = plans[formData.subscription.tier] ? formData.subscription.tier : 'free';
    const remainingDays = calculateRemainingDays();
    const isPendingCancellation = formData.subscription.status === 'pending_cancellation';

    // Filter billing history based on date range
    const filteredHistory = billingHistory.filter(item => {
        if (!startDate && !endDate) return true;

        const itemDate = parseDate(item.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && end) {
            return itemDate >= start && itemDate <= end;
        } else if (start) {
            return itemDate >= start;
        } else if (end) {
            return itemDate <= end;
        }
        return true;
    });

    return (
        <div className="BillingSubscription-container">
            {/* Header */}
            <div className="BillingSubscription-header">
                <div className="BillingSubscription-header-text">
                    <h2 className="BillingSubscription-title">Billing & Subscription</h2>
                    <p className="BillingSubscription-subtitle">
                        Choose from our monthly plans and manage your subscription
                    </p>
                </div>
            </div>

            {/* Pending Cancellation Notice */}
            {isPendingCancellation && remainingDays !== null && (
                <div style={{
                    padding: '16px',
                    marginBottom: '24px',
                    backgroundColor: '#FFF4E6',
                    border: '1px solid #FFB020',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <AlertCircle size={24} style={{ color: '#FFB020', flexShrink: 0 }} />
                    <div>
                        <div style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>
                            Subscription Ending Soon
                        </div>
                        <div style={{ color: '#4a4a4a', fontSize: '14px' }}>
                            You have <strong>{remainingDays} day{remainingDays !== 1 ? 's' : ''}</strong> remaining with your {plans[currentPlan].name} plan.
                            Your subscription will end on <strong>{formData.subscription.renewalDate}</strong>
                            {formData.subscription.pendingTier && formData.subscription.pendingTier !== 'free'
                                ? ` and you can then subscribe to the ${plans[formData.subscription.pendingTier]?.name || formData.subscription.pendingTier} plan.`
                                : ` and you'll be moved to the Free tier.`
                            }
                        </div>
                    </div>
                </div>
            )}

            {/* Pricing Cards */}
            <div className="BillingSubscription-plans-grid">
                {Object.entries(plans).map(([planKey, plan]) => {
                    const isPremiumPlan = planKey === 'premium';
                    const isCurrentPlan = planKey === currentPlan;

                    // Determine button text
                    let buttonText = 'Upgrade Plan';
                    if (isCurrentPlan) {
                        buttonText = 'Current Plan';
                    } else if (planKey === 'free') {
                        buttonText = 'Downgrade Plan';
                    }

                    return (
                        <div
                            key={planKey}
                            className={`BillingSubscription-plan-card ${isPremiumPlan ? 'dark' : ''} ${isCurrentPlan ? 'current' : ''}`}
                        >
                            <div className="BillingSubscription-plan-header">
                                <div className="BillingSubscription-plan-name-row">
                                    <span className="BillingSubscription-plan-name">{plan.name} Plan</span>
                                    <span
                                        className="BillingSubscription-plan-badge"
                                        style={{ backgroundColor: plan.badgeColor }}
                                    >
                                        {plan.badge}
                                    </span>
                                </div>
                                <div className="BillingSubscription-plan-price">
                                    <span className="price-currency">$</span>
                                    <span className="price-amount">{typeof plan.price === 'number' ? plan.price.toFixed(2) : '0.00'}</span>
                                    <span className="price-period">/month</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleChangePlan(planKey)}
                                disabled={isCurrentPlan || isChangingPlan}
                                className={`BillingSubscription-plan-button ${isCurrentPlan ? 'current' : ''} ${isPremiumPlan ? 'dark' : ''}`}
                            >
                                {buttonText}
                            </button>

                            <div className="BillingSubscription-plan-features">
                                {plan.features.map((feature, index) => (
                                    <div key={index} className="BillingSubscription-feature-item">
                                        <Check size={16} className="feature-check" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Billing History */}
            <div className="BillingSubscription-history-section">
                <div className="BillingSubscription-history-header">
                    <h3 className="BillingSubscription-history-title">Billing History</h3>
                    <div className="BillingSubscription-history-actions">
                        <div className="BillingSubscription-date-filter">
                            <div className="date-input-group">
                                <label>From</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="date-input"
                                    placeholder="mm/dd/yyyy"
                                />
                            </div>
                            <div className="date-input-group">
                                <label>To</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="date-input"
                                    placeholder="mm/dd/yyyy"
                                />
                            </div>
                            {(startDate || endDate) && (
                                <button
                                    className="BillingSubscription-clear-btn"
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <button
                            className="BillingSubscription-action-btn"
                            onClick={handleExportHistory}
                            disabled={billingHistory.length === 0}
                        >
                            Export
                        </button>
                    </div>
                </div>

                {filteredHistory.length > 0 ? (
                    <div className="BillingSubscription-table-container">
                        <table className="BillingSubscription-table">
                            <thead>
                                <tr>
                                    <th>Amounts</th>
                                    <th>Purchase Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map((transaction, index) => (
                                    <tr key={transaction.id || index}>
                                        <td className="amount-cell">{transaction.amount}</td>
                                        <td>{formatDate(transaction.date)}</td>
                                        <td>{formData.subscription.renewalDate ? formatDate(formData.subscription.renewalDate) : 'N/A'}</td>
                                        <td>
                                            <span className={`status-badge status-${transaction.status.toLowerCase()}`}>
                                                {transaction.status === 'success' ? '● Success' : transaction.status === 'paid' ? '● Paid' : '● Pending'}
                                            </span>
                                        </td>
                                        <td className="action-cell">
                                            {transaction.invoiceUrl && (
                                                <button
                                                    className="action-icon-btn"
                                                    onClick={() => window.open(transaction.invoiceUrl, '_blank')}
                                                    title="View"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path d="M8 3C4.5 3 1.73 5.11 1 8c.73 2.89 3.5 5 7 5s6.27-2.11 7-5c-.73-2.89-3.5-5-7-5zm0 8.5c-1.93 0-3.5-1.57-3.5-3.5S6.07 4.5 8 4.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm0-5.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
                                                    </svg>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="BillingSubscription-no-history">
                        {(startDate || endDate) ? 'No results found for selected dates.' : 'No billing history available.'}
                    </p>
                )}
            </div>

            {/* Custom Modal */}
            {modal.isOpen && (
                <div className="BillingSubscription-modal-overlay" onClick={modal.onCancel}>
                    <div className="BillingSubscription-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="BillingSubscription-modal-close" onClick={modal.onCancel}>
                            <X size={20} />
                        </button>

                        <div className="BillingSubscription-modal-icon">
                            {modal.icon === 'success' && <CheckCircle size={48} className="icon-success" />}
                            {modal.icon === 'error' && <AlertCircle size={48} className="icon-error" />}
                            {modal.icon === 'alert' && <AlertCircle size={48} className="icon-alert" />}
                        </div>

                        <h3 className="BillingSubscription-modal-title">{modal.title}</h3>
                        <p className="BillingSubscription-modal-message">{modal.message}</p>

                        <div className="BillingSubscription-modal-buttons">
                            {modal.type === 'confirm' && (
                                <>
                                    <button
                                        className="BillingSubscription-modal-btn-secondary"
                                        onClick={modal.onCancel}
                                    >
                                        {modal.cancelText}
                                    </button>
                                    <button
                                        className="BillingSubscription-modal-btn-primary"
                                        onClick={modal.onConfirm}
                                    >
                                        {modal.confirmText}
                                    </button>
                                </>
                            )}
                            {modal.type === 'alert' && (
                                <button
                                    className="BillingSubscription-modal-btn-primary"
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
