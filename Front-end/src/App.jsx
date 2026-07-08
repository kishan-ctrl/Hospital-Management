import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FloatingPanels from './components/FloatingPanels';
import Services from './components/Services';
import Stats from './components/Stats';
import WhyChooseUs from './components/WhyChooseUs';
import News from './components/News';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import { ArrowRight, HeartPulse } from 'lucide-react';
import './App.css';

function App() {
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);

  const openAppointment = () => setAppointmentModalOpen(true);
  const closeAppointment = () => setAppointmentModalOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      
      {/* Navbar Header */}
      <Header onBookClick={openAppointment} />

      {/* Hero Section */}
      <Hero onBookClick={openAppointment} />

      {/* Floating help panel below hero */}
      <FloatingPanels onBookClick={openAppointment} />

      {/* Services grid */}
      <Services onBookClick={openAppointment} />

      {/* Counter Statistics banner */}
      <Stats />

      {/* Why Choose Us & Emergency card */}
      <WhyChooseUs onBookClick={openAppointment} />

      {/* Health News & Articles */}
      <News />

      {/* ----------------- PRE-FOOTER CTA BANNER ----------------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl bg-gradient-to-r from-teal-500 to-blue-600 p-8 sm:p-12 relative overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          
          {/* Transparent Watermark Plus Cross */}
          <div className="absolute right-10 bottom-0 opacity-10 text-white pointer-events-none transform translate-y-1/4">
            <HeartPulse className="h-72 w-72" />
          </div>

          <div className="text-left space-y-3 relative z-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Your Health is Our Priority</h2>
            <p className="text-teal-50 text-xs sm:text-sm font-semibold max-w-lg leading-relaxed">
              Let us take care of you and your family with trusted healthcare services.
            </p>
          </div>

          <div className="relative z-10 shrink-0 flex items-center gap-4">
            <button 
              onClick={openAppointment}
              className="rounded-full bg-white text-teal-600 px-8 py-4 text-xs font-bold uppercase tracking-wider shadow-md hover:bg-slate-50 transition active:scale-95 flex items-center gap-2"
            >
              Book Your Appointment Now
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
            <div className="hidden lg:flex h-12 w-12 items-center justify-center rounded-full bg-teal-400/20 text-white border border-white/20">
              <HeartPulse className="h-6 w-6" />
            </div>
          </div>

        </div>
      </section>

      {/* Footer component */}
      <Footer />

      {/* Booking Appointment modal dialog */}
      <BookingModal isOpen={appointmentModalOpen} onClose={closeAppointment} />

    </div>
  );
}

export default App;
