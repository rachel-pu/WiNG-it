import { useState, useEffect } from 'react';
import { ref, get, update } from "firebase/database";
import { database } from '../../../lib/firebase.jsx';
import Box from '@mui/material/Box';
import DefaultAppLayout from "../../DefaultAppLayout.jsx";
import { ChevronRight, Check, X, CreditCard, Plus, Trash2 } from 'lucide-react';
import "./SettingsBillings.css";

export default function SettingsBillings() {
    const [error, setError] = useState('');
    const [isEditingCard, setIsEditingCard] = useState(false);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [tempCardData, setTempCardData] = useState({});
    const [formData, setFormData] = useState({
        userId: '',
        billingInformation: {
            paymentMethods: [
                {
                    id: '1',
                    type: 'credit',
                    cardNumber: '**** **** **** 4242',
                    cardHolder: 'John Doe',
                    expiryDate: '12/25',
                    isDefault: true
                }
            ],
            autoPay: true,
            billingCycle: 'monthly',
            nextBillingDate: '2025-11-26',
            billingHistory: [
                { id: '1', date: '2025-10-26', amount: '$29.99', status: 'paid' },
                { id: '2', date: '2025-09-26', amount: '$29.99', status: 'paid' },
                { id: '3', date: '2025-08-26', amount: '$29.99', status: 'paid' }
            ]
        }
    });

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
        const fetchBillingData = async () => {
            if (!formData.userId) return;
            try {
                const snapshot = await get(ref(database, `users/${formData.userId}/billingInformation`));
                if (snapshot.exists()) {
                    setFormData(prev => ({
                        ...prev,
                        billingInformation: snapshot.val()
                    }));
                }
            } catch (err) {
                console.error('Error fetching billing data:', err);
                setError('Failed to fetch billing data.');
            }
        };
        fetchBillingData();
    }, [formData.userId]);

    const handleToggleAutoPay = async () => {
        const newValue = !formData.billingInformation.autoPay;
        try {
            await update(ref(database, `users/${formData.userId}/billingInformation`), {
                autoPay: newValue
            });
            setFormData(prev => ({
                ...prev,
                billingInformation: {
                    ...prev.billingInformation,
                    autoPay: newValue
                }
            }));
        } catch (err) {
            console.error('Error updating auto-pay:', err);
        }
    };

    const handleSetDefaultCard = async (cardId) => {
        try {
            const updatedMethods = formData.billingInformation.paymentMethods.map(method => ({
                ...method,
                isDefault: method.id === cardId
            }));
            
            await update(ref(database, `users/${formData.userId}/billingInformation`), {
                paymentMethods: updatedMethods
            });
            
            setFormData(prev => ({
                ...prev,
                billingInformation: {
                    ...prev.billingInformation,
                    paymentMethods: updatedMethods
                }
            }));
        } catch (err) {
            console.error('Error setting default card:', err);
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (!confirm('Are you sure you want to delete this payment method?')) return;
        
        try {
            const updatedMethods = formData.billingInformation.paymentMethods.filter(
                method => method.id !== cardId
            );
            
            await update(ref(database, `users/${formData.userId}/billingInformation`), {
                paymentMethods: updatedMethods
            });
            
            setFormData(prev => ({
                ...prev,
                billingInformation: {
                    ...prev.billingInformation,
                    paymentMethods: updatedMethods
                }
            }));
        } catch (err) {
            console.error('Error deleting card:', err);
        }
    };

    const handleAddCard = () => {
        setIsAddingCard(true);
        setTempCardData({
            cardNumber: '',
            cardHolder: '',
            expiryDate: '',
            cvv: ''
        });
    };

    const handleSaveNewCard = async () => {
        // Validate card data
        if (!tempCardData.cardNumber || !tempCardData.cardHolder || !tempCardData.expiryDate) {
            return;
        }

        try {
            const newCard = {
                id: Date.now().toString(),
                type: 'credit',
                cardNumber: `**** **** **** ${tempCardData.cardNumber.slice(-4)}`,
                cardHolder: tempCardData.cardHolder,
                expiryDate: tempCardData.expiryDate,
                isDefault: formData.billingInformation.paymentMethods.length === 0
            };

            const updatedMethods = [...formData.billingInformation.paymentMethods, newCard];
            
            await update(ref(database, `users/${formData.userId}/billingInformation`), {
                paymentMethods: updatedMethods
            });
            
            setFormData(prev => ({
                ...prev,
                billingInformation: {
                    ...prev.billingInformation,
                    paymentMethods: updatedMethods
                }
            }));
            
            setIsAddingCard(false);
            setTempCardData({});
        } catch (err) {
            console.error('Error adding card:', err);
        }
    };

    const handleCancelAddCard = () => {
        setIsAddingCard(false);
        setTempCardData({});
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

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
                            <h1 className="settings-title">Billing & Payments</h1>
                            {/* Payment Methods Section */}
                            <div className="billing-card">
                                <div className="billing-card-header">
                                    <h2>Payment Methods</h2>
                                    <button onClick={handleAddCard} className="button-add">
                                        <Plus size={18} />
                                        Add Payment Method
                                    </button>
                                </div>

                                {formData.billingInformation.paymentMethods.map(method => (
                                    <div className="payment-method-row" key={method.id}>
                                        <div className="payment-method-content">
                                            <div className="payment-method-icon">
                                                <CreditCard size={24} />
                                            </div>
                                            <div className="payment-method-details">
                                                <div className="payment-method-number">
                                                    {method.cardNumber}
                                                </div>
                                                <div className="payment-method-meta">
                                                    {method.cardHolder} • Expires {method.expiryDate}
                                                    {method.isDefault && (
                                                        <span className="default-badge">Default</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="payment-method-actions">
                                                {!method.isDefault && (
                                                    <button
                                                        onClick={() => handleSetDefaultCard(method.id)}
                                                        className="action-button-text"
                                                    >
                                                        Set as Default
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteCard(method.id)}
                                                    className="action-button delete-button"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {isAddingCard && (
                                    <div className="add-card-form">
                                        <div className="form-grid">
                                            <div className="form-field-full">
                                                <label className="form-label">Card Number</label>
                                                <input
                                                    type="text"
                                                    placeholder="1234 5678 9012 3456"
                                                    value={tempCardData.cardNumber || ''}
                                                    onChange={(e) => setTempCardData({...tempCardData, cardNumber: e.target.value})}
                                                    className="form-input"
                                                />
                                            </div>
                                            <div className="form-field-full">
                                                <label className="form-label">Cardholder Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="John Doe"
                                                    value={tempCardData.cardHolder || ''}
                                                    onChange={(e) => setTempCardData({...tempCardData, cardHolder: e.target.value})}
                                                    className="form-input"
                                                />
                                            </div>
                                            <div className="form-field-half">
                                                <label className="form-label">Expiry Date</label>
                                                <input
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    value={tempCardData.expiryDate || ''}
                                                    onChange={(e) => setTempCardData({...tempCardData, expiryDate: e.target.value})}
                                                    className="form-input"
                                                />
                                            </div>
                                            <div className="form-field-half">
                                                <label className="form-label">CVV</label>
                                                <input
                                                    type="text"
                                                    placeholder="123"
                                                    value={tempCardData.cvv || ''}
                                                    onChange={(e) => setTempCardData({...tempCardData, cvv: e.target.value})}
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-actions">
                                            <button onClick={handleSaveNewCard} className="button-save">
                                                Save Card
                                            </button>
                                            <button onClick={handleCancelAddCard} className="button-cancel">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Billing Preferences Section */}
                            <div className="billing-card">
                                <h2 className="billing-subtitle">Billing Preferences</h2>

                                <div className="info-row">
                                    <div className="info-row-content">
                                        <div className="info-field-billing">
                                            <label className="info-label-billing">Auto-Pay</label>
                                            <div className="info-description-billing">
                                                Automatically charge your default payment method
                                            </div>
                                        </div>
                                        <div className="toggle-container">
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.billingInformation.autoPay}
                                                    onChange={handleToggleAutoPay}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-row">
                                    <div className="info-row-content">
                                        <div className="info-field">
                                            <label className="info-label-billing">Billing Cycle</label>
                                            <div className="info-value-billing">{formData.billingInformation.billingCycle}</div>
                                        </div>
                                        <div className="info-spacer"></div>
                                    </div>
                                </div>

                                <div className="info-row info-row-last">
                                    <div className="info-row-content">
                                        <div className="info-field">
                                            <label className="info-label-billing">Next Billing Date</label>
                                            <div className="info-value-billing">{formData.billingInformation.nextBillingDate}</div>
                                        </div>
                                        <div className="info-spacer"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Billing History Section */}
                            <div className="billing-card">
                                <h2 className="billing-subtitle">Billing History</h2>

                                {formData.billingInformation.billingHistory.map((transaction, index) => (
                                    <div 
                                        className={`info-row-billing ${index === formData.billingInformation.billingHistory.length - 1 ? 'info-row-last' : ''}`} 
                                        key={transaction.id}
                                    >
                                        <div className="history-row-content">
                                            <div className="history-date">{transaction.date}</div>
                                            <div className="history-amount">{transaction.amount}</div>
                                            <div className={`history-status status-${transaction.status}`}>
                                                {transaction.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </DefaultAppLayout>
        </Box>
    );
}