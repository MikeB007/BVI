import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Boats from './pages/Boats';
import BoatDetail from './pages/BoatDetail';
import Crew from './pages/Crew';
import WaitingList, { AssignmentQueue } from './pages/WaitingList';
import AdminBoats from './pages/AdminBoats';
import AdminUsers from './pages/AdminUsers';
import Login from './pages/Login';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/boats" element={<Boats />} />
        <Route path="/boats/:id" element={<BoatDetail />} />
        <Route path="/crew" element={<Crew />} />
        <Route path="/waiting-list" element={<WaitingList />} />
        <Route path="/assignments" element={<AssignmentQueue />} />
        <Route path="/admin/boats" element={<AdminBoats />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

