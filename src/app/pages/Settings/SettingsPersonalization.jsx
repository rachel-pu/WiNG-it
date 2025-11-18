import { useState, useEffect } from "react";
import { ref, get, update } from "firebase/database";
import { database } from "../../../lib/firebase.jsx";
import "./SettingsPersonalization.css";
import "./SettingsProfile.css";
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import GroupIcon from '@mui/icons-material/Group';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { Typography } from "@mui/material";
import Swal from 'sweetalert2';

export default function SettingsPersonalization() {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [validationError, setValidationError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);

    const allowedDifficulties = ["easy-going", "professional", "intense", "randomize"];
    const allowedTypes = ["situational", "problem-solving", "leadership", "teamwork"];

    const difficultyLevels = [
        { id: "easy-going", label: "Easy-going", description: "Friendly and relaxed interviewer" },
        { id: "professional", label: "Professional", description: "Standard corporate interview style" },
        { id: "intense", label: "Intense", description: "Challenging and demanding interviewer" },
        { id: "randomize", label: "Randomize", description: "Mix of multiple styles" }
    ];

    const questionTypeOptions = [
        { id: "situational", label: "Situational", icon: BusinessCenterIcon },
        { id: "problem-solving", label: "Problem Solving", icon: PsychologyIcon },
        { id: "leadership", label: "Leadership", icon: AutoAwesomeIcon },
        { id: "teamwork", label: "Teamwork", icon: GroupIcon }
    ];

    const [prefs, setPrefs] = useState({
        numQuestions: 3,
        questionTypes: [],
        interviewerStyle: "easy-going",
        targetRole: "Software Engineer Intern",
    });

    // Load user ID from cookie
    useEffect(() => {
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(";").shift();
        };
        const uid = getCookie("user_id");
        if (uid) setUserId(uid);
    }, []);

    // Fetch preferences from Firebase
    useEffect(() => {
        if (!userId) return;

        const fetchPrefs = async () => {
            try {
                const snapshot = await get(ref(database, `users/${userId}/interviewPreferences`));

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setPrefs({
                        numQuestions: data.numQuestions || 3,
                        questionTypes: Array.isArray(data.questionTypes) ? data.questionTypes : [],
                        interviewerStyle: data.interviewerStyle || "easy-going",
                        targetRole: data.targetRole || "Software Engineer Intern",
                    });
                }
            } catch (err) {
                console.error("Error fetching interview prefs:", err);
                setError("Failed to load interview preferences.");
            } finally {
                setLoading(false);
            }
        };

        fetchPrefs();
    }, [userId]);

    // Validation
    const validate = () => {
        if (prefs.numQuestions < 1 || prefs.numQuestions > 5)
            return "Number of questions must be between 1 and 5.";

        if (!allowedDifficulties.includes(prefs.interviewerStyle))
            return "Invalid interviewer style.";

        if (prefs.targetRole.length < 4)
            return "Target role must be at least 4 characters.";

        return "";
    };

    // Update handlers
    const setNumQuestions = (num) =>
        setPrefs((prev) => ({ ...prev, numQuestions: num }));

    const toggleQuestionType = (type) =>
        setPrefs((prev) => {
            const exists = prev.questionTypes.includes(type);
            return {
                ...prev,
                questionTypes: exists
                    ? prev.questionTypes.filter((t) => t !== type)
                    : [...prev.questionTypes, type],
            };
        });

    const setDifficulty = (style) =>
        setPrefs((prev) => ({ ...prev, interviewerStyle: style }));

    const savePrefs = async () => {
        const problem = validate();
        if (problem) {
            setValidationError(problem);
            setSaveSuccess(false);
            return;
        }

        setValidationError("");

        const finalTypes =
            prefs.questionTypes.length === 0 ? ["randomize"] : prefs.questionTypes;

        try {
            await update(ref(database, `users/${userId}/interviewPreferences`), {
                ...prefs,
                questionTypes: finalTypes,
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
            Swal.fire({
                title: "Preferences saved successfully",
                icon: "success"
            });
        } catch (err) {
            console.error("Failed to save:", err);
            setError("Failed to save preferences");
        }
    };

    if (loading) return <div className="SettingsProfile-spinner"></div>;

    return (
        <div className="Personalization-container-refined">
            {/* Intro Text */}
            <div className="Personalization-intro">
                <Typography className="Personalization-intro-text">
                    Personalize your interview experience by saving your favorite interview settings. 
                    Configure once and use across all your practice sessions.
                </Typography>
            </div>

            {/* Validation Error */}
            {validationError && (
                <div className="Personalization-validation-error">
                    {validationError}
                </div>
            )}

            {/* BEHAVIORAL INTERVIEW SECTION */}
            <div className="Personalization-section">
                <div className="Personalization-section-header">
                    <Typography className="Personalization-section-title">
                        Behavioral Interview
                    </Typography>
                </div>
                <div className="Personalization-section-divider" />

                {/* Row 1: Target Role + Number of Questions */}
                <div className="Personalization-form-row">
                    <div className="Personalization-form-group">
                        <label className="Personalization-form-label">Target Role</label>
                        <input
                            type="text"
                            value={prefs.targetRole}
                            onChange={(e) =>
                                setPrefs((prev) => ({ ...prev, targetRole: e.target.value }))
                            }
                            className="Personalization-form-input"
                            placeholder="e.g., Software Engineer Intern"
                        />
                    </div>

                    <div className="Personalization-form-group">
                        <label className="Personalization-form-label">Number of Questions</label>
                        <div className="Personalization-number-selector">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setNumQuestions(num)}
                                    className={`Personalization-number-btn ${
                                        prefs.numQuestions === num ? "active" : ""
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 2: Question Types + Interviewer Style */}
                <div className="Personalization-form-row">
                    <div className="Personalization-form-group">
                        <label className="Personalization-form-label">Interviewer Style</label>
                        <div className="Personalization-difficulty-options">
                            {difficultyLevels.map((d) => (
                                <button
                                    key={d.id}
                                    onClick={() => setDifficulty(d.id)}
                                    className={`Personalization-difficulty-btn ${
                                        prefs.interviewerStyle === d.id ? "active" : ""
                                    }`}
                                >
                                    <div className="Personalization-difficulty-label">{d.label}</div>
                                    <div className="Personalization-difficulty-description">
                                        {d.description}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="Personalization-form-group">
                        <label className="Personalization-form-label">Question Types</label>
                        <div className="Personalization-question-types-grid">
                            {questionTypeOptions.map((t) => {
                                const Icon = t.icon;
                                const selected = prefs.questionTypes.includes(t.id);

                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => toggleQuestionType(t.id)}
                                        className={`Personalization-type-btn ${
                                            selected ? "selected" : ""
                                        }`}
                                    >
                                        <Icon />
                                        <span>{t.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {prefs.questionTypes.length === 0 && (
                            <Typography className="Personalization-helper-text">
                                Leave empty for random selection
                            </Typography>
                        )}
                    </div>
                </div>
            </div>

            {/* Future sections can be added here with same pattern */}

            {/* Save Button */}
            <button className="Personalization-save-btn" onClick={savePrefs}>
                Save Preferences
            </button>
        </div>
    );
}