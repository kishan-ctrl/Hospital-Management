import React from 'react';
import { HeartPulse, CheckCircle2, ArrowRight, Building2, Phone } from 'lucide-react';
import { IMAGES } from '../constants/images';

export default function WhyChooseUs({ onBookClick }) {
  return (
    <section id="about-us" className="py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Building Image with Mission Badge */}
          <div className="lg:col-span-4 relative rounded-3xl overflow-hidden min-h-[350px] shadow-lg bg-slate-200">
            <img 
              className="h-full w-full object-cover" 
              src={IMAGES.building} 
              alt="MediWell Pharma modern clinical hospital building" 
            />
            
            {/* Curved Floating Mission Badge */}
            <div className="absolute bottom-5 left-5 right-5 glass-panel p-4.5 rounded-2xl border border-white/60 text-left">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-white">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">Our Mission</h4>
                  <p className="mt-1 text-[11px] font-semibold text-slate-600 leading-relaxed">
                    To deliver quality healthcare with compassion and innovation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Why Choose Us details */}
          <div className="lg:col-span-5 space-y-6 text-left flex flex-col justify-center py-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
                Why Choose <span className="text-teal-500">MediWell</span> Pharma?
              </h2>
              <p className="mt-3.5 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                We combine innovation, expertise, and care to deliver the best healthcare experience.
              </p>
            </div>

            {/* Bullet list with custom checkmarks */}
            <ul className="space-y-3.5">
              {[
                'WHO-GMP Certified',
                'High Quality & Safe Medicines',
                'Affordable & Accessible Healthcare',
                'Experienced & Caring Professionals',
                'Advanced Technology & Facilities',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-teal-50 text-teal-600 border border-teal-100">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-700">{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <button 
                onClick={onBookClick}
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 transition duration-300 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50/10"
              >
                Learn More About Us
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right: Emergency Help Card */}
          <div className="lg:col-span-3 rounded-3xl bg-blue-600 text-white p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
            {/* Background ambulance watermark/pattern */}
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none scale-150 transform translate-x-1/4 -translate-y-1/4">
              <Building2 className="h-48 w-48" />
            </div>

            <div className="space-y-4 relative text-left">
              <h3 className="text-lg font-extrabold tracking-tight">Need Emergency Help?</h3>
              <p className="text-xs text-blue-100 font-medium leading-relaxed">
                We are available 24/7 for emergencies. Your health is our priority.
              </p>
            </div>

            <div className="my-6 relative rounded-2xl overflow-hidden bg-blue-700 border border-blue-500 h-28">
              <img 
                className="h-full w-full object-cover" 
                src={IMAGES.ambulance} 
                alt="Emergency Ambulance service" 
              />
            </div>

            <div className="relative">
              <a 
                href="tel:+12345678900" 
                className="flex items-center justify-center gap-3 w-full rounded-2xl bg-white text-blue-900 py-4 shadow-md font-extrabold hover:bg-blue-50 transition active:scale-95"
              >
                <Phone className="h-5 w-5 text-blue-600 animate-bounce" />
                +1 234 567 8900
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
