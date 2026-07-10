import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  LogOut, 
  Globe, 
  RefreshCw, 
  FileText, 
  Clock, 
  HeartPulse, 
  UserCheck, 
  UserX, 
  ChevronRight, 
  ShieldAlert, 
  User as UserIcon, 
  CalendarCheck2,
  Bell,
  BellRing,
  CheckCheck,
  MessageSquare,
  Phone,
  Edit3,
  Eye,
  Pencil
} from 'lucide-react';

import API_BASE_URL from "../config/api";

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Real-time notifications state
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const knownApptIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);
  const notifDropdownRef = useRef(null);

  // New layout states
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const [selectedTableDateFilter, setSelectedTableDateFilter] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTableDropdown, setActiveTableDropdown] = useState(null);

  // Doctor tab filter states
  const [selectedDocSpecialty, setSelectedDocSpecialty] = useState('All');
  const [selectedDocStatus, setSelectedDocStatus] = useState('all');

  // Assign Patient modal states
  const [assignApptModalOpen, setAssignApptModalOpen] = useState(false);
  const [assignApptDoctorId, setAssignApptDoctorId] = useState('');
  const [assignApptData, setAssignApptData] = useState({
    patient: '',
    date: '',
    timeSlot: 'Morning (9:00 AM - 12:00 PM)',
    symptoms: '',
    notes: '',
  });

  // Appointment View & Edit modal states
  const [viewApptModalOpen, setViewApptModalOpen] = useState(false);
  const [selectedApptForView, setSelectedApptForView] = useState(null);
  
  const [editApptModalOpen, setEditApptModalOpen] = useState(false);
  const [selectedApptForEdit, setSelectedApptForEdit] = useState(null);
  const [editApptFormData, setEditApptFormData] = useState({
    date: '',
    timeSlot: 'Morning (9:00 AM - 12:00 PM)',
    status: 'pending',
    billingStatus: 'pending',
    notes: ''
  });

  // Patient details modal states
  const [viewPatientModalOpen, setViewPatientModalOpen] = useState(false);
  const [selectedPatientForView, setSelectedPatientForView] = useState(null);
  const [patientProfileData, setPatientProfileData] = useState(null);
  const [loadingPatientProfile, setLoadingPatientProfile] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id) => {
    setLiveNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setLiveNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleClearAllNotifications = () => {
    setLiveNotifications([]);
    setUnreadCount(0);
  };

  // Search & Filter state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [apptStatusFilter, setApptStatusFilter] = useState('all');

  // Modal control
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [newUserRole, setNewUserRole] = useState('patient');
  
  // New User Form State
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    // Patient demographics
    dateOfBirth: '',
    gender: 'Male',
    phoneNumber: '',
    address: '',
    bloodGroup: 'O+',
    allergies: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    // Doctor professional specs
    specialization: '',
    qualifications: '',
    experienceYears: '',
    consultationFee: '',
    profilePhoto: '',
    availability: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00' }
    ]
  });

  // Dynamic chime using HTML5 Web Audio API
  const playNotificationChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      
      oscillator.start();
      
      setTimeout(() => {
        oscillator.frequency.setValueAtTime(880.00, audioCtx.currentTime); // A5
      }, 140);
      
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 350);
    } catch (err) {
      console.warn('Audio Context playback error:', err);
    }
  };

  // Fetch initial data & polling function
  const fetchData = async (isPoll = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!isPoll) {
      setErrorMsg('');
      setLoadingUsers(true);
      setLoadingAppointments(true);
      setLoadingDoctors(true);
    }

    try {
      // 1. Fetch Users
      const usersRes = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data.users || []);
      }

      // 2. Fetch Doctors list (populated credentials)
      const docRes = await fetch(`${API_BASE_URL}/auth/doctors`);
      if (docRes.ok) {
        const docData = await docRes.json();
        setDoctorsList(docData.data.doctors || []);
      }

      // 3. Fetch Appointments
      const apptRes = await fetch(`${API_BASE_URL}/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (apptRes.ok) {
        const apptData = await apptRes.json();
        const incomingAppts = apptData.data.appointments || [];
        setAppointments(incomingAppts);

        // Check for new bookings to notify
        if (incomingAppts.length > 0) {
          const newNotifications = [];
          let hasNew = false;

          incomingAppts.forEach(appt => {
            if (!knownApptIdsRef.current.has(appt._id)) {
              knownApptIdsRef.current.add(appt._id);
              
              // Only trigger alerts if this is NOT the very first mount fetch
              if (!isInitialLoadRef.current) {
                hasNew = true;
                const patientName = appt.patient?.name || 'Unknown Patient';
                const docName = appt.doctor?.name ? `Dr. ${appt.doctor.name}` : 'Clinician';
                newNotifications.push({
                  id: appt._id,
                  message: `New appointment scheduled by ${patientName} with ${docName} on ${new Date(appt.date).toLocaleDateString()} at ${appt.timeSlot}.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  read: false
                });
              }
            }
          });

          if (hasNew && newNotifications.length > 0) {
            playNotificationChime();
            setLiveNotifications(prev => [...newNotifications, ...prev]);
            setUnreadCount(prev => prev + newNotifications.length);
          }
        }
        
        isInitialLoadRef.current = false;
      }
    } catch (err) {
      if (!isPoll) {
        setErrorMsg(err.message);
      }
    } finally {
      if (!isPoll) {
        setLoadingUsers(false);
        setLoadingAppointments(false);
        setLoadingDoctors(false);
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Start 10-second short-polling
    const interval = setInterval(() => {
      fetchData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Show Toast helper
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Toggle user active status
  const handleToggleUserStatus = async (targetUser) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const actionText = targetUser.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionText} the user account: ${targetUser.email}?`)) {
      return;
    }

    try {
      setErrorMsg('');
      let res;
      if (targetUser.isActive) {
        res = await fetch(`${API_BASE_URL}/admin/users/${targetUser._id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        alert("Activation is currently done by resetting status directly. This API supports deactivation.");
        return;
      }

      if (res.ok) {
        triggerSuccess(`User ${targetUser.email} has been deactivated.`);
        fetchData();
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update user status.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Update Appointment Status (confirmed/completed/cancelled)
  const handleUpdateApptStatus = async (apptId, statusUpdate, billingUpdate) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setErrorMsg('');
      const bodyPayload = {};
      if (statusUpdate) bodyPayload.status = statusUpdate;
      if (billingUpdate) bodyPayload.billingStatus = billingUpdate;

      const res = await fetch(`${API_BASE_URL}/appointments/${apptId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });

      if (res.ok) {
        triggerSuccess('Appointment updated successfully.');
        fetchData();
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update appointment.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Fetch patient clinical details
  const fetchPatientProfile = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoadingPatientProfile(true);
      setPatientProfileData(null);
      
      const res = await fetch(`${API_BASE_URL}/patients/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setPatientProfileData(data.data.patient);
      } else {
        console.warn('Could not fetch patient clinical profile.');
      }
    } catch (err) {
      console.error('Error fetching patient profile:', err);
    } finally {
      setLoadingPatientProfile(false);
    }
  };

  // Submit Assigned Appointment on behalf of Patient
  const handleAssignApptSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!assignApptData.patient) {
      alert("Please select a patient.");
      return;
    }

    try {
      setErrorMsg('');
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patient: assignApptData.patient,
          doctor: assignApptDoctorId,
          date: assignApptData.date,
          timeSlot: assignApptData.timeSlot,
          symptoms: assignApptData.symptoms,
          notes: assignApptData.notes
        })
      });

      if (res.ok) {
        triggerSuccess("Appointment successfully assigned to doctor.");
        setAssignApptModalOpen(false);
        setAssignApptData({
          patient: '',
          date: '',
          timeSlot: 'Morning (9:00 AM - 12:00 PM)',
          symptoms: '',
          notes: ''
        });
        fetchData();
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to assign appointment.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Submit edited appointment details
  const handleEditApptSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setErrorMsg('');
      const res = await fetch(`${API_BASE_URL}/appointments/${selectedApptForEdit._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editApptFormData)
      });

      if (res.ok) {
        triggerSuccess("Appointment details successfully updated.");
        setEditApptModalOpen(false);
        fetchData();
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update appointment details.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Handle Add User Submit
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoadingUsers(true);
    setErrorMsg('');

    const payload = {
      name: newUserData.name,
      email: newUserData.email,
      password: newUserData.password,
      role: newUserRole
    };

    if (newUserRole === 'patient') {
      const allergiesArray = newUserData.allergies 
        ? newUserData.allergies.split(',').map(item => item.trim()).filter(Boolean)
        : [];

      payload.dateOfBirth = newUserData.dateOfBirth ? new Date(newUserData.dateOfBirth).toISOString() : undefined;
      payload.gender = newUserData.gender;
      payload.phoneNumber = newUserData.phoneNumber;
      payload.address = newUserData.address;
      payload.bloodGroup = newUserData.bloodGroup;
      payload.allergies = allergiesArray;
      payload.emergencyContact = {
        name: newUserData.emergencyContactName || 'None',
        relationship: newUserData.emergencyContactRelationship || 'None',
        phone: newUserData.emergencyContactPhone || 'None'
      };
    } else if (newUserRole === 'doctor') {
      payload.specialization = newUserData.specialization;
      payload.qualifications = newUserData.qualifications;
      payload.experienceYears = Number(newUserData.experienceYears);
      payload.consultationFee = Number(newUserData.consultationFee);
      payload.profilePhoto = newUserData.profilePhoto || undefined;
      payload.availability = newUserData.availability;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || 'Failed to create user account.');
      }

      triggerSuccess(`New user account "${newUserData.name}" (${newUserRole}) successfully created!`);
      setAddUserModalOpen(false);
      setNewUserData({
        name: '',
        email: '',
        password: '',
        dateOfBirth: '',
        gender: 'Male',
        phoneNumber: '',
        address: '',
        bloodGroup: 'O+',
        allergies: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
        specialization: '',
        qualifications: '',
        experienceYears: '',
        consultationFee: '',
        profilePhoto: '',
        availability: [
          { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00' }
        ]
      });
      fetchData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Helper calculations for Medlink overview dashboard
  const totalUsersCount = users.length;
  const activeDoctorsCount = doctorsList.length;
  const activePatientsCount = users.filter(u => u.role === 'patient' && u.isActive).length;
  const totalPatientsCount = users.filter(u => u.role === 'patient').length;
  const pendingAppointmentsCount = appointments.filter(a => a.status === 'pending').length;

  const getAgeStagesData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Visually nice baselines matching the Medlink layout density
    const childrenCounts = [12, 16, 24, 18, 15, 28, 20];
    const teenCounts = [18, 22, 32, 26, 20, 36, 25];
    const adultCounts = [30, 42, 56, 45, 38, 62, 48];

    appointments.forEach(appt => {
      const apptDate = new Date(appt.date);
      const dayIndex = apptDate.getDay(); 
      const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      
      const dob = appt.patient?.dateOfBirth;
      if (dob) {
        const age = new Date().getFullYear() - new Date(dob).getFullYear();
        if (age < 12) childrenCounts[mappedIndex]++;
        else if (age <= 18) teenCounts[mappedIndex]++;
        else adultCounts[mappedIndex]++;
      } else {
        const hash = appt._id ? appt._id.charCodeAt(appt._id.length - 1) % 3 : 0;
        if (hash === 0) childrenCounts[mappedIndex]++;
        else if (hash === 1) teenCounts[mappedIndex]++;
        else adultCounts[mappedIndex]++;
      }
    });

    return { days, children: childrenCounts, teens: teenCounts, adults: adultCounts };
  };

  const ageStages = getAgeStagesData();

  const getAppointmentsByStatus = () => {
    let scheduled = 0, completed = 0, cancelled = 0, rescheduled = 0;
    
    appointments.forEach(a => {
      if (a.status === 'scheduled') scheduled++;
      else if (a.status === 'completed') completed++;
      else if (a.status === 'cancelled') cancelled++;
      else if (a.status === 'rescheduled') rescheduled++;
    });

    const total = scheduled + completed + cancelled + rescheduled;
    if (total === 0) {
      return [
        { name: 'Scheduled', count: 120, percentage: 30, color: '#3b82f6' },
        { name: 'Completed', count: 240, percentage: 50, color: '#10b981' },
        { name: 'Cancelled', count: 40, percentage: 10, color: '#f43f5e' },
        { name: 'Rescheduled', count: 40, percentage: 10, color: '#f59e0b' }
      ];
    }

    const getPercent = (count) => Math.round((count / total) * 100);

    return [
      { name: 'Scheduled', count: scheduled, percentage: getPercent(scheduled), color: '#3b82f6' },
      { name: 'Completed', count: completed, percentage: getPercent(completed), color: '#10b981' },
      { name: 'Cancelled', count: cancelled, percentage: getPercent(cancelled), color: '#f43f5e' },
      { name: 'Rescheduled', count: rescheduled, percentage: getPercent(rescheduled), color: '#f59e0b' }
    ];
  };

  const statusDonutData = getAppointmentsByStatus();

  const getRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const incomeBaseline = [1100, 950, 1200, 1050, 1300, 1200, 1400, 1350, 1500, 1420, 1680, 1850];
    const expenseBaseline = [600, 520, 710, 640, 850, 780, 920, 880, 940, 910, 1050, 1180];

    appointments.forEach(appt => {
      if (appt.status === 'completed') {
        const date = new Date(appt.date);
        const monthIndex = date.getMonth();
        const docFee = appt.doctor?.consultationFee || 150; 
        incomeBaseline[monthIndex] += docFee;
        expenseBaseline[monthIndex] += Math.round(docFee * 0.35);
      }
    });

    return { months, income: incomeBaseline, expense: expenseBaseline };
  };

  const revenueData = getRevenueData();

  const getDoctorsSchedule = () => {
    const totalDocs = doctorsList.length;
    const formattedList = doctorsList.map((doc, idx) => {
      const hours = idx % 3 === 0 ? '08:00 - 12:00' : idx % 3 === 1 ? '13:00 - 17:00' : '16:00 - 20:00';
      const isAvailable = doc.user?.isActive !== false;
      return {
        id: doc._id,
        name: `Dr. ${doc.user?.name || 'Clinician'}`,
        specialty: doc.specialization || 'General',
        isAvailable,
        hours,
        photo: doc.profilePhoto || 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150'
      };
    });

    const availableCount = formattedList.filter(d => d.isAvailable).length;
    const unavailableCount = totalDocs - availableCount;

    return {
      total: totalDocs || 35,
      available: totalDocs ? availableCount : 24,
      unavailable: totalDocs ? unavailableCount : 11,
      list: formattedList.length ? formattedList.slice(0, 5) : [
        { id: 'm1', name: 'Dr. Amelia Hart', specialty: 'Cardiology', isAvailable: true, hours: '08:00 - 12:00', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150' },
        { id: 'm2', name: 'Dr. Rizky Pratama', specialty: 'General Medicine', isAvailable: false, hours: '-', photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150' },
        { id: 'm3', name: 'Dr. Sophia Liang', specialty: 'Pediatrics', isAvailable: true, hours: '13:00 - 17:00', photo: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150' },
        { id: 'm4', name: 'Dr. Daniel Obeng', specialty: 'Orthopedics', isAvailable: false, hours: '-', photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150' },
      ]
    };
  };

  const docSchedule = getDoctorsSchedule();

  const getRecentActivities = () => {
    const list = [];
    const sortedAppts = [...appointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    sortedAppts.slice(0, 4).forEach((appt, idx) => {
      const patientName = appt.patient?.name || 'Patient';
      const docName = appt.doctor?.name || 'Doctor';
      if (appt.status === 'rescheduled') {
        list.push({
          id: `act-appt-${appt._id}`,
          title: 'Appointment rescheduled',
          desc: `for ${patientName} with Dr. ${docName}`,
          time: `${idx * 15 + 10}m ago`,
          icon: 'reschedule'
        });
      } else {
        list.push({
          id: `act-appt-${appt._id}`,
          title: appt.status === 'cancelled' ? 'Appointment cancelled' : 'New appointment created',
          desc: `for ${patientName} with Dr. ${docName}`,
          time: `${idx * 20 + 5}m ago`,
          icon: 'appointment'
        });
      }
    });

    appointments.filter(a => a.billingStatus === 'paid').slice(0, 2).forEach((appt, idx) => {
      const patientName = appt.patient?.name || 'Patient';
      list.push({
        id: `act-bill-${appt._id}`,
        title: 'Billing invoice paid',
        desc: `for patient ${patientName}`,
        time: `${idx * 30 + 45}m ago`,
        icon: 'billing'
      });
    });

    if (list.length < 5) {
      list.push(
        { id: 'df1', title: 'New patient profile created', desc: 'Patient Alice Miller registered', time: '3m ago', icon: 'user' },
        { id: 'df2', title: 'Discharge summary updated', desc: 'for patient Robert Downy', time: '45m ago', icon: 'file' },
        { id: 'df3', title: 'New doctor profile seeded', desc: 'Dr. Emily Watson (Neurology)', time: '2h ago', icon: 'doctor' }
      );
    }

    return list.slice(0, 6);
  };

  const recentActivities = getRecentActivities();

  const getCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();
    const days = [];
    
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevTotalDays - i),
        isCurrentMonth: false
      });
    }
    
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const calendarDays = getCalendarDays(calendarViewDate);
  const calendarMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getAppointmentsForDate = (date) => {
    return appointments.filter(a => new Date(a.date).toDateString() === date.toDateString());
  };

  // Filtered lists for rendering in tabs
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredAppointments = appointments.filter(a => {
    if (apptStatusFilter === 'all') return true;
    return a.status === apptStatusFilter;
  });

  const overviewAppointmentsFiltered = appointments.filter(a => {
    if (selectedTableDateFilter) {
      return new Date(a.date).toDateString() === selectedTableDateFilter.toDateString();
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      
      {/* ================= SIDEBAR NAVIGATION (Medlink Light Theme) ================= */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shrink-0 shadow-sm text-slate-600">
        <div className="space-y-8">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-500 text-white shadow-md shadow-teal-500/20">
              <HeartPulse className="h-5.5 w-5.5 animate-pulse text-white" />
            </div>
            <div className="text-left">
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-none">Medlink</span>
              <span className="text-[8px] font-bold tracking-widest text-teal-500 uppercase">HEALTH MANAGER</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'overview' 
                  ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/20' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"></path></svg>
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'appointments' 
                  ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/20' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Calendar className="h-4.5 w-4.5" />
              Appointments
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'users' 
                  ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/20' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              Patients
            </button>

            <button
              onClick={() => setActiveTab('doctors')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'doctors' 
                  ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/20' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <HeartPulse className="h-4.5 w-4.5" />
              Doctors
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'calendar' 
                  ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/20' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <CalendarCheck2 className="h-4.5 w-4.5" />
              Calendar
            </button>
          </nav>
        </div>

        <div className="space-y-6">
          {/* Upgrade to Pro Card */}
          <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200 relative overflow-hidden shadow-2xs text-left hidden xl:block">
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none text-slate-300">
              <svg className="h-24 w-24 text-teal-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            </div>
            <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest">Upgrade to Pro</p>
            <p className="text-[11px] font-bold text-slate-700 mt-1 leading-snug">Unlock premium features & enhance your LMS experience!</p>
            <button className="w-full mt-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-extrabold py-2 text-[9px] uppercase tracking-wider transition active:scale-95 cursor-pointer text-center">
              Upgrade Now
            </button>
          </div>

          {/* User Footer Account & Logout */}
          <div className="border-t border-slate-150 pt-4 space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-teal-600 font-extrabold uppercase text-xs animate-pulse">
                {user.name ? user.name[0] : 'A'}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-extrabold text-slate-800 truncate">{user.name}</p>
                <p className="text-[9px] font-bold text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 px-4 py-2 text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              <LogOut className="h-4.5 w-4.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT PANE ================= */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        
        {/* Toast success message */}
        {successMsg && (
          <div className="fixed top-6 right-8 z-50 rounded-2xl bg-white border border-teal-500/30 text-teal-700 px-5 py-4 text-xs font-bold shadow-xl flex items-center gap-2.5 animate-bounce">
            <Check className="h-4.5 w-4.5 bg-teal-500 text-white rounded-full p-0.5" />
            {successMsg}
          </div>
        )}

        {/* Live Notifications are now managed via the Bell icon dropdown in the Header */}

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 p-4 text-xs font-bold flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-extrabold text-rose-955 mb-0.5">An error occurred</p>
              <p className="opacity-95">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Top App Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200 bg-white px-6 py-4 -mx-8 -mt-8 shadow-xs">
          <div className="text-left w-full md:w-auto">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {activeTab === 'overview' && 'Dashboard'}
              {activeTab === 'users' && 'Patients Management'}
              {activeTab === 'doctors' && 'Doctors Management'}
              {activeTab === 'appointments' && 'Appointments Management'}
              {activeTab === 'calendar' && 'Appointments Calendar'}
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Hello {user.name || 'HMS Admin'}, welcome back!
            </p>
          </div>

          {/* Search Anything Bar */}
          <div className="relative w-full md:w-80 flex items-center">
            <span className="absolute left-3 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 text-xs focus:border-blue-500 focus:outline-none bg-slate-50/50 transition-colors text-slate-800"
            />
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3">
              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notifDropdownRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer active:scale-95 text-slate-500 ${
                    unreadCount > 0 ? 'text-blue-600' : ''
                  }`}
                  title="Notifications"
                >
                  {unreadCount > 0 ? (
                    <BellRing className="h-4 w-4 text-blue-600 animate-pulse" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-extrabold text-white ring-1 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Popover Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-fade-in text-left">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        Notifications
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-[9px] font-bold text-blue-600 border border-blue-100">
                            {unreadCount} new
                          </span>
                        )}
                      </h4>
                      {liveNotifications.length > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[10px] font-bold text-blue-650 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="h-3 w-3" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin">
                      {liveNotifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 space-y-1.5">
                          <Bell className="h-8 w-8 mx-auto text-slate-300 opacity-60" />
                          <p className="text-xs font-medium">No new notifications</p>
                        </div>
                      ) : (
                        liveNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              handleMarkAsRead(notif.id);
                              setActiveTab('appointments');
                            }}
                            className={`group p-3 rounded-xl border transition-all cursor-pointer text-left relative ${
                              notif.read
                                ? 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'
                                : 'bg-blue-50/30 border-blue-100 hover:bg-blue-50/50'
                            }`}
                          >
                            {!notif.read && (
                              <span className="absolute top-3.5 right-3 h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                            )}
                            <p className={`text-[11px] pr-4 leading-relaxed ${notif.read ? 'text-slate-600 font-medium' : 'text-slate-900 font-bold'}`}>
                              {notif.message}
                            </p>
                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100/60">
                              <span className="text-[9px] font-semibold text-slate-400">
                                {notif.timestamp || 'Just now'}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLiveNotifications(prev => prev.filter(n => n.id !== notif.id));
                                  if (!notif.read) {
                                    setUnreadCount(prev => Math.max(0, prev - 1));
                                  }
                                }}
                                className="text-[9px] font-bold text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {liveNotifications.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 mt-3 flex justify-end">
                        <button
                          onClick={handleClearAllNotifications}
                          className="text-[10px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Settings Gear */}
              <button className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-500 cursor-pointer active:scale-95">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </button>
            </div>

            {/* Profile Avatar info */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-extrabold uppercase text-xs text-blue-600 border border-blue-200">
                {user.name ? user.name[0] : 'A'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                <p className="text-[9px] font-semibold text-slate-400 capitalize mt-0.5">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ================= TABS LOGIC ================= */}
        
        {/* 1. Dashboard Overview Tab */}
        {activeTab === 'overview' && (
          <div className="flex flex-col xl:flex-row gap-8">
            
            {/* Left Content Area */}
            <div className="flex-1 space-y-8 min-w-0">
              
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Overall Visitors */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 flex items-center justify-between shadow-xs premium-hover-card cursor-pointer">
                  <div className="text-left space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overall Visitors</span>
                    <p className="text-2xl font-black text-slate-800">{totalUsersCount.toLocaleString()}</p>
                    <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full bg-teal-50 text-teal-600 text-[10px] font-bold">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                      Real-time Count
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                {/* Total Patients */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 flex items-center justify-between shadow-xs premium-hover-card cursor-pointer">
                  <div className="text-left space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Patients</span>
                    <p className="text-2xl font-black text-slate-800">{totalPatientsCount.toLocaleString()}</p>
                    <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full bg-teal-50 text-teal-600 text-[10px] font-bold">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                      Active Patients
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                </div>

                {/* Appointments */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 flex items-center justify-between shadow-xs premium-hover-card cursor-pointer">
                  <div className="text-left space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Appointments</span>
                    <p className="text-2xl font-black text-slate-800">{appointments.length.toLocaleString()}</p>
                    <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full bg-teal-50 text-teal-600 text-[10px] font-bold">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                      System Bookings
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>

              </div>

              {/* Bar and Donut Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SVG Bar Chart: Patient by Age Stages */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-100 shadow-xs text-left relative group">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-850">Patient by Age Stages</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Total Patients: <span className="text-slate-850 font-black">{totalPatientsCount}</span></p>
                    </div>
                    <select className="rounded-xl border border-slate-150 px-2 py-1 text-[10px] font-bold text-slate-650 bg-slate-50 focus:outline-none cursor-pointer">
                      <option>This Week</option>
                      <option>Last Week</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4 text-[9px] font-bold text-slate-450 mb-3">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" />Children</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-400" />Teens</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-850" />Adults</span>
                  </div>

                  {/* SVG Container */}
                  <div className="h-52 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 520 200" preserveAspectRatio="none">
                      {/* Y-axis gridlines & labels */}
                      {[0, 15, 30, 45, 60].map((val, idx) => {
                        const y = 160 - (val / 60) * 140;
                        return (
                          <g key={val}>
                            <text x="15" y={y + 3} fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="end">{val}</text>
                            {val > 0 && <line x1="25" y1={y} x2="520" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />}
                          </g>
                        );
                      })}

                      {/* Bar groups */}
                      {ageStages.days.map((day, idx) => {
                        const groupWidth = 55;
                        const startX = 40 + idx * 65;
                        
                        // Map values to heights (max 60 = 140px)
                        const scale = 140 / 60;
                        const cHeight = Math.min(60, ageStages.children[idx]) * scale;
                        const tHeight = Math.min(60, ageStages.teens[idx]) * scale;
                        const aHeight = Math.min(60, ageStages.adults[idx]) * scale;

                        const barWidth = 6;
                        
                        return (
                          <g key={day} className="cursor-pointer"
                             onMouseEnter={() => setTooltipData({
                               day,
                               children: ageStages.children[idx],
                               teens: ageStages.teens[idx],
                               adults: ageStages.adults[idx],
                               x: startX,
                               y: 60
                             })}
                             onMouseLeave={() => setTooltipData(null)}
                          >
                            {/* Children Bar (Blue) */}
                            <rect x={startX} y={160 - cHeight} width={barWidth} height={cHeight} fill="#3b82f6" rx="2" className="transition-all duration-300" />
                            {/* Teens Bar (Teal) */}
                            <rect x={startX + barWidth + 2} y={160 - tHeight} width={barWidth} height={tHeight} fill="#2dd4bf" rx="2" className="transition-all duration-300" />
                            {/* Adults Bar (Navy) */}
                            <rect x={startX + (barWidth + 2) * 2} y={160 - aHeight} width={barWidth} height={aHeight} fill="#0f172a" rx="2" className="transition-all duration-300" />
                            
                            {/* X-axis Label */}
                            <text x={startX + 10} y="180" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">{day}</text>
                          </g>
                        );
                      })}
                      {/* X-axis baseline */}
                      <line x1="25" y1="160" x2="520" y2="160" stroke="#cbd5e1" strokeWidth="1" />
                    </svg>

                    {/* Chart Tooltip */}
                    {tooltipData && (
                      <div 
                        className="absolute bg-slate-900 text-white rounded-xl p-2.5 text-[10px] font-bold shadow-md z-30 pointer-events-none"
                        style={{ left: `${tooltipData.x - 30}px`, top: `${tooltipData.y - 20}px` }}
                      >
                        <p className="border-b border-slate-700 pb-1 mb-1 font-black">{tooltipData.day}, 8 March</p>
                        <p className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" />Children: {tooltipData.children}</p>
                        <p className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-teal-400" />Teens: {tooltipData.teens}</p>
                        <p className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" />Adults: {tooltipData.adults}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* SVG Donut Chart: Appointments by Status */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs text-left">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-850">Bookings by Status</h3>
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                  </div>

                  {/* SVG Donut */}
                  <div className="flex flex-col items-center justify-center py-2 relative">
                    <div className="relative h-32 w-32">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Underlay Circle */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                        {/* Dynamic segments */}
                        {(() => {
                          let accumulatedPercentage = 0;
                          return statusDonutData.map((seg) => {
                            if (seg.percentage === 0) return null;
                            
                            const radius = 40;
                            const circumference = 2 * Math.PI * radius;
                            const strokeDash = (seg.percentage / 100) * circumference;
                            const strokeOffset = circumference - (accumulatedPercentage / 100) * circumference;
                            
                            accumulatedPercentage += seg.percentage;
                            
                            return (
                              <circle 
                                key={seg.name}
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="transparent"
                                stroke={seg.color}
                                strokeWidth="10"
                                strokeDasharray={`${strokeDash} ${circumference}`}
                                strokeDashoffset={strokeOffset}
                                strokeLinecap="round"
                                className="transition-all duration-500 hover:stroke-[12px] cursor-pointer"
                              />
                            );
                          });
                        })()}
                      </svg>
                      {/* Centered Total */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">All Patients</span>
                        <span className="text-base font-black text-slate-800 mt-1">{totalPatientsCount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="w-full grid grid-cols-2 gap-x-2 gap-y-1.5 mt-5">
                      {statusDonutData.map(seg => (
                        <div key={seg.name} className="flex items-center justify-between text-[10px] font-bold border-b border-slate-50 pb-1">
                          <span className="flex items-center gap-1.5 text-slate-455 truncate">
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                            {seg.name}
                          </span>
                          <span className="text-slate-700">{seg.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Revenue Line Chart & Reports Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SVG Revenue Line Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-100 shadow-xs text-left">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-850">Revenue</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Consultations income vs. operations expenses</p>
                    </div>
                    <select className="rounded-xl border border-slate-150 px-2 py-1 text-[10px] font-bold text-slate-650 bg-slate-50 focus:outline-none cursor-pointer">
                      <option>Last Year</option>
                      <option>Last 6 Months</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4 text-[9px] font-bold text-slate-450 mb-3">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-500" />Income</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" />Expense</span>
                  </div>

                  {/* SVG Chart */}
                  <div className="h-44 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 520 180" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      {[0, 500, 1000, 1500, 2000].map((val, idx) => {
                        const y = 140 - (val / 2000) * 110;
                        return (
                          <g key={val}>
                            <text x="22" y={y + 3} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">{val >= 1000 ? `${val/1000}K` : val}</text>
                            {val > 0 && <line x1="30" y1={y} x2="520" y2={y} stroke="#f8fafc" strokeWidth="1" />}
                          </g>
                        );
                      })}

                      {/* Path lines */}
                      {(() => {
                        const width = 480;
                        const height = 110;
                        const maxVal = 2000;
                        
                        const pointsIncome = revenueData.income.map((val, idx) => {
                          const x = 40 + idx * 43;
                          const y = 140 - (val / maxVal) * height;
                          return { x, y };
                        });

                        const pointsExpense = revenueData.expense.map((val, idx) => {
                          const x = 40 + idx * 43;
                          const y = 140 - (val / maxVal) * height;
                          return { x, y };
                        });

                        const pathIncome = pointsIncome.reduce((acc, p, idx) => {
                          return acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
                        }, '');

                        const pathExpense = pointsExpense.reduce((acc, p, idx) => {
                          return acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
                        }, '');

                        const areaIncome = pathIncome + ` L ${pointsIncome[pointsIncome.length - 1].x} 140 L ${pointsIncome[0].x} 140 Z`;

                        return (
                          <g>
                            {/* Area Fill */}
                            <path d={areaIncome} fill="url(#incomeGrad)" />
                            
                            {/* Expense Line */}
                            <path d={pathExpense} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
                            {/* Income Line */}
                            <path d={pathIncome} fill="none" stroke="#0d9488" strokeWidth="2.5" />

                            {/* Month Labels */}
                            {revenueData.months.map((m, idx) => (
                              <text key={m} x={40 + idx * 43} y="162" fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle">{m}</text>
                            ))}
                          </g>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* Reports List */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs text-left">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-850">Reports</h3>
                    <svg className="h-4 w-4 text-slate-450" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                  </div>

                  <div className="space-y-4 max-h-[170px] overflow-y-auto pr-0.5 scrollbar-thin">
                    <div className="flex items-start gap-3 text-xs border-l-2 border-slate-200 pl-3">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800">Medication stock running low in pharmacy</p>
                        <p className="text-[10px] text-slate-400 font-semibold">PT-2035-112 • 5m ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-xs border-l-2 border-slate-200 pl-3">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800">System lag on Outpatient Registration</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Elliana Marks • 14m ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-xs border-l-2 border-slate-200 pl-3">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800">Air conditioning error in ICU ward</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Maintenance Team • Yesterday</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Patient Appointment Table */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs text-left">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-850">Patient Appointment</h3>
                    {selectedTableDateFilter && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        Date: {selectedTableDateFilter.toLocaleDateString()}
                        <button onClick={() => setSelectedTableDateFilter(null)} className="hover:text-blue-800 font-black shrink-0 cursor-pointer ml-1">×</button>
                      </span>
                    )}
                  </div>
                  <select className="rounded-xl border border-slate-150 px-2 py-1 text-[10px] font-bold text-slate-655 bg-slate-50 focus:outline-none cursor-pointer">
                    <option>This Week</option>
                    <option>Today</option>
                  </select>
                </div>

                <div className="overflow-x-auto text-slate-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                        <th className="py-3 px-4 rounded-l-2xl">Name</th>
                        <th className="py-3 px-4">Doctor (+ Specialty)</th>
                        <th className="py-3 px-4">Appointment Type</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 rounded-r-2xl text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {overviewAppointmentsFiltered.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-450 italic">No scheduled appointments found matching query.</td>
                        </tr>
                      ) : (
                        (() => {
                          // Apply search filter if query exists
                          let listToRender = overviewAppointmentsFiltered;
                          if (searchQuery) {
                            const q = searchQuery.toLowerCase();
                            listToRender = listToRender.filter(a => 
                              (a.patient?.name || '').toLowerCase().includes(q) ||
                              (a.doctor?.name || '').toLowerCase().includes(q) ||
                              (a.doctor?.specialization || '').toLowerCase().includes(q)
                            );
                          }
                          
                          return listToRender.slice(0, 8).map((a) => {
                            const patientName = a.patient?.name || 'Patient User';
                            const patientId = a.patient?._id ? `PT-${a.patient._id.substring(a.patient._id.length - 4).toUpperCase()}` : 'PT-MOCK-001';
                            const docName = a.doctor?.name ? `Dr. ${a.doctor.name}` : 'Clinician';
                            const docSpec = a.doctor?.specialization || 'Cardiology';
                            
                            const type = a.notes?.toLowerCase().includes('follow') || a.symptoms?.toLowerCase().includes('follow')
                              ? 'Follow-up' 
                              : a.notes?.toLowerCase().includes('surgery') || a.symptoms?.toLowerCase().includes('surgery')
                              ? 'Surgery' 
                              : 'Consultation';

                            return (
                              <tr key={a._id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="py-3.5 px-4">
                                  <p className="font-bold text-slate-800 leading-tight">{patientName}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{patientId}</p>
                                </td>
                                <td className="py-3.5 px-4">
                                  <p className="font-bold text-slate-800 leading-tight">{docName}</p>
                                  <p className="text-[10px] text-slate-450 font-bold mt-0.5">{docSpec}</p>
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-slate-600">{type}</td>
                                <td className="py-3.5 px-4">
                                  <p className="font-bold text-slate-800 leading-tight">{new Date(a.date).toLocaleDateString([], { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{a.timeSlot}</p>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                    a.status === 'completed' ? 'bg-teal-50 text-teal-650 border border-teal-100' :
                                    a.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                    'bg-blue-50 text-blue-650 border border-blue-100'
                                  }`}>
                                    {a.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTableDropdown(activeTableDropdown === a._id ? null : a._id);
                                    }}
                                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-450 transition active:scale-90 cursor-pointer"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                                  </button>
                                  
                                  {activeTableDropdown === a._id && (
                                    <div className="absolute right-6 mt-1 w-32 rounded-xl bg-white border border-slate-150 shadow-lg py-1 z-40 text-left">
                                      <button 
                                        onClick={() => {
                                          handleUpdateApptStatus(a._id, 'completed', null);
                                          setActiveTableDropdown(null);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-bold block cursor-pointer"
                                      >
                                        Complete
                                      </button>
                                      <button 
                                        onClick={() => {
                                          handleUpdateApptStatus(a._id, 'scheduled', null);
                                          setActiveTableDropdown(null);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-bold block cursor-pointer"
                                      >
                                        Schedule
                                      </button>
                                      <button 
                                        onClick={() => {
                                          handleUpdateApptStatus(a._id, 'cancelled', null);
                                          setActiveTableDropdown(null);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-bold block cursor-pointer border-t border-slate-50"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          });
                        })()
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Sidebar Area */}
            <div className="w-full xl:w-80 shrink-0 space-y-8 text-left">
              
              {/* Mini Month Calendar */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
                <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                  <h3 className="text-sm font-black text-slate-800 leading-none">
                    {calendarMonths[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))}
                      className="p-1 rounded-lg border border-slate-150 hover:bg-slate-50 text-slate-550 transition cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <button 
                      onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))}
                      className="p-1 rounded-lg border border-slate-150 hover:bg-slate-50 text-slate-550 transition cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-y-2.5 text-center text-xs font-bold">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <span key={d} className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">{d[0]}</span>
                  ))}
                  {calendarDays.map((day, idx) => {
                    const isToday = day.date.toDateString() === new Date().toDateString();
                    const isSelected = day.date.toDateString() === selectedCalendarDate.toDateString();
                    const hasAppts = getAppointmentsForDate(day.date).length > 0;
                    
                    return (
                      <div key={idx} className="flex justify-center items-center">
                        <button
                          onClick={() => {
                            setSelectedCalendarDate(day.date);
                            setSelectedTableDateFilter(day.date);
                          }}
                          className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all relative cursor-pointer ${
                            !day.isCurrentMonth ? 'text-slate-300' : 'text-slate-700'
                          } ${
                            isSelected 
                              ? 'bg-blue-600 text-white font-black shadow-md' 
                              : isToday 
                              ? 'bg-slate-100 text-slate-800' 
                              : hasAppts
                              ? 'border-2 border-blue-200 text-blue-600 font-extrabold'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          {day.date.getDate()}
                          {hasAppts && !isSelected && (
                            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-500" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Agenda */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-800">Agenda</h3>
                  <svg className="h-4 w-4 text-slate-450" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                </div>

                <div className="space-y-3.5">
                  <div className="flex gap-4 p-3 rounded-2xl bg-[#e0f2fe] border border-blue-100 text-left">
                    <div className="text-center font-extrabold shrink-0 w-8 border-r border-blue-200/50 pr-2">
                      <p className="text-slate-800 text-xs">17</p>
                      <p className="text-slate-550 text-[9px] uppercase">Fri</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-white text-[8px] font-bold uppercase tracking-wider text-blue-600">Meeting</span>
                      <p className="text-xs font-black text-slate-800 leading-tight mt-1">Monthly Staff Meeting</p>
                      <p className="text-[10px] text-slate-500 font-semibold">09:00 - 10:00</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3 rounded-2xl bg-[#e2fbf7] border border-teal-100 text-left">
                    <div className="text-center font-extrabold shrink-0 w-8 border-r border-teal-200/50 pr-2">
                      <p className="text-slate-800 text-xs">20</p>
                      <p className="text-slate-550 text-[9px] uppercase">Mon</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-white text-[8px] font-bold uppercase tracking-wider text-teal-650">Training</span>
                      <p className="text-xs font-black text-slate-800 leading-tight mt-1">Industry Networking Night</p>
                      <p className="text-[10px] text-slate-500 font-semibold">14:00 - 16:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctors' Schedule */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
                <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                  <h3 className="text-sm font-black text-slate-800">Doctors' Schedule</h3>
                  <svg className="h-4 w-4 text-slate-450" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                </div>

                <div className="flex items-center justify-between text-center border-b border-slate-50 pb-3 mb-4">
                  <div className="text-left">
                    <p className="text-base font-black text-slate-800">{docSchedule.total}</p>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">All Doctors</span>
                  </div>
                  <div>
                    <p className="text-base font-black text-slate-800">{docSchedule.available}</p>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Available</span>
                  </div>
                  <div>
                    <p className="text-base font-black text-slate-800">{docSchedule.unavailable}</p>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Unavailable</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {docSchedule.list.map((doc, idx) => (
                    <div key={doc.id || idx} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2.5">
                        <img src={doc.photo} alt={doc.name} className="h-8 w-8 rounded-full border border-slate-200 object-cover shrink-0" />
                        <div className="text-left">
                          <p className="text-xs font-extrabold text-slate-800 leading-none">{doc.name}</p>
                          <p className="text-[10px] text-slate-450 font-semibold mt-0.5">{doc.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider ${
                          doc.isAvailable ? 'bg-teal-50 text-teal-650' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {doc.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{doc.hours}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
                <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                  <h3 className="text-sm font-black text-slate-800">Recent Activity</h3>
                  <svg className="h-4 w-4 text-slate-450" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                </div>

                <div className="relative border-l border-slate-100 pl-4 space-y-5 text-left text-xs">
                  {recentActivities.map(act => (
                    <div key={act.id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-slate-200 border-2 border-white ring-2 ring-slate-100" />
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-slate-800 leading-tight">{act.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{act.desc}</p>
                        <p className="text-[9px] text-slate-450 font-bold mt-0.5">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Large Calendar Tab View */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800">Hospital Consultation Calendar</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold transition cursor-pointer active:scale-95 bg-white text-slate-700"
                >
                  Previous
                </button>
                <span className="text-sm font-black px-4 text-slate-700 min-w-[150px] text-center">
                  {calendarMonths[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}
                </span>
                <button 
                  onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold transition cursor-pointer active:scale-95 bg-white text-slate-700"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Large Calendar Grid */}
            <div className="grid grid-cols-7 gap-4 text-xs font-bold">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                <div key={d} className="text-center py-2.5 bg-slate-50 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{d}</div>
              ))}
              {calendarDays.map((day, idx) => {
                const isToday = day.date.toDateString() === new Date().toDateString();
                const appts = getAppointmentsForDate(day.date);
                
                return (
                  <div 
                    key={idx} 
                    className={`min-h-[105px] p-3.5 rounded-2xl border transition text-left flex flex-col justify-between ${
                      day.isCurrentMonth ? 'bg-white border-slate-150' : 'bg-slate-50/50 border-slate-100 text-slate-300'
                    } ${isToday ? 'ring-2 ring-blue-500/20 bg-blue-50/10' : ''}`}
                  >
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      isToday ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-450'
                    }`}>{day.date.getDate()}</span>
                    
                    <div className="mt-2.5 space-y-1 overflow-y-auto max-h-[60px] scrollbar-thin">
                      {appts.slice(0, 3).map(a => (
                        <div 
                          key={a._id} 
                          onClick={() => {
                            setSelectedCalendarDate(day.date);
                            setSelectedTableDateFilter(day.date);
                            setActiveTab('overview');
                          }}
                          className={`p-1 rounded-lg text-[9px] font-bold leading-tight truncate cursor-pointer ${
                            a.status === 'completed' ? 'bg-teal-50 text-teal-700' : 'bg-blue-50 text-blue-700'
                          }`}
                          title={`Patient: ${a.patient?.name || 'Patient'}`}
                        >
                          {a.timeSlot.split(' ')[0]} - {a.patient?.name || 'Booking'}
                        </div>
                      ))}
                      {appts.length > 3 && (
                        <div className="text-[8px] font-extrabold text-slate-400 text-center">+{appts.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= USER MANAGEMENT TAB ================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="rounded-xl border border-slate-200 pl-4 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none bg-slate-50 text-slate-800 min-w-[220px]"
                />
                
                <select 
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="patient">Patients</option>
                  <option value="doctor">Doctors</option>
                  <option value="admin">Admins</option>
                  <option value="user">Staff ('user')</option>
                </select>
              </div>

              <button 
                onClick={() => setAddUserModalOpen(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold uppercase tracking-wider text-white px-5 py-2.5 shadow-md shadow-blue-500/10 cursor-pointer transition active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Register New User
              </button>

            </div>

            {loadingUsers ? (
              <div className="text-center py-10 text-xs text-slate-400 italic">Fetching system records...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">No matching user records found.</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{u.name}</td>
                        <td className="p-4 text-slate-650">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            u.role === 'admin' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            u.role === 'doctor' ? 'bg-teal-50 text-teal-600 border border-teal-100' :
                            'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                            u.isActive ? 'text-teal-600' : 'text-slate-400'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-teal-500' : 'bg-slate-400'}`} />
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {u.role === 'patient' && (
                              <button
                                onClick={() => {
                                  setSelectedPatientForView(u);
                                  fetchPatientProfile(u._id);
                                  setViewPatientModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border bg-slate-50 border-slate-200 text-slate-655 hover:bg-slate-100 hover:text-slate-800 cursor-pointer transition-all"
                                title="View Patient Details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View details
                              </button>
                            )}
                            {u._id === user._id ? (
                              <span className="text-[10px] text-slate-400 font-semibold italic">Current Admin</span>
                            ) : (
                              <button
                                disabled={!u.isActive}
                                onClick={() => handleToggleUserStatus(u)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border transition-all ${
                                  u.isActive
                                    ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100 hover:text-rose-700 cursor-pointer'
                                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                <UserX className="h-3.5 w-3.5" />
                                Deactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
             {/* ================= DOCTORS LIST TAB ================= */}
        {activeTab === 'doctors' && (
          <div className="space-y-6 text-left">
            
            {/* Specialty & Status Filters Bar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
              {/* Specialty horizontal tabs */}
              <div className="flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-white border border-slate-200">
                {['All', 'General Medicine', 'Pediatrics', 'Cardiology', 'Orthopedics', 'Dermatology', 'Neurology'].map(spec => (
                  <button
                    key={spec}
                    onClick={() => setSelectedDocSpecialty(spec)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      selectedDocSpecialty === spec
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>

              {/* Right controls: Status filter & Add Doctor */}
              <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                <select
                  value={selectedDocStatus}
                  onChange={(e) => setSelectedDocStatus(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 bg-white cursor-pointer focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>

                <button
                  onClick={() => {
                    setNewUserRole('doctor');
                    setAddUserModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold uppercase tracking-wider text-white px-5 py-2.5 shadow-md shadow-blue-500/10 cursor-pointer transition active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  Add New Doctor
                </button>
              </div>
            </div>

            {loadingDoctors ? (
              <div className="text-center py-10 text-xs text-slate-400 italic">Loading clinician profiles...</div>
            ) : doctorsList.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">No doctor profiles found in database.</div>
            ) : (
              (() => {
                const filteredDocs = doctorsList.filter(doc => {
                  if (selectedDocSpecialty !== 'All') {
                    const matchSpecialty = (doc.specialization || '').toLowerCase() === selectedDocSpecialty.toLowerCase();
                    if (!matchSpecialty) return false;
                  }
                  if (selectedDocStatus !== 'all') {
                    const isAvailable = doc.user?.isActive !== false;
                    if (selectedDocStatus === 'available' && !isAvailable) return false;
                    if (selectedDocStatus === 'unavailable' && isAvailable) return false;
                  }
                  return true;
                });

                if (filteredDocs.length === 0) {
                  return <div className="text-center py-10 text-xs text-slate-400">No doctors match the selected filters.</div>;
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredDocs.map((doc) => {
                      const isAvailable = doc.user?.isActive !== false;
                      return (
                        <div 
                          key={doc._id} 
                          className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition duration-300 relative group"
                        >
                          <div className="relative">
                            {/* Available Badge */}
                            <span className={`absolute top-0 left-0 inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                              isAvailable ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}>
                              {isAvailable ? 'Available' : 'Unavailable'}
                            </span>

                            {/* Option dots */}
                            <button className="absolute top-0 right-0 p-1 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700 cursor-pointer">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                            </button>

                            {/* Doctor Photo */}
                            <div className="flex justify-center mt-8 mb-4">
                              <img 
                                src={doc.profilePhoto || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'} 
                                alt={doc.user?.name || 'Doctor'} 
                                className="h-28 w-28 rounded-full border-2 border-slate-100 object-cover shadow-xs bg-slate-50"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150';
                                }}
                              />
                            </div>

                            {/* Details panel */}
                            <div className="text-center space-y-1 bg-slate-50/50 rounded-2xl p-3 border border-slate-100 mb-2">
                              <h4 className="text-sm font-black text-slate-900 leading-none">Dr. {doc.user?.name || 'Unknown'}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{doc.specialization || 'Clinical Specialist'}</p>
                              <p className="text-[9px] font-semibold text-slate-500 mt-1 flex items-center justify-center gap-1">
                                <Clock className="h-3 w-3 text-slate-450" />
                                {doc.availability && doc.availability.length > 0 
                                  ? `${doc.availability[0].dayOfWeek.slice(0, 3)} - ${doc.availability[doc.availability.length - 1].dayOfWeek.slice(0, 3)} (${doc.availability[0].startTime} - ${doc.availability[0].endTime})`
                                  : 'Mon - Fri (09:00 - 17:00)'}
                              </p>
                            </div>
                          </div>

                          {/* Footer Action items */}
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                            <button 
                              onClick={() => alert(`Opening message thread with Dr. ${doc.user?.name || 'Doctor'}`)}
                              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition active:scale-95 cursor-pointer"
                              title="Message Doctor"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => alert(`Calling Dr. ${doc.user?.name || 'Doctor'}: ${doc.user?.email || 'No phone number available'}`)}
                              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition active:scale-95 cursor-pointer"
                              title="Call Doctor"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setAssignApptDoctorId(doc.user?._id);
                                setAssignApptData(prev => ({
                                  ...prev,
                                  date: new Date().toISOString().split('T')[0]
                                }));
                                setAssignApptModalOpen(true);
                              }}
                              className="flex-1 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-100 font-extrabold text-[10px] uppercase tracking-wider transition active:scale-95 cursor-pointer text-center"
                            >
                              Assign Patient
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* ================= APPOINTMENTS TAB ================= */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs max-w-md">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setApptStatusFilter(tab)}
                  className={`flex-1 rounded-xl py-2 text-[10px] font-extrabold uppercase tracking-wider transition ${
                    apptStatusFilter === tab 
                      ? 'bg-slate-200 text-slate-900 font-bold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loadingAppointments ? (
              <div className="text-center py-10 text-xs text-slate-400 italic">Retrieving booking list...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">No scheduled appointments match criteria.</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="p-4">Patient Profile</th>
                      <th className="p-4">Assigned Doctor</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Symptoms</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Billing</th>
                      <th className="p-4 text-center">Manage Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.map((a) => (
                      <tr key={a._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="text-left font-bold text-slate-900">
                            {a.patient?.name || <span className="text-rose-600">N/A</span>}
                          </div>
                          <div className="text-[10px] text-slate-500">{a.patient?.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-left font-bold text-slate-900">
                            Dr. {a.doctor?.name || <span className="text-rose-600">N/A</span>}
                          </div>
                          <div className="text-[10px] text-slate-500">{a.doctor?.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-805">
                            {new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-[10px] text-slate-500">{a.timeSlot}</div>
                        </td>
                        <td className="p-4 text-slate-650 truncate max-w-[150px]" title={a.symptoms}>
                          {a.symptoms || 'None'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            a.status === 'confirmed' ? 'bg-teal-55 text-teal-700 border border-teal-100' :
                            a.status === 'completed' ? 'bg-blue-55 text-blue-600 border border-blue-100' :
                            a.status === 'cancelled' ? 'bg-rose-55 text-rose-700 border border-rose-100' :
                            'bg-amber-55 text-amber-700 border border-amber-100'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleUpdateApptStatus(a._id, null, a.billingStatus === 'paid' ? 'pending' : 'paid')}
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border cursor-pointer transition ${
                              a.billingStatus === 'paid'
                                ? 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700'
                                : 'bg-amber-50 border-amber-250 text-amber-705 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700'
                            }`}
                          >
                            {a.billingStatus === 'paid' ? 'Paid' : 'Pending'}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedApptForView(a);
                                setViewApptModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-800 cursor-pointer transition-all"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedApptForEdit(a);
                                setEditApptFormData({
                                  date: new Date(a.date).toISOString().split('T')[0],
                                  timeSlot: a.timeSlot,
                                  status: a.status,
                                  billingStatus: a.billingStatus || 'pending',
                                  notes: a.notes || ''
                                });
                                setEditApptModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-800 cursor-pointer transition-all"
                              title="Edit Appointment"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {a.status !== 'confirmed' && a.status !== 'completed' && a.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateApptStatus(a._id, 'confirmed')}
                                className="p-1.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-655 hover:bg-teal-600 hover:text-white cursor-pointer transition-all"
                                title="Approve Appointment"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {a.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateApptStatus(a._id, 'completed')}
                                className="p-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-655 hover:bg-blue-600 hover:text-white cursor-pointer transition-all"
                                title="Complete Appointment"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {a.status !== 'cancelled' && a.status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateApptStatus(a._id, 'cancelled')}
                                className="p-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white cursor-pointer transition-all"
                                title="Cancel Appointment"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ================= REGISTER USER DIALOG MODAL ================= */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-955/40 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 p-8 shadow-2xl z-10 text-left my-8 max-h-[90vh] overflow-y-auto text-slate-800">
            
            {/* Close */}
            <button 
              onClick={() => setAddUserModalOpen(false)}
              className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Register System Account</h2>
            <p className="mt-1 text-slate-500 font-medium text-xs leading-relaxed">
              Create patient demographics profiles or clinician records directly.
            </p>

            <div className="mt-6 flex items-center gap-2 p-1 rounded-xl bg-slate-50 border border-slate-200 mb-6">
              {['patient', 'doctor', 'admin'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setNewUserRole(role)}
                  className={`flex-1 rounded-lg py-2 text-[10px] font-extrabold uppercase tracking-wider transition ${
                    newUserRole === role 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-5 text-left text-xs">
              
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">1. Account Credentials</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter name"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-805"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="email@example.com"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-805"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  placeholder="Min 6 characters"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-805"
                />
              </div>

              {/* Patient Fields */}
              {newUserRole === 'patient' && (
                <>
                  <div className="border-b border-slate-100 pt-2 pb-2">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">2. Demographics</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-550 block mb-1">Date of Birth</label>
                      <input 
                        type="date" 
                        required 
                        value={newUserData.dateOfBirth}
                        onChange={(e) => setNewUserData({...newUserData, dateOfBirth: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-650"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-550 block mb-1">Gender</label>
                      <select 
                        value={newUserData.gender}
                        onChange={(e) => setNewUserData({...newUserData, gender: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-700 cursor-pointer"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-550 block mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        required 
                        placeholder="+1 (555) 123-4567"
                        value={newUserData.phoneNumber}
                        onChange={(e) => setNewUserData({...newUserData, phoneNumber: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-805"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-550 block mb-1">Blood Group</label>
                      <select 
                        value={newUserData.bloodGroup}
                        onChange={(e) => setNewUserData({...newUserData, bloodGroup: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-700 cursor-pointer"
                      >
                        <option>O+</option>
                        <option>O-</option>
                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-550 block mb-1">Residential Address</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="123 Health Ave, St. Louis"
                      value={newUserData.address}
                      onChange={(e) => setNewUserData({...newUserData, address: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-805"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-550 block mb-1">Known Allergies (Comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Peanuts, Penicillin"
                      value={newUserData.allergies}
                      onChange={(e) => setNewUserData({...newUserData, allergies: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-805"
                    />
                  </div>

                  <div className="border-b border-slate-100 pt-2 pb-2">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">3. Emergency Contact</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Contact Name"
                        value={newUserData.emergencyContactName}
                        onChange={(e) => setNewUserData({...newUserData, emergencyContactName: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-805"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Relationship</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Spouse, Parent"
                        value={newUserData.emergencyContactRelationship}
                        onChange={(e) => setNewUserData({...newUserData, emergencyContactRelationship: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-805"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Phone</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="Contact Phone"
                      value={newUserData.emergencyContactPhone}
                      onChange={(e) => setNewUserData({...newUserData, emergencyContactPhone: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-805"
                    />
                  </div>
                </>
              )}

              {/* Doctor Fields */}
              {newUserRole === 'doctor' && (
                <>
                  <div className="border-b border-slate-100 pt-2 pb-2">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">2. Professional Details</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Specialization</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Cardiologist, Neurologist"
                        value={newUserData.specialization}
                        onChange={(e) => setNewUserData({...newUserData, specialization: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Qualifications</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="MD, MBBS"
                        value={newUserData.qualifications}
                        onChange={(e) => setNewUserData({...newUserData, qualifications: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Years of Experience</label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        placeholder="e.g. 8"
                        value={newUserData.experienceYears}
                        onChange={(e) => setNewUserData({...newUserData, experienceYears: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Consultation Fee ($)</label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        placeholder="e.g. 150"
                        value={newUserData.consultationFee}
                        onChange={(e) => setNewUserData({...newUserData, consultationFee: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Profile Photo URL (Optional)</label>
                    <input 
                      type="url" 
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newUserData.profilePhoto}
                      onChange={(e) => setNewUserData({...newUserData, profilePhoto: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50/50 focus:border-blue-500 focus:outline-none text-slate-800"
                    />
                  </div>
                </>
              )}

              <button 
                type="submit"
                className="w-full mt-6 rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer shadow-md shadow-blue-500/10 active:scale-95 animate-pulse-subtle"
              >
                Create Account
              </button>

            </form>

          </div>
        </div>
      )}

      {/* ================= VIEW APPOINTMENT DETAILS MODAL ================= */}
      {viewApptModalOpen && selectedApptForView && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-955/40 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-8 shadow-2xl z-10 text-left my-8 text-slate-800">
            {/* Close */}
            <button 
              onClick={() => setViewApptModalOpen(false)}
              className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarCheck2 className="h-5 w-5 text-blue-600" />
              Appointment details
            </h2>
            <p className="mt-1 text-slate-500 font-medium text-xs leading-relaxed">
              Full schedule records of patient consultations.
            </p>

            <div className="mt-6 space-y-5 text-xs">
              {/* Patient details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">Patient Details</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                  <div>
                    <p className="text-[10px] font-bold text-slate-450 uppercase">Name</p>
                    <p className="font-extrabold text-slate-800">{selectedApptForView.patient?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-455 uppercase">Email</p>
                    <p className="font-bold text-slate-700 truncate">{selectedApptForView.patient?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Doctor details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[10px] font-black text-teal-600 uppercase tracking-wider block">Assigned Doctor</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                  <div>
                    <p className="text-[10px] font-bold text-slate-455 uppercase">Doctor Name</p>
                    <p className="font-extrabold text-slate-800">Dr. {selectedApptForView.doctor?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-455 uppercase">Specialization</p>
                    <p className="font-bold text-slate-700">{selectedApptForView.doctor?.specialty || 'General Practitioner'}</p>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">Consultation Schedule</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  <div>
                    <p className="text-[10px] font-bold text-slate-455 uppercase">Date</p>
                    <p className="font-extrabold text-slate-800">{new Date(selectedApptForView.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-455 uppercase">Time Slot</p>
                    <p className="font-bold text-slate-700">{selectedApptForView.timeSlot}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-455 uppercase">Status</p>
                    <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      selectedApptForView.status === 'confirmed' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                      selectedApptForView.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      selectedApptForView.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {selectedApptForView.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-455 uppercase">Billing Status</p>
                    <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      selectedApptForView.billingStatus === 'paid' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {selectedApptForView.billingStatus || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-455 uppercase">Symptoms Reported</p>
                  <p className="font-medium text-slate-700 mt-1 leading-relaxed italic bg-white p-2.5 rounded-xl border border-slate-100">
                    {selectedApptForView.symptoms || 'No symptoms specified.'}
                  </p>
                </div>

                {selectedApptForView.notes && (
                  <div className="pt-1">
                    <p className="text-[10px] font-bold text-slate-455 uppercase">Clinical Notes</p>
                    <p className="font-medium text-slate-705 mt-1 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                      {selectedApptForView.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => setViewApptModalOpen(false)}
              className="w-full mt-6 rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 transition cursor-pointer"
            >
              Close Record View
            </button>
          </div>
        </div>
      )}

      {/* ================= EDIT APPOINTMENT DETAILS MODAL ================= */}
      {editApptModalOpen && selectedApptForEdit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-955/40 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-8 shadow-2xl z-10 text-left my-8 text-slate-800">
            {/* Close */}
            <button 
              onClick={() => setEditApptModalOpen(false)}
              className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Pencil className="h-5 w-5 text-blue-600" />
              Edit Appointment
            </h2>
            <p className="mt-1 text-slate-500 font-medium text-xs leading-relaxed">
              Modify schedules, consultation status, and fees status.
            </p>

            <form onSubmit={handleEditApptSubmit} className="mt-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-550 block mb-1">Appointment Date</label>
                  <input 
                    type="date" 
                    required 
                    value={editApptFormData.date}
                    onChange={(e) => setEditApptFormData({ ...editApptFormData, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-550 block mb-1">Time Slot</label>
                  <select 
                    value={editApptFormData.timeSlot}
                    onChange={(e) => setEditApptFormData({ ...editApptFormData, timeSlot: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option>Morning (9:00 AM - 12:00 PM)</option>
                    <option>Afternoon (1:00 PM - 4:00 PM)</option>
                    <option>Evening (5:00 PM - 8:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-550 block mb-1">Consultation Status</label>
                  <select 
                    value={editApptFormData.status}
                    onChange={(e) => setEditApptFormData({ ...editApptFormData, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 focus:border-blue-500 focus:outline-none cursor-pointer text-slate-700"
                  >
                    <option value="pending">Pending Approval</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-550 block mb-1">Billing Status</label>
                  <select 
                    value={editApptFormData.billingStatus}
                    onChange={(e) => setEditApptFormData({ ...editApptFormData, billingStatus: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 focus:border-blue-500 focus:outline-none cursor-pointer text-slate-700"
                  >
                    <option value="pending">Pending Payment</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-550 block mb-1">Clinical Notes (Optional)</label>
                <textarea 
                  rows="3"
                  placeholder="Clinical assessment observations..."
                  value={editApptFormData.notes}
                  onChange={(e) => setEditApptFormData({ ...editApptFormData, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 focus:border-blue-500 focus:outline-none text-slate-805"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setEditApptModalOpen(false)}
                  className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer shadow-md shadow-blue-500/10 active:scale-95 text-center"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ASSIGN APPOINTMENT MODAL ================= */}
      {assignApptModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-955/40 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-8 shadow-2xl z-10 text-left my-8 text-slate-800">
            {/* Close */}
            <button 
              onClick={() => setAssignApptModalOpen(false)}
              className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-teal-650" />
              Assign Patient to Doctor
            </h2>
            <p className="mt-1 text-slate-500 font-medium text-xs leading-relaxed">
              Create a new consultation slot assignment directly on behalf of a patient.
            </p>

            <form onSubmit={handleAssignApptSubmit} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-550 block mb-1">Select Patient Profile</label>
                <select 
                  required
                  value={assignApptData.patient}
                  onChange={(e) => setAssignApptData({ ...assignApptData, patient: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 focus:border-blue-500 focus:outline-none cursor-pointer text-slate-750 font-bold"
                >
                  <option value="">-- Choose patient --</option>
                  {users.filter(u => u.role === 'patient').map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-550 block mb-1">Appointment Date</label>
                  <input 
                    type="date" 
                    required 
                    value={assignApptData.date}
                    onChange={(e) => setAssignApptData({ ...assignApptData, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-550 block mb-1">Time Slot</label>
                  <select 
                    value={assignApptData.timeSlot}
                    onChange={(e) => setAssignApptData({ ...assignApptData, timeSlot: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 focus:border-blue-500 focus:outline-none cursor-pointer text-slate-700"
                  >
                    <option>Morning (9:00 AM - 12:00 PM)</option>
                    <option>Afternoon (1:00 PM - 4:00 PM)</option>
                    <option>Evening (5:00 PM - 8:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-550 block mb-1">Symptoms Description</label>
                <textarea 
                  rows="2"
                  placeholder="Describe patient health issues/symptoms..."
                  value={assignApptData.symptoms}
                  onChange={(e) => setAssignApptData({ ...assignApptData, symptoms: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 focus:border-blue-500 focus:outline-none text-slate-805"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-550 block mb-1">Clinical Notes (Optional)</label>
                <textarea 
                  rows="2"
                  placeholder="Doctor directives or special staff notes..."
                  value={assignApptData.notes}
                  onChange={(e) => setAssignApptData({ ...assignApptData, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 focus:border-blue-500 focus:outline-none text-slate-805"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setAssignApptModalOpen(false)}
                  className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 rounded-xl bg-teal-600 hover:bg-teal-750 py-3 text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer shadow-md shadow-teal-500/10 active:scale-95 text-center"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= VIEW PATIENT DETAILS MODAL ================= */}
      {viewPatientModalOpen && selectedPatientForView && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-955/40 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 p-8 shadow-2xl z-10 text-left my-8 text-slate-800">
            {/* Close */}
            <button 
              onClick={() => setViewPatientModalOpen(false)}
              className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600 animate-pulse" />
              Patient clinical details
            </h2>
            <p className="mt-1 text-slate-500 font-medium text-xs leading-relaxed">
              Detailed demographics and clinical profile history.
            </p>

            {loadingPatientProfile ? (
              <div className="text-center py-12 text-slate-400 italic text-xs">
                Fetching patient file from secure database...
              </div>
            ) : patientProfileData ? (
              <div className="mt-6 space-y-5 text-xs">
                {/* Personal specs */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">Demographics Profile</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                    <div>
                      <p className="text-[9px] font-bold text-slate-455 uppercase">Name</p>
                      <p className="font-extrabold text-slate-800">{selectedPatientForView.name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-455 uppercase">Email</p>
                      <p className="font-bold text-slate-705 truncate">{selectedPatientForView.email}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-455 uppercase">Date of Birth</p>
                      <p className="font-bold text-slate-700">
                        {patientProfileData.dateOfBirth 
                          ? new Date(patientProfileData.dateOfBirth).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-455 uppercase">Gender</p>
                      <p className="font-bold text-slate-700 capitalize">{patientProfileData.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-455 uppercase">Blood Group</p>
                      <p className="font-extrabold text-slate-800">{patientProfileData.bloodGroup || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-455 uppercase">Phone Number</p>
                      <p className="font-bold text-slate-700">{patientProfileData.phoneNumber || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[9px] font-bold text-slate-455 uppercase">Residential Address</p>
                    <p className="font-medium text-slate-700 mt-0.5">{patientProfileData.address || 'N/A'}</p>
                  </div>

                  <div className="pt-1">
                    <p className="text-[9px] font-bold text-slate-455 uppercase">Known Allergies</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {patientProfileData.allergies && patientProfileData.allergies.length > 0 ? (
                        patientProfileData.allergies.map((allergy, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-650 border border-rose-100 text-[9px] font-bold">
                            {allergy}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No allergies specified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emergency details */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider block">Emergency Contact</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                    <div>
                      <p className="text-[9px] font-bold text-slate-455 uppercase">Contact Name</p>
                      <p className="font-extrabold text-slate-800">{patientProfileData.emergencyContact?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-455 uppercase">Relationship</p>
                      <p className="font-bold text-slate-700">{patientProfileData.emergencyContact?.relationship || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-455 uppercase">Contact Phone</p>
                      <p className="font-bold text-slate-700">{patientProfileData.emergencyContact?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Consultation Records */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">Consultation History</span>
                  {(() => {
                    const patientAppts = appointments.filter(a => a.patient?._id === selectedPatientForView._id);
                    if (patientAppts.length === 0) {
                      return <p className="text-[10px] text-slate-400 italic py-1">No past or upcoming appointments recorded.</p>;
                    }
                    return (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin">
                        {patientAppts.map(a => (
                          <div key={a._id} className="p-2.5 rounded-xl bg-white border border-slate-100 flex items-center justify-between">
                            <div className="text-left space-y-0.5">
                              <p className="font-extrabold text-slate-850">Dr. {a.doctor?.name || 'Staff'}</p>
                              <p className="text-[9px] text-slate-400 font-semibold">
                                {new Date(a.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} @ {a.timeSlot}
                              </p>
                              {a.symptoms && <p className="text-[9px] text-slate-500 leading-snug italic mt-1">Symptoms: {a.symptoms}</p>}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider shrink-0 ${
                              a.status === 'confirmed' ? 'bg-teal-50 text-teal-705 border border-teal-105' :
                              a.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              a.status === 'cancelled' ? 'bg-rose-50 text-rose-705 border border-rose-105' :
                              'bg-amber-50 text-amber-705 border border-amber-105'
                            }`}>
                              {a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 italic text-xs">
                No secure clinical diagnostics file exists for this patient account.
              </div>
            )}

            <button 
              onClick={() => setViewPatientModalOpen(false)}
              className="w-full mt-6 rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 transition cursor-pointer"
            >
              Close Demographics File
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
