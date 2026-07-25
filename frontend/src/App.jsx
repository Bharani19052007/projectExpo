import React, { useState, Suspense, lazy } from 'react';
import { Loader2, Cpu, Box } from 'lucide-react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './components/pages/DashboardPage';
import AIAssistantPage from './components/pages/AIAssistantPage';
import DocumentsPage from './components/pages/DocumentsPage';
import AnalyticsPage from './components/pages/AnalyticsPage';
import AlertsPage from './components/pages/AlertsPage';
import LoginPage from './components/auth/LoginPage';

// LAZY LOAD Digital Twin Page & 3D R3F Graphics Library (Loaded ONLY when Digital Twin tab is clicked)
const DigitalTwinPage = lazy(() => import('./components/pages/DigitalTwinPage'));

// Industrial Skeleton Loader while 3D Digital Twin page is lazy-loading
function DigitalTwinSkeleton() {
  return (
    <div className="w-full h-[520px] rounded-2xl bg-white border border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-md animate-pulse">
        <Box className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">
          Loading 3D Digital Twin Engine...
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Initializing Industrial Machine geometry, WebGL canvas shaders, and synchronized twin telemetry.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span>PARSING GLB MESH & TELEMETRY NODES...</span>
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Pre-authenticated for instant demo, full Login page available anytime!
  const [currentUser, setCurrentUser] = useState({
    email: 'akash@twinmind.ai',
    name: 'Akash',
    role: 'Reliability Engineer',
  });
  const [activeTab, setActiveTab] = useState('dashboard'); // Default dashboard, 3D Digital Twin lazy-loads when clicked!

  const handleLoginSuccess = (user) => {
    setCurrentUser({
      ...user,
      name: 'Akash',
    });
    setIsAuthenticated(true);
    setActiveTab('dashboard'); // Redirect to Dashboard upon login!
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  // If user is not authenticated, display full Enterprise Login Portal (0% 3D graphics overhead!)
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header Navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Main Layout Body */}
      <div className="flex flex-1">
        {/* Left Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onSignOut={handleSignOut}
        />

        {/* Main Content View Container */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          
          {/* Lazy-Loaded 3D Digital Twin Tab */}
          {activeTab === 'digital-twin' && (
            <Suspense fallback={<DigitalTwinSkeleton />}>
              <DigitalTwinPage setActiveTab={setActiveTab} />
            </Suspense>
          )}

          {activeTab === 'ai-assistant' && <AIAssistantPage setActiveTab={setActiveTab} />}
          {activeTab === 'documents' && <DocumentsPage setActiveTab={setActiveTab} />}
          {activeTab === 'analytics' && <AnalyticsPage setActiveTab={setActiveTab} />}
          {activeTab === 'alerts' && <AlertsPage setActiveTab={setActiveTab} />}
        </main>
      </div>
    </div>
  );
}
