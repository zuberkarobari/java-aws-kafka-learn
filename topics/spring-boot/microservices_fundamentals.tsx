import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Split, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  Database, 
  Server, 
  Layout, 
  Cpu, 
  Globe, 
  ShieldAlert,
  GitMerge,
  Network,
  Box,
  ArrowRight,
  Code2,
  TerminalSquare
} from 'lucide-react';

// --- CUSTOM STYLES (Typography & Animations) ---
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Fira+Code:wght@400;500&display=swap');

  :root {
    --bg-dark: #0f172a;
    --card-bg: rgba(30, 41, 59, 0.6);
    --primary: #06b6d4;
    --secondary: #6366f1;
  }

  body {
    background-color: var(--bg-dark);
    color: #f8fafc;
    font-family: 'Outfit', sans-serif;
    margin: 0;
    overflow: hidden;
  }

  .font-mono {
    font-family: 'Fira Code', monospace;
  }

  /* Animation Utilities */
  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }

  @keyframes pulseGlow {
    0% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); }
    70% { box-shadow: 0 0 20px 10px rgba(6, 182, 212, 0); }
    100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
  }

  .animate-fade-up {
    animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }
  .delay-300 { animation-delay: 300ms; }

  /* Glassmorphism Component Library */
  .glass-panel {
    background: var(--card-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  }
  
  .glass-panel:hover {
    border-color: rgba(6, 182, 212, 0.3);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(6, 182, 212, 0.05);
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #475569; }
`;

// --- UI COMPONENTS ---

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    red: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    yellow: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[color]}`}>
      {children}
    </span>
  );
};

const AnimatedSection = ({ children, delay = "" }) => (
  <div className={`animate-fade-up ${delay}`}>
    {children}
  </div>
);

// --- CONTENT VIEWS ---

