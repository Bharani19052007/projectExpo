import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertOctagon, 
  Activity, 
  Wrench, 
  Building2, 
  Cpu, 
  ShieldAlert, 
  ArrowRight, 
  Loader2,
  Sparkles,
  Server,
  Layers,
  Database,
  LineChart,
  Bot,
  Zap,
  Network
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  // Form & Role State
  const [selectedRole, setSelectedRole] = useState('Reliability Engineer');
  const [email, setEmail] = useState('engineer@twinmind.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Authentication Sequence States: IDLE, AUTHENTICATING, VERIFYING, CONNECTING, LOADING_TWIN, SUCCESS, ERROR
  const [authStage, setAuthStage] = useState('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  // Available Roles
  const roles = [
    { id: 'Reliability Engineer', label: 'Reliability Engineer', desc: 'Predictive analytics & health monitoring', icon: Activity },
    { id: 'Maintenance Engineer', label: 'Maintenance Engineer', desc: 'Work orders & component replacement', icon: Wrench },
    { id: 'Plant Manager', label: 'Plant Manager', desc: 'Plant-wide OEE & operational metrics', icon: Building2 },
    { id: 'OEM Expert', label: 'OEM Expert', desc: 'Subsystem diagnostics & telemetry logs', icon: Cpu },
    { id: 'Administrator', label: 'Administrator', desc: 'Access control & security policies', icon: ShieldCheck },
  ];

  // Handle Form Submission with Sequential Loading
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Please enter both Email Address and Password.');
      setAuthStage('ERROR');
      return;
    }

    setErrorMessage('');
    setAuthStage('AUTHENTICATING');

    // Step 1: Authenticating...
    setTimeout(() => {
      setAuthStage('VERIFYING');

      // Step 2: Verifying Credentials...
      setTimeout(() => {
        setAuthStage('CONNECTING');

        // Step 3: Connecting to Factory...
        setTimeout(() => {
          setAuthStage('LOADING_TWIN');

          // Step 4: Loading Digital Twin...
          setTimeout(() => {
            setAuthStage('SUCCESS');

            // Step 5: Access Granted -> Redirect to Dashboard
            setTimeout(() => {
              onLoginSuccess({
                email,
                role: selectedRole,
              });
            }, 600);

          }, 600);

        }, 600);

      }, 600);

    }, 600);
  };

  // Simulate Failed Authentication
  const handleSimulateError = () => {
    setAuthStage('AUTHENTICATING');
    setTimeout(() => {
      setAuthStage('ERROR');
      setErrorMessage('Access Denied: Authentication Failed. Please contact your System Administrator.');
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-between overflow-x-hidden relative font-sans">
      
      {/* Background Industrial Blueprint Grid & Network Connection Nodes */}
      <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/40 via-transparent to-cyan-50/40 pointer-events-none" />

      {/* Main Split Screen Container */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* ========================================================================= */}
        {/* LEFT SIDE (60% on Desktop): Vector Blueprint Hero & Product Description */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 p-8 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-gradient-to-br from-white via-slate-50/90 to-blue-50/20 relative overflow-hidden">
          
          {/* Decorative Vector Blueprint Crosshairs & Grid Lines */}
          <div className="absolute top-12 right-12 text-slate-200 pointer-events-none select-none font-mono text-xs hidden lg:block opacity-60">
            <div>SYS_REF: SIEMENS_UNIT1</div>
            <div>STATUS: ONLINE_READY</div>
            <div>LATENCY: 0.8ms</div>
          </div>

          {/* Top Brand & Product Title */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>ENTERPRISE INDUSTRIAL CONTROL PLATFORM</span>
            </div>

            <div className="flex items-center gap-3.5 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-xl shadow-blue-500/25">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight">
                  TwinMind <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">AI</span>
                </h1>
                <p className="text-sm font-semibold text-slate-600 mt-1">
                  AI-Powered Smart Manufacturing Digital Twin Platform
                </p>
              </div>
            </div>

            <p className="text-xs lg:text-sm text-slate-600 leading-relaxed font-normal pt-2">
              Empowering reliability engineers, plant managers, and OEM experts with real-time physics-based physics modeling, AI root-cause anomaly diagnosis, and automated predictive maintenance across industrial equipment.
            </p>
          </div>

          {/* Modern Industrial Vector Blueprint Graphics Card */}
          <div className="my-8 relative w-full h-[260px] lg:h-[310px] rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-6 text-white shadow-2xl overflow-hidden border border-slate-700 flex flex-col justify-between">
            
            {/* Background SVG Neural Network Lines & Blueprint Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg className="w-full h-full" width="100%" height="100%">
                <pattern id="grid-pat" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00ffff" strokeWidth="0.5" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid-pat)" />
              </svg>
            </div>

            {/* Glowing Digital Pulse Node Animation */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />

            {/* Top Blueprint Card Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-300">
                <Network className="w-4 h-4 text-cyan-400" />
                <span>FACTORY ASSET NETWORK STREAM</span>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                IEC 62443 CONNECTED
              </span>
            </div>

            {/* Vector Schematic Diagram & Metric Gauges */}
            <div className="relative z-10 grid grid-cols-3 gap-3 my-auto">
              
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                <div className="text-[10px] text-cyan-200 font-mono flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" /> Plant OEE Rate
                </div>
                <div className="text-xl font-bold font-mono text-white">94.8%</div>
                <div className="text-[10px] text-emerald-400 font-semibold">+1.4% vs baseline</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                <div className="text-[10px] text-blue-200 font-mono flex items-center gap-1">
                  <Activity className="w-3 h-3 text-blue-400" /> Active Sensors
                </div>
                <div className="text-xl font-bold font-mono text-white">1,420</div>
                <div className="text-[10px] text-cyan-300 font-semibold">100% nominal sync</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                <div className="text-[10px] text-purple-200 font-mono flex items-center gap-1">
                  <Bot className="w-3 h-3 text-purple-400" /> AI Anomaly Score
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400">0.04%</div>
                <div className="text-[10px] text-emerald-400 font-semibold">Zero critical risks</div>
              </div>

            </div>

            {/* Bottom Floating Telemetry Ticker */}
            <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-300 border-t border-white/10 pt-2.5">
              <span>• Siemens Unit 1 Industrial Machine</span>
              <span className="text-cyan-400 font-bold">1010110010 DATA STREAM</span>
              <span>• 24/7 Predictive AI Guard</span>
            </div>

          </div>

          {/* 5 Small Feature Cards (No 3D on Login Page) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {[
              { label: 'Predictive Maintenance', icon: Activity },
              { label: 'AI Diagnostics', icon: Bot },
              { label: 'Digital Twin', icon: Layers },
              { label: 'Industrial Assistant', icon: Sparkles },
              { label: 'Real-Time Monitoring', icon: LineChart },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 text-xs font-bold shadow-sm"
                >
                  <Icon className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">{feat.label}</span>
                </div>
              );
            })}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDE (40% on Desktop): Glassmorphism Enterprise Login Card */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 p-6 lg:p-10 flex flex-col justify-between bg-white/90 backdrop-blur-2xl">
          
          <div className="space-y-6 max-w-md mx-auto w-full">
            
            {/* Header Title */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Welcome Back
                </h2>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  PORTAL v4.2
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Authorized Industrial Personnel Only
              </p>
            </div>

            {/* ROLE SELECTION GRID (Cards instead of Dropdown) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Your Industrial Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20 font-bold'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-blue-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold truncate">{r.label}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {r.desc}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-white absolute top-2 right-2 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ERROR BANNER PANEL */}
            {authStage === 'ERROR' && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 shadow-sm">
                <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-red-900">Access Denied</div>
                  <div className="text-[11px] mt-0.5 leading-snug">{errorMessage}</div>
                </div>
              </div>
            )}

            {/* CREDENTIALS LOGIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="engineer@company.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white text-slate-900 font-medium transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword('demo-pass-123')}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white text-slate-900 font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox & Demo Error Toggle */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember station session</span>
                </label>
                <button
                  type="button"
                  onClick={handleSimulateError}
                  className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline"
                >
                  Test Failure Alert
                </button>
              </div>

              {/* SUBMIT BUTTON WITH MULTI-STAGE SEQUENTIAL LOADING */}
              <button
                type="submit"
                disabled={authStage !== 'IDLE' && authStage !== 'ERROR'}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                  authStage === 'SUCCESS'
                    ? 'bg-emerald-600 border border-emerald-700 shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-blue-500/25 active:scale-[0.99]'
                }`}
              >
                {authStage === 'IDLE' || authStage === 'ERROR' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In Securely ({selectedRole})</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                ) : authStage === 'AUTHENTICATING' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : authStage === 'VERIFYING' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials & Role...</span>
                  </>
                ) : authStage === 'CONNECTING' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>Connecting to Siemens Unit 1...</span>
                  </>
                ) : authStage === 'LOADING_TWIN' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                    <span>Preparing Dashboard...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                    <span>Access Granted! Redirecting...</span>
                  </>
                )}
              </button>

            </form>

            {/* SSO Enterprise Login Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-3 bg-white text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                OR CONTINUE WITH
              </span>
            </div>

            {/* SSO Buttons */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="py-2.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <div className="w-3.5 h-3.5 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">M</div>
                <span>Microsoft</span>
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="py-2.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <div className="w-3.5 h-3.5 rounded bg-red-500 text-white flex items-center justify-center font-bold text-[9px]">G</div>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="py-2.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <div className="w-3.5 h-3.5 rounded bg-cyan-600 text-white flex items-center justify-center font-bold text-[9px]">A</div>
                <span>Azure AD</span>
              </button>
            </div>

            {/* RESTRICTED ACCESS NOTICE WARNING BOX */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>🔒 Restricted Access Notice</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                This platform is accessible only to Reliability Engineers, Maintenance Personnel, Plant Managers, and Authorized OEM Experts. Unauthorized access attempts are monitored and logged.
              </p>
            </div>

            {/* SECURITY FEATURES BADGES */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono text-slate-500 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" /> MFA Enabled
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-600" /> ISO 27001
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Server className="w-3 h-3 text-cyan-600" /> IEC 62443 Security
              </span>
            </div>

          </div>

          {/* Footer Copyright Notice */}
          <div className="mt-8 pt-4 border-t border-slate-200/80 text-center text-[11px] text-slate-400 font-medium">
            TwinMind AI Enterprise • Version 4.2 • © 2026 TwinMind AI • Industrial Digital Twin Platform
          </div>

        </div>

      </div>

    </div>
  );
}
