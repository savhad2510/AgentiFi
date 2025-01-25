import React, { useState } from 'react';
import { Layout, MessageCircle } from 'lucide-react';
import MantleChat from './MantleChat';
import MantleDashboard from './MantleChat';

const AppLayout = () => {
  const [viewMode, setViewMode] = useState('dashboard'); // or 'chat'

  return (
    <div className="min-h-screen bg-black">
      {/* Mode Toggle */}


      {/* View Content */}
      <div className="transition-all duration-300">
        {viewMode === 'dashboard' ? (
          <MantleDashboard />
        ) : (
          <MantleChat />
        )}
      </div>
    </div>
  );
};

export default AppLayout;