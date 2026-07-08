import React from 'react';
import { Search, Calendar, Pill, FlaskConical, ShieldCheck, ChevronRight } from 'lucide-react';

export default function FloatingPanels({ onBookClick }) {
  return (
    <section className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-white p-6 md:p-8 shadow-xl border border-slate-100/80">
          
          <div className="text-center mb-6">
            <h2 className="text-lg font-extrabold text-blue-950">How Can We Help You?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Find a Doctor */}
            <div className="group rounded-2xl bg-blue-50/50 p-5 border border-blue-100/50 hover:bg-blue-50 hover:border-blue-200 transition duration-300 text-left flex flex-col justify-between">
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white group-hover:scale-110 transition duration-300">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-blue-950">Find a Doctor</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Connect with our specialist doctors.
                </p>
              </div>
              <button 
                onClick={onBookClick}
                className="mt-4 flex items-center gap-1 text-[11px] font-extrabold text-blue-600 hover:text-blue-800 transition text-left"
              >
                Find now <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Book Appointment */}
            <div className="group rounded-2xl bg-teal-50/40 p-5 border border-teal-100/40 hover:bg-teal-50 hover:border-teal-200 transition duration-300 text-left flex flex-col justify-between">
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white group-hover:scale-110 transition duration-300">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-blue-950">Book Appointment</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Schedule an appointment easily.
                </p>
              </div>
              <button 
                onClick={onBookClick}
                className="mt-4 flex items-center gap-1 text-[11px] font-extrabold text-teal-600 hover:text-teal-800 transition text-left"
              >
                Schedule now <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Pharmacy */}
            <div className="group rounded-2xl bg-blue-50/50 p-5 border border-blue-100/50 hover:bg-blue-50 hover:border-blue-200 transition duration-300 text-left flex flex-col justify-between">
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white group-hover:scale-110 transition duration-300">
                  <Pill className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-blue-950">Pharmacy</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Wide range of medicines at your fingertips.
                </p>
              </div>
              <a 
                href="#services-section"
                className="mt-4 flex items-center gap-1 text-[11px] font-extrabold text-blue-600 hover:text-blue-800 transition text-left"
              >
                Order medicines <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Lab Tests */}
            <div className="group rounded-2xl bg-teal-50/40 p-5 border border-teal-100/40 hover:bg-teal-50 hover:border-teal-200 transition duration-300 text-left flex flex-col justify-between">
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white group-hover:scale-110 transition duration-300">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-blue-950">Lab Tests</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Accurate & reliable diagnostic tests.
                </p>
              </div>
              <a 
                href="#services-section"
                className="mt-4 flex items-center gap-1 text-[11px] font-extrabold text-teal-600 hover:text-teal-800 transition text-left"
              >
                Book test <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Health Packages */}
            <div className="group rounded-2xl bg-blue-50/50 p-5 border border-blue-100/50 hover:bg-blue-50 hover:border-blue-200 transition duration-300 text-left flex flex-col justify-between">
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white group-hover:scale-110 transition duration-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-blue-950">Health Packages</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Preventive health checkup packages.
                </p>
              </div>
              <button 
                onClick={onBookClick}
                className="mt-4 flex items-center gap-1 text-[11px] font-extrabold text-blue-900 hover:text-blue-950 transition text-left"
              >
                View packages <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
