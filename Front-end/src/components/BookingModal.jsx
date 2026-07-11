import React, { useState, useEffect, useRef } from 'react';
import { Calendar, X, CheckCircle2, ShieldAlert, User, Clock, AlertCircle, Mic, MicOff } from 'lucide-react';
import API_BASE_URL from "../config/api";

export default function BookingModal({ isOpen, onClose, user, onPromptLogin }) {
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [doctors, setDoctors] = useState([]);
  
  const [formData, setFormData] = useState({
    doctor: '',
    date: '',
    timeSlot: 'Morning (9:00 AM - 12:00 PM)',
    symptoms: '',
    notes: '',
  });

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startVoiceRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice Recognition is not supported by your browser. Please try Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setFormData((prev) => ({
        ...prev,
        symptoms: prev.symptoms ? prev.symptoms + ' ' + speechToText : speechToText,
      }));
    };

    recognition.start();
  };

  // Fetch active doctors list from database when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/doctors`);
        if (response.ok) {
          const resData = await response.json();
          setDoctors(resData.data.doctors || []);
          
          // Pre-select first doctor by default if list is not empty
          if (resData.data.doctors && resData.data.doctors.length > 0) {
            setFormData(prev => ({
              ...prev,
              doctor: resData.data.doctors[0]._id
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };

    fetchDoctors();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMsg('Session expired. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Scheduling failed. Please check inputs.');
      }

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        onClose();
        // Reset form
        setFormData({
          doctor: doctors.length > 0 ? doctors[0]._id : '',
          date: '',
          timeSlot: 'Morning (9:00 AM - 12:00 PM)',
          symptoms: '',
          notes: '',
        });
      }, 2500);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-md p-4 overflow-y-auto transition-opacity duration-300">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl z-10 text-left transition-all duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 text-teal-500 shadow-sm mb-6">
          <Calendar className="h-7 w-7" />
        </div>

        <h2 className="text-2xl font-extrabold text-blue-950 tracking-tight text-center">Book Appointment</h2>
        <p className="mt-1 text-slate-500 font-semibold text-xs text-center leading-relaxed">
          Schedule your clinical session in seconds. We will sync this with our records.
        </p>

        {/* Alert Box */}
        {errorMsg && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-start gap-2.5 animate-pulse">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Success Dialog */}
        {bookingSuccess ? (
          <div className="mt-8 p-6 text-center space-y-3 rounded-2xl bg-teal-50 border border-teal-100 animate-scale-in">
            <CheckCircle2 className="h-10 w-10 text-teal-500 mx-auto animate-bounce" />
            <h4 className="text-sm font-extrabold text-blue-950">Appointment Confirmed!</h4>
            <p className="text-[11px] font-semibold text-slate-500">
              Your appointment has been registered in the database. A confirmation email has been dispatched.
            </p>
          </div>
        ) : (
          /* Authentication Conditional Check */
          !user ? (
            <div className="mt-6 p-6 rounded-2xl border border-slate-100 bg-slate-50/50 text-center space-y-4">
              <AlertCircle className="h-9 w-9 text-blue-600 mx-auto" />
              <div>
                <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">Login Required</h4>
                <p className="text-[11px] font-semibold text-slate-500 mt-1">
                  You must be logged in as a registered patient to book clinical appointments.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  onPromptLogin();
                  onClose();
                }}
                className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-blue-700 transition cursor-pointer"
              >
                Log In or Sign Up
              </button>
            </div>
          ) : (
            /* ================= LIVE BOOKING FORM ================= */
            <form onSubmit={handleBook} className="mt-6 space-y-4 text-left">
              
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Select Doctor</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <select 
                    required
                    value={formData.doctor}
                    onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                  >
                    {doctors.length === 0 ? (
                      <option value="">No doctors available</option>
                    ) : (
                      doctors.map((doc) => (
                        <option key={doc._id} value={doc.user._id}>
                          {doc.user.name} ({doc.specialization} - Fee: ${doc.consultationFee})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Selected Doctor Summary Card */}
              {formData.doctor && doctors.length > 0 && (() => {
                const selectedDoc = doctors.find(d => d.user?._id === formData.doctor);
                if (!selectedDoc) return null;
                return (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                    <img 
                      src={selectedDoc.profilePhoto || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'} 
                      alt={selectedDoc.user?.name || 'Doctor'} 
                      className="h-11 w-11 rounded-full object-cover border border-slate-200 shadow-2xs"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150';
                      }}
                    />
                    <div className="text-left space-y-0.5">
                      <p className="text-xs font-extrabold text-slate-900">Dr. {selectedDoc.user?.name}</p>
                      <p className="text-[10px] font-bold text-slate-500">{selectedDoc.specialization} • {selectedDoc.qualifications}</p>
                      <p className="text-[9px] font-extrabold text-blue-650">Consultation Fee: ${selectedDoc.consultationFee}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Appointment Date</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Preferred Time Slot</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400" />
                    <select 
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                    >
                      <option>Morning (9:00 AM - 12:00 PM)</option>
                      <option>Afternoon (12:00 PM - 4:00 PM)</option>
                      <option>Evening (4:00 PM - 7:00 PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Describe Symptoms (Reason for Appointment)
                  </label>
                  <button
                    type="button"
                    onClick={startVoiceRecognition}
                    className={`flex items-center justify-center p-1.5 rounded-full border cursor-pointer transition-all ${
                      isListening
                        ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                        : 'bg-teal-50 border-teal-100 text-teal-650 hover:bg-teal-100/50'
                    }`}
                    title={isListening ? "Listening... Click to stop" : "Speak and record reason"}
                  >
                    {isListening ? (
                      <MicOff className="h-3.5 w-3.5" />
                    ) : (
                      <Mic className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <textarea 
                  required
                  rows="3"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  placeholder="Describe your medical condition or symptoms..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Additional Notes (Optional)</label>
                <input 
                  type="text" 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Specify requests, allergies details, etc." 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors"
                />
              </div>

              <button 
                type="submit"
                disabled={loading || doctors.length === 0}
                className="shine-hover mt-4 w-full rounded-xl bg-teal-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-teal-500/20 hover:bg-teal-600 hover:-translate-y-0.5 active:translate-y-0 transition disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Confirming with Database...' : 'Book Appointment Now'}
              </button>
            </form>
          )
        )}

      </div>
    </div>
  );
}
