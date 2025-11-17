import { useState, useEffect } from 'react';
import { ref, get, update } from "firebase/database";
import { database, createCheckoutSession, cancelSubscription } from '../../../lib/firebase.jsx';
import { Check, Zap, Crown, Sparkles, AlertCircle, CheckCircle, X, Search, Filter } from 'lucide-react';
import { STRIPE_CONFIG } from '../../../config/stripe';
import "./SettingsBillingSubscription.css";

export default function SettingsBillingSubscription() {
    const [error, setError] = useState('');
    const [isChangingPlan, setIsChangingPlan] = useState(false);
    const [billingHistory, setBillingHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilters, setStatusFilters] = useState({
        paid: true,
        success: true,
        processing: true,
        cancelled: true
    });
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

    useEffect(() => {
        const fetchBillingHistory = async () => {
            if (!formData.userId) return;
            try {
                const snapshot = await get(ref(database, `users/${formData.userId}/subscription/billingHistory`));
                if (snapshot.exists()) {
                    const historyData = snapshot.val();
                    const historyArray = Object.values(historyData).sort((a, b) => {
                        return new Date(b.date) - new Date(a.date);
                    });
                    setBillingHistory(historyArray);
                }
            } catch (err) {
                console.error('Error fetching billing history:', err);
            }
        };
        fetchBillingHistory();
    }, [formData.userId]);

    const handleChangePlan = async (newPlan) => {
        // Don't allow changing to the same plan
        if (newPlan === formData.subscription.tier) return;

        if (newPlan === 'free') {
            showConfirm(
                'Downgrade to Free Plan',
                'Are you sure you want to downgrade to the Free plan? You will lose access to premium features.',
                async () => {
                    setModal(prev => ({ ...prev, isOpen: false }));
                    setIsChangingPlan(true);
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

        // Plan upgrade - always use monthly pricing
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
    };

    const handleExportHistory = () => {
        // Convert billing history to CSV
        const headers = ['Plan Name', 'Amount', 'Purchase Date', 'End Date', 'Status'];
        const csvContent = [
            headers.join(','),
            ...billingHistory.map(item =>
                [item.planName || 'N/A', item.amount, item.date, item.endDate || 'N/A', item.status].join(',')
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

    const toggleStatusFilter = (status) => {
        setStatusFilters(prev => ({
            ...prev,
            [status]: !prev[status]
        }));
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    const currentPlan = plans[formData.subscription.tier] ? formData.subscription.tier : 'free';

    const filteredHistory = billingHistory.filter(item => {
        // Apply search filter
        const matchesSearch = item.amount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.date?.includes(searchTerm) ||
            item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.planName?.toLowerCase().includes(searchTerm.toLowerCase());

        // Apply status filter
        const matchesStatus = statusFilters[item.status?.toLowerCase()];

        return matchesSearch && matchesStatus;
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
                        <div className="BillingSubscription-search-box">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="BillingSubscription-search-input"
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button
                                className="BillingSubscription-action-btn"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter size={18} />
                                Filter
                            </button>
                            {showFilters && (
                                <div className="filter-dropdown">
                                    <div className="filter-dropdown-header">Filter by Status</div>
                                    <label className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={statusFilters.paid}
                                            onChange={() => toggleStatusFilter('paid')}
                                        />
                                        <span>Paid</span>
                                    </label>
                                    <label className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={statusFilters.success}
                                            onChange={() => toggleStatusFilter('success')}
                                        />
                                        <span>Success</span>
                                    </label>
                                    <label className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={statusFilters.processing}
                                            onChange={() => toggleStatusFilter('processing')}
                                        />
                                        <span>Processing</span>
                                    </label>
                                    <label className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={statusFilters.cancelled}
                                            onChange={() => toggleStatusFilter('cancelled')}
                                        />
                                        <span>Cancelled</span>
                                    </label>
                                </div>
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
                                    <th>Plan Name</th>
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
                                        <td>{transaction.planName ? `${transaction.planName.charAt(0).toUpperCase() + transaction.planName.slice(1)} Plan` : 'N/A'}</td>
                                        <td className="amount-cell">{transaction.amount}</td>
                                        <td>{transaction.date}</td>
                                        <td>{formData.subscription.renewalDate || 'N/A'}</td>
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
                        {searchTerm ? 'No results found.' : 'No billing history available.'}
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