const MonolithVsMicroservices = () => (
  <div className="space-y-8">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
        Monolith vs Microservices
      </h2>
      <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
        The fundamental architectural shift from a single unified codebase to a distributed network of independent services.
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Monolith Architecture Diagram */}
      <AnimatedSection delay="delay-100">
        <div className="glass-panel rounded-2xl p-8 h-full flex flex-col items-center transition-all duration-500">
          <Badge color="blue">Legacy / Traditional</Badge>
          <h3 className="text-2xl font-semibold mt-4 mb-8">Monolithic Architecture</h3>
          
          <div className="w-64 border-2 border-slate-600 rounded-xl p-4 bg-slate-800/50 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <div className="bg-cyan-500/20 text-cyan-300 p-3 rounded-lg mb-2 text-center text-sm font-semibold flex items-center justify-center gap-2">
              <Layout size={16} /> User Interface
            </div>
            <div className="bg-indigo-500/20 text-indigo-300 p-3 rounded-lg mb-2 text-center text-sm font-semibold flex items-center justify-center gap-2">
              <Cpu size={16} /> Business Logic
            </div>
            <div className="bg-purple-500/20 text-purple-300 p-3 rounded-lg text-center text-sm font-semibold flex items-center justify-center gap-2">
              <Database size={16} /> Data Access Layer
            </div>
          </div>
          
          <div className="h-10 w-1 bg-slate-600 my-2"></div>
          <div className="w-48 bg-slate-700 p-4 rounded-full flex items-center justify-center gap-3">
            <Database size={24} className="text-slate-300" />
            <span className="font-semibold text-slate-300">Single Shared DB</span>
          </div>

          <p className="mt-8 text-sm text-slate-400 text-center leading-relaxed">
            All components are packaged tightly together. A single code base, a single deployment, running as a single process.
          </p>
        </div>
      </AnimatedSection>

      {/* Microservices Architecture Diagram */}
      <AnimatedSection delay="delay-200">
        <div className="glass-panel rounded-2xl p-8 h-full flex flex-col items-center transition-all duration-500 relative overflow-hidden">
          {/* Subtle bg glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <Badge color="green">Modern / Distributed</Badge>
          <h3 className="text-2xl font-semibold mt-4 mb-8">Microservices Architecture</h3>
          
          <div className="w-full max-w-md">
            <div className="bg-slate-800/80 p-3 rounded-xl mb-6 text-center text-sm font-semibold border border-slate-600 flex justify-center gap-2">
              <Globe size={18} className="text-emerald-400" /> API Gateway / Load Balancer
            </div>
            
            <div className="flex justify-between relative gap-4">
              {[
                { name: 'Auth', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
                { name: 'Billing', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
                { name: 'Shipping', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }
              ].map((svc, i) => (
                <div key={i} className="flex flex-col items-center animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                  <div className={`p-4 rounded-xl border ${svc.border} ${svc.bg} flex flex-col items-center w-24 mb-3 shadow-lg`}>
                    <Server size={24} className={svc.color} />
                    <span className="text-xs font-semibold mt-2">{svc.name}</span>
                  </div>
                  <div className="h-6 w-0.5 bg-slate-600 mb-1 border-l border-dashed border-slate-500"></div>
                  <Database size={20} className="text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 text-sm text-slate-400 text-center leading-relaxed relative z-10">
            Application broken into smaller, loosely coupled services. Each service is independently deployable and often manages its own database.
          </p>
        </div>
      </AnimatedSection>
    </div>
  </div>
);

const ProsAndCons = () => (
  <div className="space-y-8">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500">
        Trade-offs & Realities
      </h2>
      <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
        Microservices are not a silver bullet. They solve organizational and scaling problems at the cost of operational complexity.
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Advantages */}
      <AnimatedSection delay="delay-100">
        <div className="glass-panel p-8 rounded-2xl border-t-4 border-t-emerald-500 h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
              <ThumbsUp size={28} />
            </div>
            <h3 className="text-2xl font-bold">Advantages</h3>
          </div>
          
          <ul className="space-y-6">
            {[
              { title: "Independent Deployment", desc: "Teams can deploy their services without coordinating with others, enabling CI/CD." },
              { title: "Technological Freedom", desc: "Different services can be written in different languages (Java, Node, Python) fitting the task." },
              { title: "Targeted Scalability", desc: "Scale only the services that are under heavy load (e.g., scale 'Reporting' but not 'Auth')." },
              { title: "Fault Isolation", desc: "A memory leak in the billing service won't crash the entire e-commerce platform." }
            ].map((item, i) => (
              <li key={i} className="flex gap-4 items-start">
                <div className="mt-1 text-emerald-400"><GitMerge size={20} /></div>
                <div>
                  <h4 className="font-semibold text-slate-200">{item.title}</h4>
                  <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </AnimatedSection>

      {/* Disadvantages */}
      <AnimatedSection delay="delay-200">
        <div className="glass-panel p-8 rounded-2xl border-t-4 border-t-rose-500 h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400">
              <ThumbsDown size={28} />
            </div>
            <h3 className="text-2xl font-bold">Disadvantages</h3>
          </div>
          
          <ul className="space-y-6">
            {[
              { title: "Distributed System Complexity", desc: "Network latency, partial failures, and message serialization overhead." },
              { title: "Data Consistency", desc: "No simple ACID transactions across services. Requires complex patterns like Saga or Eventual Consistency." },
              { title: "Operational Overhead", desc: "Requires mature DevOps, container orchestration (Kubernetes), and advanced CI/CD pipelines." },
              { title: "Difficult Debugging", desc: "Tracing a request that hops across 5 different services requires specialized tools (e.g., Jaeger, Zipkin)." }
            ].map((item, i) => (
              <li key={i} className="flex gap-4 items-start">
                <div className="mt-1 text-rose-400"><Network size={20} /></div>
                <div>
                  <h4 className="font-semibold text-slate-200">{item.title}</h4>
                  <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </AnimatedSection>
    </div>
  </div>
);

const WhenNotToUse = () => (
  <AnimatedSection>
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center gap-4">
          <ShieldAlert size={40} className="text-amber-500" /> When NOT to Use
        </h2>
      </div>

      <div className="glass-panel p-10 rounded-3xl relative overflow-hidden">
        {/* Warning stripes background */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[repeating-linear-gradient(45deg,var(--tw-colors-amber-500),var(--tw-colors-amber-500)_10px,var(--tw-colors-black)_10px,var(--tw-colors-black)_20px)] opacity-50"></div>
        
        <p className="text-xl text-slate-300 mb-10 leading-relaxed font-light">
          "If you can't build a well-structured monolith, what makes you think you can build a well-structured set of microservices?" <br/>
          <span className="text-sm font-semibold text-amber-500 mt-2 block">— Simon Brown</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "Early Stage Startups", desc: "When finding Product-Market Fit, speed of iteration is key. Microservices add unnecessary friction." },
            { title: "Small Development Teams", desc: "If you only have 3-5 developers, the operational tax of microservices will consume all their time." },
            { title: "Unclear Domain Boundaries", desc: "If you don't fully understand the business logic yet, getting service boundaries wrong leads to a 'Distributed Monolith'." },
            { title: "No DevOps Culture", desc: "Without automated testing, CI/CD, and infrastructure-as-code, managing multiple services will be a nightmare." }
          ].map((item, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl hover:bg-slate-800/80 transition-colors">
              <h4 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">
                <AlertTriangle size={18} /> {item.title}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </AnimatedSection>
);

const DecompositionStrategies = () => (
  <div className="space-y-8">
    <div className="text-center mb-10">
      <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
        Service Decomposition
      </h2>
      <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
        How do you break the monolith? Strategies to define boundaries to prevent the dreaded "Distributed Monolith".
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Business Capability */}
      <AnimatedSection delay="delay-100">
        <div className="glass-panel p-8 rounded-2xl h-full">
          <Badge color="purple">Strategy 1</Badge>
          <h3 className="text-2xl font-bold mt-4 mb-2">By Business Capability</h3>
          <p className="text-slate-400 text-sm mb-8">Organizing services around what the business actually does (Conway's Law).</p>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center gap-4">
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><Box size={24} /></div>
              <div>
                <h4 className="font-semibold">Order Management</h4>
                <p className="text-xs text-slate-500 font-mono">Order taking, validation, status</p>
              </div>
            </div>
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center gap-4">
              <div className="bg-green-500/20 p-2 rounded-lg text-green-400"><Box size={24} /></div>
              <div>
                <h4 className="font-semibold">Inventory Management</h4>
                <p className="text-xs text-slate-500 font-mono">Stock levels, reservations</p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Domain-Driven Design */}
      <AnimatedSection delay="delay-200">
        <div className="glass-panel p-8 rounded-2xl h-full">
          <Badge color="pink">Strategy 2</Badge>
          <h3 className="text-2xl font-bold mt-4 mb-2">Domain-Driven Design (DDD)</h3>
          <p className="text-slate-400 text-sm mb-8">Using Bounded Contexts. Complex domains are broken into Core, Generic, and Supporting sub-domains.</p>
          
          <div className="relative p-6 border-2 border-dashed border-pink-500/30 rounded-xl bg-pink-500/5">
            <span className="absolute -top-3 left-4 bg-[#0f172a] px-2 text-xs text-pink-400 font-bold uppercase tracking-wider">
              Bounded Context: E-Commerce
            </span>
            <div className="grid grid-cols-2 gap-4 mt-2">
               <div className="bg-slate-800 p-3 rounded-lg text-center text-sm font-semibold border-l-4 border-indigo-500">
                  Product Catalog
               </div>
               <div className="bg-slate-800 p-3 rounded-lg text-center text-sm font-semibold border-l-4 border-rose-500">
                  Shopping Cart
               </div>
               <div className="bg-slate-800 p-3 rounded-lg text-center text-sm font-semibold border-l-4 border-amber-500 col-span-2">
                  Payment Processing
               </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  </div>
);

const DatabasePerService = () => (
  <AnimatedSection>
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
          Database per Service Pattern
        </h2>
        <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
          The golden rule of microservices: Services must not share a database to ensure loose coupling.
        </p>
      </div>

      <div className="glass-panel p-10 rounded-3xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Anti-Pattern */}
          <div className="flex-1 w-full relative">
            <div className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg shadow-lg">ANTI-PATTERN</div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-rose-500/30 h-full flex flex-col items-center">
               <h3 className="text-lg font-semibold mb-6 text-slate-300">Shared Database</h3>
               
               <div className="flex gap-4 mb-8">
                 <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 flex flex-col items-center"><Server size={20} className="mb-2 text-slate-400"/> Order Svc</div>
                 <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 flex flex-col items-center"><Server size={20} className="mb-2 text-slate-400"/> User Svc</div>
               </div>
               
               {/* Arrows down to shared DB */}
               <div className="relative w-full h-8 flex justify-center mb-2">
                 <svg className="absolute w-full h-full text-rose-500/50 stroke-current" style={{ strokeWidth: 2, fill: 'none' }}>
                    <path d="M 30% 0 Q 50% 100%, 50% 100%" markerEnd="url(#arrow)" />
                    <path d="M 70% 0 Q 50% 100%, 50% 100%" markerEnd="url(#arrow)" />
                 </svg>
               </div>

               <div className="w-32 bg-rose-950/30 border-2 border-rose-500/50 p-4 rounded-xl flex flex-col items-center">
                  <Database size={32} className="text-rose-400 mb-2" />
                  <span className="text-xs font-bold text-rose-300">Shared DB</span>
               </div>
               <p className="text-xs text-slate-500 mt-6 text-center">Creates tight coupling. Schema changes break other services.</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center p-4 bg-slate-800 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <ArrowRight size={24} className="text-cyan-400" />
          </div>

          {/* Best Practice */}
          <div className="flex-1 w-full relative">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg shadow-lg">BEST PRACTICE</div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-emerald-500/30 h-full flex flex-col items-center">
               <h3 className="text-lg font-semibold mb-6 text-slate-300">Database Per Service</h3>
               
               <div className="flex gap-8">
                 <div className="flex flex-col items-center gap-4">
                   <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-emerald-500/50 flex flex-col items-center">
                      <Server size={20} className="mb-2 text-emerald-400"/> Order Svc
                   </div>
                   <div className="h-4 border-l-2 border-dashed border-emerald-500/50"></div>
                   <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex flex-col items-center">
                      <Database size={24} className="text-emerald-500 mb-1" />
                      <span className="text-[10px] font-mono text-slate-400">Postgres</span>
                   </div>
                 </div>

                 <div className="flex flex-col items-center gap-4">
                   <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-emerald-500/50 flex flex-col items-center">
                      <Server size={20} className="mb-2 text-emerald-400"/> User Svc
                   </div>
                   <div className="h-4 border-l-2 border-dashed border-emerald-500/50"></div>
                   <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex flex-col items-center">
                      <Database size={24} className="text-blue-500 mb-1" />
                      <span className="text-[10px] font-mono text-slate-400">MongoDB</span>
                   </div>
                 </div>
               </div>
               
               <p className="text-xs text-slate-500 mt-6 text-center">Encapsulates data. Allows choosing the right DB type (Polyglot persistence).</p>
            </div>
          </div>

        </div>
        
        {/* SVG Defs for arrows */}
        <svg width="0" height="0">
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="currentColor" />
            </marker>
          </defs>
        </svg>

      </div>
    </div>
  </AnimatedSection>
);

// --- MAIN APPLICATION ---

export default function App() {
  const [activeTab, setActiveTab] = useState('monolith');

  // Inject Custom Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = globalStyles;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  const navItems = [
    { id: 'monolith', label: 'Monolith vs Microservices', icon: Layers },
    { id: 'proscons', label: 'Advantages & Disadvantages', icon: Split },
    { id: 'whennot', label: 'When NOT to use', icon: AlertTriangle },
    { id: 'decomp', label: 'Decomposition Strategies', icon: GitMerge },
    { id: 'dbper', label: 'Database per Service', icon: Database },
  ];

  return (
    <div className="flex h-screen w-full font-custom text-slate-200 overflow-hidden bg-[#0f172a]">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar Navigation */}
      <aside className="w-80 border-r border-white/5 bg-slate-900/50 backdrop-blur-xl flex flex-col z-10 shadow-2xl relative">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 text-cyan-400 mb-2">
            <TerminalSquare size={28} />
            <h1 className="text-xl font-bold tracking-tight">Arch. Fundamentals</h1>
          </div>
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">System Design Prep</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                  }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-cyan-500/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                  <Icon size={18} />
                </div>
                <span className="font-medium text-sm text-left leading-tight">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-6 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-2 text-xs text-slate-500 justify-center font-mono">
            <Code2 size={14} /> Interactive Interview Guide
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden p-8 lg:p-16 z-10">
        <div className="max-w-5xl mx-auto h-full pb-20">
          {activeTab === 'monolith' && <MonolithVsMicroservices />}
          {activeTab === 'proscons' && <ProsAndCons />}
          {activeTab === 'whennot' && <WhenNotToUse />}
          {activeTab === 'decomp' && <DecompositionStrategies />}
          {activeTab === 'dbper' && <DatabasePerService />}
        </div>
      </main>
    </div>
  );
}