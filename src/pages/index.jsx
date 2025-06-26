import React from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import Layout from "./Layout";

// Page Imports
import Landing from "./Landing";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Students from "./Students";
import StudentDetails from "./StudentDetails";
import Workouts from "./Workouts";
import Diets from "./Diets";
import Exercises from "./Exercises";
import Financial from "./Financial";
import Settings from "./Settings";
import Profile from "./Profile";
import Chat from "./Chat";
import CompleteProfile from "./CompleteProfile";
import StudentDashboard from "./StudentDashboard";
import StudentWorkout from "./StudentWorkout";
import StudentAssessments from "./StudentAssessments";
import StudentDiet from "./StudentDiet";
import SugestaoIA from "./SugestaoIA";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/rota-teste" element={<div>Teste fora do ProtectedRoute</div>} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/student/:id" element={<StudentDetails />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/diets" element={<Diets />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/student-workout" element={<StudentWorkout />} />
          <Route path="/student-assessments" element={<StudentAssessments />} />
          <Route path="/student-diet" element={<StudentDiet />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/sugestao-ia" element={<SugestaoIA />} />
        </Route>
      </Route>
    </Routes>
  );
};

// Export the AppRouter component as the default export
export default AppRouter;