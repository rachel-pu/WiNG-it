import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import DefaultAppLayout from "../../DefaultAppLayout.jsx";
import SettingsNav from '../../../components/SettingsNav.jsx';
import SettingsProfile from './SettingsProfile.jsx';
import SettingsBillingSubscription from './SettingsBillingSubscription.jsx';
import SettingsNotifications from './SettingsNotifications.jsx';
import "./SettingsProfile.css";

export default function SettingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('tab') || 'profile';

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId });
    };

    const renderContent = () => {
        switch (currentTab) {
            case 'profile':
                return <SettingsProfile />;
            case 'billing-subscription':
            case 'plan': // backwards compatibility
            case 'billings': // backwards compatibility
                return <SettingsBillingSubscription />;
            case 'notifications':
                return <SettingsNotifications />;
            default:
                return <SettingsProfile />;
        }
    };

    return (
        <Box>
            <DefaultAppLayout>
                <div className="settings-page">
                    <div className="settings-container">
                        <div className="glass-container">
                            <h1 className="settings-title">Settings</h1>
                            <SettingsNav currentTab={currentTab} onTabChange={handleTabChange} />
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </DefaultAppLayout>
        </Box>
    );
}
