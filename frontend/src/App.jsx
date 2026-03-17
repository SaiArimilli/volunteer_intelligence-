/**
 * App.jsx - Root component with routing and layout
 */
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Register from './pages/Register'
import Admin from './pages/Admin'
import TasksPage from './pages/TasksPage'
import VolunteerProfile from './pages/VolunteerProfile'
import Chatbot from './components/Chatbot'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/tasks"     element={<TasksPage />} />
            <Route path="/volunteer/:id" element={<VolunteerProfile />} />
            <Route path="/admin"     element={<Admin />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {/* Global floating chatbot */}
        <Chatbot />
      </div>
    </BrowserRouter>
  )
}
