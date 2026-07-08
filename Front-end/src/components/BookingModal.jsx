import React, { useState } from 'react';
import { Calendar, X, CheckCircle2 } from 'lucide-react';

export default function BookingModal({ isOpen, onClose }) {
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'General Consultation',
    date: '',
    time: 'Morning',
  });

  const handleBook = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: 'General Consultation',
        date: '',
        time: 'Morning',
      });
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
      
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl z-10 text-left">
        
        {/* Close */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 text-teal-500 shadow-sm mb-6">
          <Calendar className="h-7 w-7" />
        </div>

        <h2 className="text-2xl font-extrabold text-blue-950 tracking-tight text-center">Book Appointment</h2>
        <p className="mt-1 text-slate-500 font-semibold text-xs text-center leading-relaxed">
          Schedule your session in a few seconds. We'll send details to your email.
        </p>

        {bookingSuccess ? (
          <div className="mt-8 p-6 text-center space-y-3 rounded-2xl bg-teal-50 border border-teal-100">
            <CheckCircle2 className="h-10 w-10 text-teal-500 mx-auto animate-bounce" />
            <h4 className="text-sm font-extrabold text-blue-950">Appointment Requested!</h4>
            <p className="text-[11px] font-semibold text-slate-500">We will verify and contact you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleBook} className="mt-6 space-y-4 text-left">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe" 
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs focus:border-teal-500 focus:outline-hidden bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Email</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs focus:border-teal-500 focus:outline-hidden bg-slate-50/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1 (555) 000-0000" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs focus:border-teal-500 focus:outline-hidden bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Select Department</label>
              <select 
                value={formData.service}
                onChange={(e) => setFormData({...formData, service: e.target.value})}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs focus:border-teal-500 focus:outline-hidden bg-slate-50/50"
              >
                <option>General Consultation</option>
                <option>Pharmacy / Prescription</option>
                <option>Cardiology / Heart</option>
                <option>Neurology / Brain</option>
                <option>Pathology / Lab Test</option>
                <option>Pediatrics / Child Care</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Date</label>
                <input 
                  type="date" 
                  required 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs focus:border-teal-500 focus:outline-hidden bg-slate-50/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Preferred Time</label>
                <select 
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs focus:border-teal-500 focus:outline-hidden bg-slate-50/50"
                >
                  <option>Morning (9:00 AM - 12:00 PM)</option>
                  <option>Afternoon (12:00 PM - 4:00 PM)</option>
                  <option>Evening (4:00 PM - 7:00 PM)</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="mt-4 w-full rounded-xl bg-teal-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-teal-500/20 hover:bg-teal-600 transition"
            >
              Book Session Now
            </button>
          </form>
        )}

      </div>

    </div>
  );
}
