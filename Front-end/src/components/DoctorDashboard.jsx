import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartPulse, 
  LogOut, 
  FileText, 
  FileSpreadsheet,
  UploadCloud, 
  User, 
  CheckCircle, 
  AlertCircle, 
  File, 
  UserCheck, 
  Plus, 
  Search, 
  ClipboardList, 
  Activity, 
  Download,
  Calendar,
  Layers,
  Users,
  Shield,
  Clock,
  PhoneCall,
  MapPin,
  Trash2,
} from 'lucide-react';
import API_BASE_URL from "../config/api";

export default function DoctorDashboard({ user, onLogout }) {
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Doctor profile details
  const [doctorProfile, setDoctorProfile] = useState(null);

  // Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    patient: '',
    diagnosis: '',
    treatmentPlan: '',
    notes: ''
  });
  
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedFilePreview, setAttachedFilePreview] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  // Search filters
  const [searchTerm, setSearchTerm] = useState('');
  const [historySearchTerm, setHistorySearchTerm] = useState('');

  // Fetch Patients and Doctor Profile on Load
  useEffect(() => {
    fetchPatients();
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const resData = await response.json();
        setDoctorProfile(resData.data.profileDetails);
      }
    } catch (err) {
      console.error('Error fetching doctor profile details:', err);
    }
  };

  const fetchPatients = async () => {
    setLoadingPatients(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const resData = await response.json();
        const patientData = resData.data.patients || [];
        setPatients(patientData);
        
        // Auto-select first patient in the form if exists
        if (patientData.length > 0) {
          setFormData(prev => ({ ...prev, patient: patientData[0].user._id }));
        }
      } else {
        console.error('Failed to fetch patients');
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Fetch Patient History
  const fetchPatientHistory = async (patientUserId) => {
    setLoadingHistory(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/medical-records/patient/${patientUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const resData = await response.json();
        setMedicalHistory(resData.data.history || []);
      } else {
        setMedicalHistory([]);
      }
    } catch (err) {
      console.error('Error fetching patient history:', err);
      setMedicalHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle patient card click
  const handleSelectPatient = (patient) => {
    setSelectedPatientForHistory(patient);
    setHistorySearchTerm('');
    fetchPatientHistory(patient.user._id);
  };

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle File Upload & Validations
  const handleFileChange = (e) => {
    setFileError('');
    setAttachedFilePreview(null);
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 5 MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('File exceeds the maximum size limit of 5 MB.');
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Check allowed types
    const allowedExtensions = /jpeg|jpg|png|webp|pdf/;
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.test(fileExtension) && !allowedExtensions.test(file.type)) {
      setFileError('Only image files (JPEG, PNG, WEBP) and PDF reports are allowed.');
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setAttachedFile(file);

    // Generate Preview for Images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear Selected File
  const handleClearFile = (e) => {
    e.stopPropagation();
    setAttachedFile(null);
    setAttachedFilePreview(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) {
      setErrorMsg('Please select a patient.');
      return;
    }
    if (!formData.diagnosis.trim()) {
      setErrorMsg('A diagnosis description is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const token = localStorage.getItem('token');
    const submissionData = new FormData();
    submissionData.append('patient', formData.patient);
    submissionData.append('diagnosis', formData.diagnosis);
    submissionData.append('treatmentPlan', formData.treatmentPlan);
    submissionData.append('notes', formData.notes);
    
    if (attachedFile) {
      submissionData.append('attachments', attachedFile);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/medical-records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submissionData
      });

      const resData = await response.json();

      if (response.ok) {
        setSuccessMsg('Medical record created successfully!');
        // Reset form details
        setFormData(prev => ({
          ...prev,
          diagnosis: '',
          treatmentPlan: '',
          notes: ''
        }));
        setAttachedFile(null);
        setAttachedFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        // If the submitted record was for the currently selected history patient, refresh history
        if (selectedPatientForHistory && selectedPatientForHistory.user._id === formData.patient) {
          fetchPatientHistory(formData.patient);
        }

        // Close form modal after a short delay
        setTimeout(() => {
          setIsFormOpen(false);
          setSuccessMsg('');
        }, 2000);
      } else {
        throw new Error(resData.message || 'Failed to create medical record.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phoneNumber?.includes(searchTerm)
  );

  const filteredHistory = medicalHistory.filter(h =>
    h.diagnosis?.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
    h.treatmentPlan?.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
    h.notes?.toLowerCase().includes(historySearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md shadow-xs border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-2.5 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:bg-teal-500 transition duration-300">
                <HeartPulse className="h-6.5 w-6.5" />
              </div>
              <div className="text-left">
                <span className="text-xl font-extrabold tracking-tight text-blue-900 block leading-none font-sans">
                  MediWell
                </span>
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase leading-none">
                  CLINIC
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-blue-50/60 px-4 py-2 rounded-2xl border border-blue-100">
              <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-xs font-extrabold text-blue-900">
                Doctor Panel
              </span>
            </div>

            {/* Support/Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-xs font-black text-blue-950">Dr. {user.name}</p>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{doctorProfile?.specialization || 'Clinical Practitioner'}</p>
              </div>

              <button 
                onClick={onLogout}
                className="flex items-center gap-2 rounded-full bg-rose-50 border border-rose-100 text-rose-600 px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-rose-100 active:scale-95 transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Patient List */}
        <section className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Doctor Info Card */}
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-xs text-left relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50/40 rounded-bl-full -z-10" />
            <h2 className="text-sm font-black text-blue-950 uppercase tracking-wider mb-3">Physician Profile</h2>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-extrabold">
                DR
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Dr. {user.name}</p>
                <p className="text-xs font-semibold text-slate-500">{doctorProfile?.qualifications || 'MBBS, MD'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Specialty</span>
                <span className="font-bold text-slate-700">{doctorProfile?.specialization || 'General Med'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Experience</span>
                <span className="font-bold text-slate-700">{doctorProfile?.experienceYears || '5+'} Years</span>
              </div>
            </div>
          </div>

          {/* Patient Directory */}
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-xs flex flex-col h-[520px]">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-black text-blue-950">Patient Directory</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {patients.length} Total
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-xs focus:border-blue-500 focus:outline-none bg-slate-50/50 transition-colors"
              />
            </div>

            {/* Patient Grid / List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {loadingPatients ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <Activity className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                  <span className="text-xs font-semibold">Loading patients...</span>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-semibold text-xs">
                  No active patients found.
                </div>
              ) : (
                filteredPatients.map((p) => (
                  <div 
                    key={p._id}
                    onClick={() => handleSelectPatient(p)}
                    className={`rounded-2xl p-4 border text-left transition-all duration-200 cursor-pointer ${
                      selectedPatientForHistory?._id === p._id
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                        : 'border-slate-100 hover:bg-slate-50 bg-slate-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-black ${selectedPatientForHistory?._id === p._id ? 'text-white' : 'text-blue-950'}`}>
                        {p.user?.name || 'Unnamed'}
                      </h3>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        selectedPatientForHistory?._id === p._id 
                          ? 'bg-white/20 text-white border border-white/10' 
                          : 'bg-blue-50 text-blue-700 border border-blue-100/50'
                      }`}>
                        {p.bloodGroup || 'O+'}
                      </span>
                    </div>
                    <p className={`text-[10px] font-semibold mt-1 ${selectedPatientForHistory?._id === p._id ? 'text-blue-100' : 'text-slate-500'}`}>
                      {p.user?.email}
                    </p>
                    <div className={`flex items-center justify-between mt-3 text-[10px] font-semibold ${
                      selectedPatientForHistory?._id === p._id ? 'text-blue-200' : 'text-slate-400'
                    }`}>
                      <span>Age: {new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()} Yrs</span>
                      <span>Gender: {p.gender}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Right Side: Patient Info & Medical History OR Default View */}
        <section className="flex-1 flex flex-col gap-6">
          
          {/* Default notice: since only doctors can create medical records */}
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
            <div className="absolute right-6 bottom-0 opacity-10 text-white pointer-events-none transform translate-y-1/4">
              <FileSpreadsheet className="h-44 w-44" />
            </div>
            <div className="relative z-10 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-teal-300" />
                <span className="text-[10px] font-extrabold tracking-widest bg-white/20 text-teal-100 uppercase px-3 py-1 rounded-full border border-white/10">
                  Doctor Privilege Mode
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                Clinical Health Records Authorization
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm font-bold max-w-xl leading-relaxed italic">
                "since only doctors can create medical records."
              </p>
            </div>
          </div>

          {selectedPatientForHistory ? (
            <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col flex-grow">
              
              {/* Profile Card Layout */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 border-b border-slate-100 pb-5 mb-5 text-left">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-blue-950 leading-none">{selectedPatientForHistory.user?.name}</h2>
                      <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase block mt-1">Patient File</span>
                    </div>
                  </div>
                  
                  {/* Detailed Demographics */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-500 pt-1.5">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-400" /> DOB: {new Date(selectedPatientForHistory.dateOfBirth).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><PhoneCall className="h-3.5 w-3.5 text-slate-400" /> {selectedPatientForHistory.phoneNumber}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {selectedPatientForHistory.address}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="shrink-0 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, patient: selectedPatientForHistory.user._id }));
                      setIsFormOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-extrabold text-xs uppercase px-5 py-3.5 shadow-md shadow-teal-500/20 active:scale-95 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    New Medical Record
                  </button>
                </div>
              </div>

              {/* Grid showing Allergies & Emergency Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2">Allergies</h4>
                  {selectedPatientForHistory.allergies && selectedPatientForHistory.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPatientForHistory.allergies.map((allergy, idx) => (
                        <span key={idx} className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg">
                      No Known Allergies
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">Emergency Contact</h4>
                  <p className="text-xs font-bold text-slate-700">
                    {selectedPatientForHistory.emergencyContact?.name} ({selectedPatientForHistory.emergencyContact?.relationship})
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                    Phone: {selectedPatientForHistory.emergencyContact?.phone}
                  </p>
                </div>
              </div>

              {/* History Details */}
              <div className="text-left flex-grow flex flex-col min-h-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h3 className="text-sm font-black text-slate-800">Clinical History List</h3>
                  
                  {/* Local History Filter */}
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Filter records..."
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-[10px] focus:border-blue-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* History list box */}
                <div className="overflow-y-auto space-y-4 max-h-[300px] pr-1 flex-1">
                  {loadingHistory ? (
                    <div className="flex justify-center py-12">
                      <Activity className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                  ) : filteredHistory.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-semibold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      {historySearchTerm ? "No matching records found." : "No clinical records found for this patient."}
                    </div>
                  ) : (
                    filteredHistory.map((record) => (
                      <div key={record._id} className="rounded-2xl border border-slate-100 p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                          <span className="text-xs font-extrabold text-blue-950 bg-blue-100/50 border border-blue-100/30 px-3 py-1 rounded-lg">
                            Diagnosis: {record.diagnosis}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            Recorded on: {new Date(record.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Treatment Plan</span>
                            <p className="text-xs font-bold text-slate-700">{record.treatmentPlan || 'N/A'}</p>
                          </div>
                          {record.notes && (
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Clinical Notes</span>
                              <p className="text-xs text-slate-600 font-semibold">{record.notes}</p>
                            </div>
                          )}

                          {record.attachments && record.attachments.length > 0 && (
                            <div className="pt-2">
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Scans & Attachments</span>
                              <div className="flex flex-wrap gap-2">
                                {record.attachments.map((file, idx) => (
                                  <a 
                                    key={idx}
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-white border border-slate-200 hover:border-blue-400 px-3 py-1.5 rounded-lg shadow-2xs transition"
                                  >
                                    <FileText className="h-3 w-3 text-rose-500" />
                                    <span className="truncate max-w-[120px]">{file.name}</span>
                                    <Download className="h-3 w-3 text-slate-400 shrink-0" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* Empty state message */
            <div className="rounded-3xl bg-white p-12 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center flex-1 h-[420px]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm mb-4">
                <UserCheck className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-blue-950">Select a Patient</h3>
              <p className="text-slate-500 font-semibold text-xs max-w-sm mt-1">
                Select a patient from the list on the left to view their complete medical profile, clinical history scans, and add new diagnosis records.
              </p>
            </div>
          )}

        </section>

      </main>

      {/* ================= NEW MEDICAL RECORD MODAL FORM ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-md p-4 overflow-y-auto transition-opacity duration-300">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl z-10 text-left my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button 
              onClick={() => {
                setIsFormOpen(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              <LogOut className="h-5 w-5 rotate-180" />
            </button>

            {/* Modal Header */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-55 border border-teal-100 text-teal-600 shadow-sm mb-4">
              <FileText className="h-7 w-7" />
            </div>

            <h2 className="text-xl font-black text-blue-950 tracking-tight text-center">
              Create Patient Medical Record
            </h2>
            <p className="mt-1.5 text-slate-500 font-semibold text-xs text-center leading-relaxed italic">
              "since only doctors can create medical records."
            </p>

            {/* Alerts */}
            {errorMsg && (
              <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div>{errorMsg}</div>
              </div>
            )}
            {successMsg && (
              <div className="mt-4 p-4 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold flex items-start gap-2.5">
                <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div>{successMsg}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              
              {/* Choose Patient */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Choose a Patient
                </label>
                <select 
                  name="patient"
                  value={formData.patient}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors cursor-pointer font-bold"
                  required
                >
                  <option value="" disabled>-- Select a Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p.user?._id}>
                      {p.user?.name} ({p.user?.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Diagnosis
                </label>
                <input 
                  type="text" 
                  name="diagnosis"
                  required 
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  placeholder="e.g. High Fever" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors font-bold"
                />
              </div>

              {/* Treatment */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Treatment
                </label>
                <input 
                  type="text" 
                  name="treatmentPlan"
                  required
                  value={formData.treatmentPlan}
                  onChange={handleInputChange}
                  placeholder="e.g. Paracetamol" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors font-bold"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Notes
                </label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="e.g. Patient recovering well." 
                  rows="3"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-xs focus:border-teal-500 focus:outline-none bg-slate-50/50 transition-colors resize-none font-bold"
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Upload a file (Maximum 5 MB)
                </label>
                <div className="relative border-2 border-dashed border-slate-200 hover:border-teal-500 transition rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/30">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  
                  {attachedFilePreview ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 mb-2">
                      <img src={attachedFilePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={handleClearFile}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-xl p-1 hover:bg-red-600 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : attachedFile ? (
                    <div className="flex flex-col items-center mb-2">
                      <div className="relative h-12 w-12 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center text-blue-600 mb-1">
                        <FileText className="h-6 w-6" />
                        <button 
                          type="button"
                          onClick={handleClearFile}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                      <span className="text-[10px] font-black text-slate-600 truncate max-w-[150px]">{attachedFile.name}</span>
                      <span className="text-[8px] text-slate-400 font-bold">{(attachedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                      <span className="text-xs font-bold text-slate-600">
                        Choose any image or report.pdf
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 font-semibold">
                        PNG, JPG, WEBP or PDF (max. 5MB)
                      </span>
                    </>
                  )}
                </div>
                {fileError && (
                  <p className="mt-1 text-[10px] font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {fileError}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button 
                type="submit"
                disabled={submitting || !!fileError}
                className="mt-6 w-full rounded-xl bg-teal-500 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-teal-500/20 hover:bg-teal-600 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? 'Creating Medical Record...' : 'Create Medical Record'}
              </button>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}
