import React from 'react';
import { Award, Users, HeartPulse, Building2 } from 'lucide-react';

export default function Stats() {
  const statsList = [
    { label: 'Years of Excellence', value: '25+', icon: Award },
    { label: 'Expert Doctors', value: '150+', icon: Users },
    { label: 'Medical Services', value: '500+', icon: HeartPulse, isWide: true },
    { label: 'Happy Patients', value: '100K+', icon: Users },
    { label: 'Healthcare Centers', value: '50+', icon: Building2 },
  ];

  return (
    <section className="bg-gradient-to-r from-teal-500 to-blue-600 text-white py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/5 opacity-10 bg-grid" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
          {statsList.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className={`space-y-1 ${stat.isWide ? 'col-span-2 md:col-span-1' : ''}`}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-teal-100">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-3xl font-extrabold tracking-tight pt-1">{stat.value}</p>
                <p className="text-xs font-semibold text-teal-100 uppercase tracking-wider">{stat.label}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
