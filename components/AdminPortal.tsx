
import React from 'react';
import Header from './shared/Header';
import Dashboard from './admin/Dashboard';

interface AdminPortalProps {
  onLogout: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ onLogout }) => {
  return (
    <>
      <Header isAdmin={true} onLogout={onLogout} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Dashboard />
      </main>
    </>
  );
};

export default AdminPortal;
