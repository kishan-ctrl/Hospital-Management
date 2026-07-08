import React from 'react';
import { Search, Calendar, Pill, FlaskConical, ShieldCheck, ChevronRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function FloatingPanels({ onBookClick }) {
  const panels = [
    {
      title: 'Find a Doctor',
      desc: 'Connect with our specialist doctors.',
      icon: Search,
      actionText: 'Find now',
      actionLink: null,
      onClick: onBookClick,
      color: 'blue',
    },
    {
      title: 'Book Appointment',
      desc: 'Schedule an appointment easily.',
      icon: Calendar,
      actionText: 'Schedule now',
      actionLink: null,
      onClick: onBookClick,
      color: 'teal',
    },
    {
      title: 'Pharmacy',
      desc: 'Wide range of medicines at your fingertips.',
      icon: Pill,
      actionText: 'Order medicines',
      actionLink: '#services-section',
      onClick: null,
      color: 'blue',
    },
    {
      title: 'Lab Tests',
      desc: 'Accurate & reliable diagnostic tests.',
      icon: FlaskConical,
      actionText: 'Book test',
      actionLink: '#services-section',
      onClick: null,
      color: 'teal',
    },
    {
      title: 'Health Packages',
      desc: 'Preventive health checkup packages.',
      icon: ShieldCheck,
      actionText: 'View packages',
      actionLink: null,
      onClick: onBookClick,
      color: 'darkBlue',
    },
  ];

  const colorConfigs = {
    blue: {
      cardBg: 'bg-blue-50/40 hover:bg-blue-50 hover:border-blue-200/80 hover:shadow-blue-500/5',
      iconBg: 'bg-blue-600',
      textBtn: 'text-blue-600 hover:text-blue-800',
    },
    teal: {
      cardBg: 'bg-teal-50/30 hover:bg-teal-50/70 hover:border-teal-200/80 hover:shadow-teal-500/5',
      iconBg: 'bg-teal-500',
      textBtn: 'text-teal-600 hover:text-teal-800',
    },
    darkBlue: {
      cardBg: 'bg-blue-50/40 hover:bg-blue-50 hover:border-blue-200/80 hover:shadow-blue-900/5',
      iconBg: 'bg-blue-900',
      textBtn: 'text-blue-900 hover:text-blue-950',
    },
  };

  return (
    <section className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-white p-6 md:p-8 shadow-xl border border-slate-100/80">
          
          <ScrollReveal delay={50} className="text-center mb-6">
            <h2 className="text-lg font-extrabold text-blue-950">How Can We Help You?</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {panels.map((panel, idx) => {
              const Icon = panel.icon;
              const config = colorConfigs[panel.color];
              
              const cardContent = (
                <div className={`group rounded-2xl p-5 border border-slate-100/80 transition-all duration-300 text-left flex flex-col justify-between h-full hover:-translate-y-1.5 hover:shadow-md ${config.cardBg}`}>
                  <div>
                    <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-white group-hover:scale-110 group-hover:rotate-3 transition duration-300 ${config.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-blue-950">{panel.title}</h3>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
                      {panel.desc}
                    </p>
                  </div>
                  
                  {panel.onClick ? (
                    <button 
                      onClick={panel.onClick}
                      className={`mt-4 flex items-center gap-1 text-[11px] font-extrabold transition text-left cursor-pointer ${config.textBtn}`}
                    >
                      {panel.actionText} 
                      <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ) : (
                    <a 
                      href={panel.actionLink}
                      className={`mt-4 flex items-center gap-1 text-[11px] font-extrabold transition text-left ${config.textBtn}`}
                    >
                      {panel.actionText} 
                      <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  )}
                </div>
              );

              return (
                <ScrollReveal key={idx} delay={idx * 100} className="h-full">
                  {cardContent}
                </ScrollReveal>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}

