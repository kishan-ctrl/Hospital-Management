import React from 'react';
import { ArrowRight, Clock, ShieldCheck, Users } from 'lucide-react';
import { IMAGES } from '../constants/images';

export default function Hero({ onBookClick }) {
  return (
    <section id="home" className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden bg-slate-50">
      
      {/* Background Decorative Rings/Blobs */}
      <div className="absolute top-1/4 right-0 -z-10 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="absolute bottom-10 left-10 -z-10 h-72 w-72 rounded-full bg-blue-400/10 blur-2xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            <span className="inline-flex items-center rounded-full bg-teal-50 px-4 py-1.5 text-xs font-extrabold tracking-widest text-teal-600 uppercase border border-teal-100">
              YOUR HEALTH, OUR PRIORITY
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-blue-950 tracking-tight">
              Better Science.<br />
              <span className="text-teal-500">Better Health.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 max-w-xl font-medium leading-relaxed">
              We are committed to improving and extending lives through innovative medicines and trusted healthcare solutions.
            </p>

            {/* Action row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a 
                href="#our-services"
                className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-teal-500/25 transition duration-300 hover:bg-teal-600 hover:-translate-y-0.5 active:translate-y-0"
              >
                Explore Services
                <ArrowRight className="h-4 w-4" />
              </a>
              
              <button 
                onClick={onBookClick}
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-7 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 transition duration-300 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50/30"
              >
                Find a Doctor
              </button>
            </div>

            {/* Social Proof Avatars */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-200/60 max-w-md">
              <div className="flex -space-x-3">
                {[IMAGES.avatar1, IMAGES.avatar2, IMAGES.avatar3, IMAGES.avatar4].map((avatar, idx) => (
                  <img 
                    key={idx}
                    className="h-10 w-10 rounded-full border-2 border-white object-cover" 
                    src={avatar} 
                    alt="Doctor Avatar" 
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-extrabold text-blue-950">100K+</p>
                <p className="text-xs font-semibold text-slate-500">Patients Trust Us</p>
              </div>
            </div>

          </div>

          {/* Right Column Doctor/Lab Image */}
          <div className="lg:col-span-6 relative flex justify-center">
            
            {/* Main doctor image container */}
            <div className="relative w-full max-w-lg aspect-square sm:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-200">
              <img 
                className="h-full w-full object-cover object-top" 
                src={IMAGES.heroDoctor} 
                alt="Professional Scientific Doctor" 
              />
              
              {/* Glowing Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-transparent" />
            </div>

            {/* OVERLAPPING FLOATING CARDS */}
            
            {/* Card 1: 24/7 Emergency Support */}
            <div className="absolute -left-6 top-10 glass-panel p-4.5 rounded-2xl shadow-lg border border-white/60 max-w-[190px] text-left animate-pulse-subtle flex gap-3.5 items-start">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md shadow-teal-500/20">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-blue-950">24/7</h4>
                <p className="text-[10px] font-semibold text-slate-500 leading-snug">Emergency Support</p>
              </div>
            </div>

            {/* Card 2: Certified Medicines */}
            <div className="absolute -right-6 top-1/3 glass-panel p-4.5 rounded-2xl shadow-lg border border-white/60 max-w-[190px] text-left flex gap-3.5 items-start">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-blue-950">Certified</h4>
                <p className="text-[10px] font-semibold text-slate-500 leading-snug">Quality Medicines</p>
              </div>
            </div>

            {/* Card 3: Trusted by 100K+ */}
            <div className="absolute -left-4 bottom-8 glass-panel p-4.5 rounded-2xl shadow-lg border border-white/60 max-w-[190px] text-left flex gap-3.5 items-start">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white shadow-md shadow-blue-900/20">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-blue-950">Trusted by</h4>
                <p className="text-[10px] font-semibold text-slate-500 leading-snug">100K+ Happy Patients</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
