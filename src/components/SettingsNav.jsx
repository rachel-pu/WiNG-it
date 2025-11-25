import './SettingsNav.css';

const SettingsNav = ({ currentTab, onTabChange }) => {
    const tabs = [
        { id: 'profile', label: 'My details' },
        { id: 'billing-subscription', label: 'Plan & Billing' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'personalization', label: 'Personalization' },
    ];

    return (
        <nav className="SettingsNav">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`SettingsNav-tab ${currentTab === tab.id ? 'active' : ''}`}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    );
};

export default SettingsNav;
