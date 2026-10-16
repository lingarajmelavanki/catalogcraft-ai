import React from 'react';
import { ShieldCheck, Lock, CheckSquare, AlertOctagon, UserCheck, FileText } from 'lucide-react';

export const ResponsibleAI: React.FC = () => {
  const policies = [
    {
      title: 'Human-in-the-Loop Review Mandatory',
      desc: 'All AI-generated descriptions require explicit human review and approval before publishing to live e-commerce storefronts.',
      icon: UserCheck,
    },
    {
      title: 'Strict Grounding in Product Specs',
      desc: 'The system strictly uses provided product structured data. It will never invent unverified technical specifications, dimensions, materials, or prices.',
      icon: CheckSquare,
    },
    {
      title: 'Data Privacy & Zero PII Policy',
      desc: 'CatalogCraft AI must not be used with customer personal data, passwords, or confidential retail financial secrets.',
      icon: Lock,
    },
    {
      title: 'Verification of Legal Claims',
      desc: 'Pricing, warranties, safety certificates, and promotional statements must be independently validated by human merchandisers.',
      icon: AlertOctagon,
    },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Responsible AI Framework & Ethics Statement
        </h1>
        <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Enterprise guidelines for ethical AI content generation, safety guardrails, and compliance oversight.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.map((p, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <p.icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{p.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 text-slate-300 border border-slate-800 rounded-2xl p-6 space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" /> TCS Technology Day Prototype Commitment
        </h3>
        <p className="leading-relaxed">
          CatalogCraft AI is designed specifically to assist retail merchandisers and copywriters by accelerating draft creation while eliminating hallucinated product details through strict schema validation and quality scoring guardrails.
        </p>
      </div>
    </div>
  );
};
