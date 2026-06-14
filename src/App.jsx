import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard.jsx";
import CourseSelector from "./components/CourseSelector.jsx";
import QuizEngine from "./components/QuizEngine.jsx";
import AITutor from "./components/AITutor.jsx";
import Progress from "./components/Progress.jsx";
import Profile from "./components/Profile.jsx";
import Materials from "./components/Materials.jsx";
import Onboarding from "./components/Onboarding.jsx";
import Nav from "./components/Nav.jsx";

const STORAGE_KEY = "ap_coach_data";

const defaultData = {
  profile: null,
  progress: {},
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  totalQuestions: 0,
  badges: [],
  materials: [],
};

export default function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    } catch {
      return defaultData;
    }
  });

  const [screen, setScreen] = useState("dashboard");
  const [quizConfig, setQuizConfig] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!data.profile) setScreen("onboarding");
  }, [data.profile]);

  const updateData = (updates) => setData((prev) => ({ ...prev, ...updates }));

  const startQuiz = (config) => {
    setQuizConfig(config);
    setScreen("quiz");
  };

  const recordAttempt = (subjectId, unitId, topicId, correct, total) => {
    const key = `${subjectId}__${unitId}__${topicId}`;
    const prev = data.progress[key] || { correct: 0, total: 0 };
    const xpEarned = correct * 10;
    const today = new Date().toDateString();
    const newStreak =
      data.lastStudyDate === new Date(Date.now() - 86400000).toDateString()
        ? data.streak + 1
        : data.lastStudyDate === today
        ? data.streak
        : 1;

    const newBadges = [...data.badges];
    if (correct === total && total >= 5 && !newBadges.includes("perfect_score"))
      newBadges.push("perfect_score");
    if (newStreak >= 7 && !newBadges.includes("streak_7"))
      newBadges.push("streak_7");
    if (data.xp + xpEarned >= 500 && !newBadges.includes("xp_500"))
      newBadges.push("xp_500");

    updateData({
      progress: { ...data.progress, [key]: { correct: prev.correct + correct, total: prev.total + total } },
      xp: data.xp + xpEarned,
      streak: newStreak,
      lastStudyDate: today,
      totalQuestions: data.totalQuestions + total,
      badges: newBadges,
    });
  };

  if (screen === "onboarding") {
    return <Onboarding onComplete={(profile) => { updateData({ profile }); setScreen("dashboard"); }} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Nav screen={screen} setScreen={setScreen} />
      <main style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
        {screen === "dashboard" && (
          <Dashboard data={data} onStartQuiz={startQuiz} setScreen={setScreen} />
        )}
        {screen === "practice" && (
          <CourseSelector onStartQuiz={startQuiz} materials={data.materials} />
        )}
        {screen === "materials" && (
          <Materials
            materials={data.materials}
            onAdd={(m) => updateData({ materials: [...data.materials, m] })}
            onDelete={(id) => updateData({ materials: data.materials.filter((x) => x.id !== id) })}
          />
        )}
        {screen === "quiz" && quizConfig && (
          <QuizEngine
            config={quizConfig}
            onComplete={(correct, total) => {
              recordAttempt(quizConfig.subjectId, quizConfig.unitId, quizConfig.topicId, correct, total);
              setScreen("dashboard");
            }}
            onBack={() => setScreen("practice")}
          />
        )}
        {screen === "tutor" && <AITutor />}
        {screen === "progress" && <Progress data={data} />}
        {screen === "profile" && (
          <Profile
            profile={data.profile}
            onSave={(profile) => updateData({ profile })}
          />
        )}
      </main>
    </div>
  );
}
