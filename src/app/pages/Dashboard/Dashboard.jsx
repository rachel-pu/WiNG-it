"use client";
import { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Fab from "@mui/material/Fab";
import NavigationIcon from "@mui/icons-material/Navigation";
import DefaultAppLayout from "../../DefaultAppLayout.jsx";
import DashboardCard from './components/DashboardCard.jsx';
import { supabase } from '../../../../supabase.js';
import { database } from '../../../lib/firebase.jsx';
import { ref, get } from "firebase/database";

export default function Dashboard() {
    const [userId, setUserId] = useState(null);
    const [onboardingCompleted, setOnboardingCompleted] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const setUserCookie = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session){
            setLoading(false);
            return;
        };

        const userId = data.session.user.id;
        setUserId(userId);
        document.cookie = `user_id=${userId}; path=/; max-age=604800; secure; samesite=strict`;
        };
        setUserCookie();
    }, []);

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
            document.cookie = `user_id=${session.user.id}; path=/; max-age=604800; secure; samesite=strict`;
            } else {
            document.cookie = 'user_id=; Max-Age=0; path=/;';
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    
    useEffect(() => { 
        const fetchOnboardingStatus = async () => {
            if (!userId) {
            setLoading(false);
            return;
            }

            try {
            const userRef = ref(database, `users/${userId}/onboardingCompleted`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                setOnboardingCompleted(snapshot.val());
            } else {
                setOnboardingCompleted(false);
            }
            } catch (error) {
            console.error("Error fetching onboarding status:", error);
            setOnboardingCompleted(false);
            } finally {
            setLoading(false);
            }
        };
        fetchOnboardingStatus();
    }, [userId]);


    return (
        <Box>
            <DefaultAppLayout>
                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 4,
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        minHeight: '100vh'
                    }}
                >
                    
                    {/* Tools Grid */}
                    <Grid 
                        container 
                        spacing={3} 
                        sx={{width: "100%" }}
                        columns={{ xs: 1, sm: 1, md: 2, lg: 3 }}
                    >
                        {/* Behavioral Interview - Active */}
                        <Grid size={{ xs: 1, sm: 1, md: 1 }}>
                            <DashboardCard
                                title="Behavioral Interview"
                                link="/behavioral"
                                description="Practice behavioral interviews with AI-powered feedback. Customize your questions and receive personalized improvement advice."
                                status="active"
                                icon="🎯"
                                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                buttons={[
                                    { type: 'Simulation' },
                                    { type: 'Microphone' },
                                ]}
                            />
                        </Grid>

                        {/* Smart Job Scraper */}
                        <Grid size={{ xs: 1, sm: 1, md: 1 }}>
                            <DashboardCard
                                title="Smart Job Scraper"
                                link="#"
                                description="Automatically find and analyze job postings that match your skills. Extract key requirements and get preparation tips."
                                status="coming-soon"
                                icon="🔍"
                                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                                buttons={[
                                    { type: 'Tool' },
                                ]}
                            />
                        </Grid>

                        {/* Resume Builder */}
                        <Grid size={{ xs: 1, sm: 1, md: 1 }}>
                            <DashboardCard
                                title="AI Resume Builder"
                                link="#"
                                description="Create ATS-optimized resumes with AI assistance. Get suggestions for keywords and formatting tailored to your roles."
                                status="coming-soon"
                                icon="📄"
                                gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                                buttons={[
                                    { type: 'Tool' },
                                ]}
                            />
                        </Grid>
                    </Grid>

                    {!loading && onboardingCompleted === false && (
                    <div>
                        <Fab
                        variant="extended"
                        color="primary"
                        sx={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 500,
                            boxShadow: 3,
                            '&:hover': {
                            background: 'linear-gradient(135deg, #9aa2ebff 0%, #6b46c1 100%)',
                            color: "#cdced8ff"
                            },
                        }}
                        style={{fontFamily: "Satoshi Bold"}}
                        href="/onboarding"
                        >
                        <NavigationIcon sx={{ mr: 1 }}  />
                        Onboarding
                        </Fab>
                    </div>
                    )}
                </Box>
            </DefaultAppLayout>
        </Box>
    );
}