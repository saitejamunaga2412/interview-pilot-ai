import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./layouts/ProtectedRoute";
import { ToastProvider } from "./components/ui/Toast";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { LoadingState } from "./components/ui/States";
import GlobalLayout from "./layouts/GlobalLayout";

import { useAuth } from "./hooks/useAuth";

// Lazy-loaded routes
const Home = lazy(() => import("./pages/Home"));
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const Settings = lazy(() => import("./pages/profile/Settings"));
const NotificationCenter = lazy(() => import("./pages/notifications/NotificationCenter"));
const Interview = lazy(() => import("./pages/Interview"));
const Result = lazy(() => import("./pages/Result"));
const History = lazy(() => import("./pages/history/History"));
const Resume = lazy(() => import("./pages/resume/Resume"));
const InterviewDetails = lazy(() => import("./pages/InterviewDetails"));
const CareerAssessment = lazy(() => import("./pages/CareerAssessment"));
const ArenaDashboard = lazy(() => import("./pages/ArenaDashboard"));
const Arena = lazy(() => import("./pages/Arena"));
const LearningPlatform = lazy(() => import("./pages/learning/LearningPlatform"));
const TopicDetails = lazy(() => import("./pages/learning/TopicDetails"));
const PatternPage = lazy(() => import("./pages/PatternPage"));
const CompanyList = lazy(() => import("./pages/company/CompanyList"));
const CompanyDetails = lazy(() => import("./pages/company/CompanyDetails"));
const CareerAdvisor = lazy(() => import("./pages/CareerAdvisor"));
const MyJourney = lazy(() => import("./pages/journey/MyJourney"));
const Aptitude = lazy(() => import("./pages/Aptitude"));
const TopicLearningPage = lazy(() => import("./pages/aptitude/TopicLearningPage"));
const MistakeBook = lazy(() => import("./pages/mistakes/MistakeBook"));
const PlacementSimulation = lazy(() => import("./pages/simulation/PlacementSimulation"));

// Assessment Platform
const AssessmentDashboard = lazy(() => import("./pages/assessment/AssessmentDashboard"));
const AssessmentHistory = lazy(() => import("./pages/assessment/AssessmentHistory"));
const AssessmentTest = lazy(() => import("./pages/assessment/AssessmentTest"));
const AssessmentResult = lazy(() => import("./pages/assessment/AssessmentResult"));

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <GlobalLayout>
            <Suspense fallback={
              <div className="h-full flex items-center justify-center bg-bg-base">
                <LoadingState text="Loading module..." />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/journey" element={<ProtectedRoute><MyJourney /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />
                <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
                <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/history/:sessionId" element={<ProtectedRoute><InterviewDetails /></ProtectedRoute>} />
                <Route path="/resume" element={<ProtectedRoute><Resume /></ProtectedRoute>} />
                <Route path="/mistakes" element={<ProtectedRoute><MistakeBook /></ProtectedRoute>} />
                <Route path="/simulation" element={<ProtectedRoute><PlacementSimulation /></ProtectedRoute>} />
                <Route path="/career-assessment" element={<ProtectedRoute><CareerAssessment /></ProtectedRoute>} />
                <Route path="/arena" element={<ProtectedRoute><ArenaDashboard /></ProtectedRoute>} />
                <Route path="/learning" element={<ProtectedRoute><LearningPlatform /></ProtectedRoute>} />
                <Route path="/learning/:topicId" element={<ProtectedRoute><TopicDetails /></ProtectedRoute>} />
                <Route path="/patterns/:patternId" element={<ProtectedRoute><PatternPage /></ProtectedRoute>} />
                <Route path="/company" element={<ProtectedRoute><CompanyList /></ProtectedRoute>} />
                <Route path="/company/:name" element={<ProtectedRoute><CompanyDetails /></ProtectedRoute>} />
                <Route path="/advisor" element={<ProtectedRoute><CareerAdvisor /></ProtectedRoute>} />
                <Route path="/arena/:id" element={<ProtectedRoute><Arena /></ProtectedRoute>} />
                <Route path="/aptitude" element={<ProtectedRoute><Aptitude /></ProtectedRoute>} />
                <Route path="/aptitude/:topicId" element={<ProtectedRoute><TopicLearningPage /></ProtectedRoute>} />
                <Route path="/reasoning" element={<ProtectedRoute><Aptitude /></ProtectedRoute>} />
                <Route path="/reasoning/:topicId" element={<ProtectedRoute><TopicLearningPage /></ProtectedRoute>} />
                
                {/* Assessment Platform Routes */}
                <Route path="/assessment" element={<ProtectedRoute><AssessmentDashboard /></ProtectedRoute>} />
                <Route path="/assessment/history" element={<ProtectedRoute><AssessmentHistory /></ProtectedRoute>} />
                <Route path="/assessment/test/:id" element={<ProtectedRoute><AssessmentTest /></ProtectedRoute>} />
                <Route path="/assessment/result/:id" element={<ProtectedRoute><AssessmentResult /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </GlobalLayout>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;