import { useState, useEffect } from 'react';
import { ref, get, update } from "firebase/database";
import { database } from '../../../lib/firebase.jsx';
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
        <div className="SettingsBillings-content">
            {/* Auto-Pay */}
            <div className="SettingsBillings-field-row">
                <div className="SettingsBillings-field-label-group">
                    <label className="SettingsBillings-field-label">Auto-Pay</label>
                    <p className="SettingsBillings-field-description">
                        Automatically charge your default payment method
                    </p>
                </div>
                <div className="SettingsBillings-field-input-wrapper">
                    <label className="SettingsBillings-toggle-switch">
                        <input
                            type="checkbox"
                            checked={formData.billingInformation.autoPay}
                            onChange={handleToggleAutoPay}
                        />
                        <span className="SettingsBillings-toggle-slider"></span>
                    </label>
                </div>
            </div>

            {/* Billing Cycle */}
            <div className="SettingsBillings-field-row">
                <label className="SettingsBillings-field-label">Billing Cycle</label>
                <div className="SettingsBillings-field-input-wrapper">
                    <div className="SettingsBillings-field-display">
                        {formData.billingInformation.billingCycle.charAt(0).toUpperCase() + formData.billingInformation.billingCycle.slice(1)}
                    </div>
                </div>
            </div>

            {/* Next Billing Date */}
            <div className="SettingsBillings-field-row">
                <label className="SettingsBillings-field-label">Next Billing Date</label>
                <div className="SettingsBillings-field-input-wrapper">
                    <div className="SettingsBillings-field-display">
                        {formData.billingInformation.nextBillingDate}
                    </div>
                </div>
            </div>

            {/* Payment Methods Section */}
            <div className="SettingsBillings-section">
                <div className="SettingsBillings-section-header">
                    <h3 className="SettingsBillings-section-title">Payment Methods</h3>
                    <button onClick={handleAddCard} className="SettingsBillings-btn-add">
                        <Plus size={18} />
                        Add Payment Method
                    </button>
                </div>

                {formData.billingInformation.paymentMethods.map(method => (
                    <div className="SettingsBillings-payment-card" key={method.id}>
                        <div className="SettingsBillings-payment-icon">
                            <CreditCard size={24} />
                        </div>
                        <div className="SettingsBillings-payment-details">
                            <div className="SettingsBillings-payment-number">
                                {method.cardNumber}
                            </div>
                            <div className="SettingsBillings-payment-meta">
                                {method.cardHolder} • Expires {method.expiryDate}
                                {method.isDefault && (
                                    <span className="SettingsBillings-default-badge">Default</span>
                                )}
                            </div>
                        </div>
                        <div className="SettingsBillings-payment-actions">
                            {!method.isDefault && (
                                <button
                                    onClick={() => handleSetDefaultCard(method.id)}
                                    className="SettingsBillings-btn-set-default"
                                >
                                    Set as Default
                                </button>
                            )}
                            <button
                                onClick={() => handleDeleteCard(method.id)}
                                className="SettingsBillings-btn-delete"
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {isAddingCard && (
                    <div className="SettingsBillings-add-card-form">
                        <div className="SettingsBillings-form-grid">
                            <div className="SettingsBillings-form-field-full">
                                <label className="SettingsBillings-form-label">Card Number</label>
                                <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    value={tempCardData.cardNumber || ''}
                                    onChange={(e) => setTempCardData({...tempCardData, cardNumber: e.target.value})}
                                    className="SettingsBillings-form-input"
                                />
                            </div>
                            <div className="SettingsBillings-form-field-full">
                                <label className="SettingsBillings-form-label">Cardholder Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={tempCardData.cardHolder || ''}
                                    onChange={(e) => setTempCardData({...tempCardData, cardHolder: e.target.value})}
                                    className="SettingsBillings-form-input"
                                />
                            </div>
                            <div className="SettingsBillings-form-field">
                                <label className="SettingsBillings-form-label">Expiry Date</label>
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={tempCardData.expiryDate || ''}
                                    onChange={(e) => setTempCardData({...tempCardData, expiryDate: e.target.value})}
                                    className="SettingsBillings-form-input"
                                />
                            </div>
                            <div className="SettingsBillings-form-field">
                                <label className="SettingsBillings-form-label">CVV</label>
                                <input
                                    type="text"
                                    placeholder="123"
                                    value={tempCardData.cvv || ''}
                                    onChange={(e) => setTempCardData({...tempCardData, cvv: e.target.value})}
                                    className="SettingsBillings-form-input"
                                />
                            </div>
                        </div>
                        <div className="SettingsBillings-form-actions">
                            <button onClick={handleSaveNewCard} className="SettingsBillings-btn-save">
                                Save Card
                            </button>
                            <button onClick={handleCancelAddCard} className="SettingsBillings-btn-cancel">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Billing History Section */}
            <div className="SettingsBillings-section">
                <h3 className="SettingsBillings-section-title">Billing History</h3>
                <div className="SettingsBillings-history-container">
                    {formData.billingInformation.billingHistory.map((transaction, index) => (
                        <div
                            className={`SettingsBillings-history-row ${index === formData.billingInformation.billingHistory.length - 1 ? 'last' : ''}`}
                            key={transaction.id}
                        >
                            <div className="SettingsBillings-history-date">{transaction.date}</div>
                            <div className="SettingsBillings-history-amount">{transaction.amount}</div>
                            <div className={`SettingsBillings-history-status status-${transaction.status}`}>
                                {transaction.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}