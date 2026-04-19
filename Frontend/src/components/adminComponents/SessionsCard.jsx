import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/axios';

const SessionCard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ date: '', status: '' });

  // Force booking modal
  const [showForceForm, setShowForceForm] = useState(false);
  const [forceData, setForceData] = useState({
    patientEmail: '',
    practitionerEmail: '',
    startISO: '',
    durationMinutes: 60,
    therapyType: ''
  });
  const [forceLoading, setForceLoading] = useState(false);

  // Fetch sessions
  const fetchSessions = useCallback(async (pageNum = 1, filterParams = {}, isSearch = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 10, ...filterParams };
      const response = await api.get('/admin/sessions', { params });

      if (response.data.success) {
        const newSessions = response.data.data.sessions;
        if (isSearch) setSessions(newSessions);
        else setSessions(prev => pageNum === 1 ? newSessions : [...prev, ...newSessions]);
        setHasMore(pageNum < response.data.data.totalPages);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchSessions(1, filters, true);
  }, [filters]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight ||
      loading ||
      !hasMore
    )
      return;
    fetchSessions(page + 1, filters);
  }, [loading, hasMore, page, filters, fetchSessions]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const formatDateTime = (d) => {
    if (!d) return 'N/A';
    const date = new Date(d);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTime = (d) => {
    if (!d) return 'N/A';
    const date = new Date(d);
    return date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (m) => {
    const h = Math.floor(m / 60);
    const mins = m % 60;
    if (h === 0) return `${mins}m`;
    if (mins === 0) return `${h}h`;
    return `${h}h ${mins}m`;
  };

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  // Force book handler
  const handleForceBook = async (e) => {
    e.preventDefault();
    setForceLoading(true);
    try {
      const response = await api.post('/sessions/force', forceData, { withCredentials: true });
      alert(`✅ ${response.data.message}`);
      setShowForceForm(false);
      setForceData({ patientEmail: '', practitionerEmail: '', startISO: '', durationMinutes: 60, therapyType: '' });
      fetchSessions(1, filters, true);
    } catch (err) {
      console.error('Force booking failed:', err);
      alert(`❌ ${err.response?.data?.message || 'Force booking failed'}`);
    } finally {
      setForceLoading(false);
    }
  };

  // Export sessions to CSV
  const handleExportCSV = () => {
    if (sessions.length === 0) {
      alert("No sessions to export.");
      return;
    }

    const headers = [
      "Session ID",
      "Therapy Type",
      "Status",
      "Patient Name",
      "Practitioner Name",
      "Scheduled Date",
      "Start Time",
      "End Time",
      "Duration"
    ];

    const rows = sessions.map(s => [
      s._id,
      s.therapyType || "N/A",
      s.status,
      s.patientId?.name || "N/A",
      s.practitionerId?.name || "N/A",
      formatDateTime(s.scheduledStart).split(",")[0],
      formatTime(s.scheduledStart),
      formatTime(s.scheduledEnd),
      formatDuration(s.durationMinutes)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(v => `"${v}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `sessions_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Management</h1>
          <p className="text-gray-600 mt-2">Manage and view all therapy sessions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📤 Export Sessions (CSV)
          </button>
          <button
            onClick={() => setShowForceForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Force Book Session
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Status</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ date: '', status: '' })}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Session Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sessions.map((session) => (
          <div
            key={session._id}
            className="bg-white rounded-lg shadow-sm border border-green-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-4 border-b border-green-200 flex justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 capitalize">{session.therapyType}</h3>
                <p className="text-xs text-gray-500">ID: {session._id.slice(-8)}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                {session.status}
              </span>
            </div>
            <div className="p-4 text-sm space-y-2">
              <p><strong>Patient:</strong> {session.patientId?.name || 'N/A'}</p>
              <p><strong>Practitioner:</strong> {session.practitionerId?.name || 'N/A'}</p>
              <p><strong>Date:</strong> {formatDateTime(session.scheduledStart).split(',')[0]}</p>
              <p><strong>Time:</strong> {formatTime(session.scheduledStart)} - {formatTime(session.scheduledEnd)}</p>
              <p><strong>Duration:</strong> {formatDuration(session.durationMinutes)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* States */}
      {loading && <div className="p-8 text-center text-gray-600 animate-pulse">Loading sessions...</div>}
      {!loading && sessions.length === 0 && (
        <div className="p-8 text-center bg-white rounded-lg shadow-sm text-gray-500">No sessions found.</div>
      )}
      {!hasMore && sessions.length > 0 && (
        <div className="p-6 text-center mt-6 text-gray-500 bg-white rounded-lg shadow-sm">
          You've reached the end of the list.
        </div>
      )}
    </div>
  );
};

export default SessionCard;


// import React, { useState, useEffect, useCallback } from 'react';
// import api from '../../utils/axios'; // Your axios instance

// const SessionCard = () => {
//   const [sessions, setSessions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const [page, setPage] = useState(1);
//   const [filters, setFilters] = useState({
//     date: '',
//     status: '',
//     practitionerId: ''
//   });
//   const [showModal, setShowModal] = useState(false);
//   const [selectedSession, setSelectedSession] = useState(null);
//   const [availablePractitioners, setAvailablePractitioners] = useState([]);
//   const [newPractitionerId, setNewPractitionerId] = useState('');

//   // Fetch sessions with infinite scroll
//   const fetchSessions = useCallback(async (pageNum = 1, filterParams = {}, isSearch = false) => {
//     if (loading) return;
    
//     setLoading(true);
//     try {
//       const params = { 
//         page: pageNum, 
//         limit: 10,
//         ...filterParams
//       };

//       const response = await api.get('/admin/sessions', { params });
      
//       if (response.data.success) {
//         const newSessions = response.data.data.sessions;
        
//         if (isSearch) {
//           setSessions(newSessions);
//         } else {
//           setSessions(prev => pageNum === 1 ? newSessions : [...prev, ...newSessions]);
//         }
        
//         setHasMore(pageNum < response.data.data.totalPages);
//         setPage(pageNum);
//       }
//     } catch (err) {
//       console.error('Error fetching sessions:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [loading]);

//   // Fetch available practitioners
//   const fetchAvailablePractitioners = useCallback(async () => {
//     try {
//       const response = await api.get('/admin/practitioners');
//       if (response.data.success) {
//         setAvailablePractitioners(response.data.data.practitioners);
//       }
//     } catch (err) {
//       console.error('Error fetching practitioners:', err);
//     }
//   }, []);

//   // Initial load and filter changes
//   useEffect(() => {
//     fetchSessions(1, filters, true);
//     fetchAvailablePractitioners();
//   }, [filters, fetchSessions, fetchAvailablePractitioners]);

//   // Infinite scroll handler
//   const handleScroll = useCallback(() => {
//     if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading || !hasMore) {
//       return;
//     }
//     fetchSessions(page + 1, filters);
//   }, [loading, hasMore, page, filters, fetchSessions]);

//   useEffect(() => {
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, [handleScroll]);

//   // Format date and time
//   const formatDateTime = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   // Format time only
//   const formatTime = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   // Get status badge color
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'booked':
//         return 'bg-blue-100 text-blue-800 border-blue-200';
//       case 'completed':
//         return 'bg-green-100 text-green-800 border-green-200';
//       case 'cancelled':
//         return 'bg-red-100 text-red-800 border-red-200';
//       case 'rescheduled':
//         return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//       default:
//         return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   // Calculate duration in hours and minutes
//   const formatDuration = (minutes) => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     if (hours === 0) return `${mins}m`;
//     if (mins === 0) return `${hours}h`;
//     return `${hours}h ${mins}m`;
//   };

//   // Handle filter changes
//   const handleFilterChange = (key, value) => {
//     setFilters(prev => ({
//       ...prev,
//       [key]: value
//     }));
//   };

//   // Handle Reassign Practitioner
//   const handleReassignPractitioner = async () => {
//     try {
//       const response = await api.patch(`/admin/sessions/${selectedSession._id}/reassign`, {
//         practitionerId: newPractitionerId
//       });

//       if (response.data.success) {
//         setSessions(prev =>
//           prev.map(session =>
//             session._id === selectedSession._id ? { ...session, practitionerId: response.data.data.practitioner } : session
//           )
//         );
//         setShowModal(false);
//         setSelectedSession(null);
//         setNewPractitionerId('');
//       }
//     } catch (err) {
//       console.error('Error reassigning practitioner:', err);
//     }
//   };

  
//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Session Management</h1>
//         <p className="text-gray-600 mt-2">Manage and view all therapy sessions</p>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           {/* Date Filter */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Date
//             </label>
//             <input
//               type="date"
//               value={filters.date}
//               onChange={(e) => handleFilterChange('date', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* Status Filter */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Status
//             </label>
//             <select
//               value={filters.status}
//               onChange={(e) => handleFilterChange('status', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">All Status</option>
//               <option value="booked">Booked</option>
//               <option value="completed">Completed</option>
//               <option value="cancelled">Cancelled</option>
//               <option value="rescheduled">Rescheduled</option>
//             </select>
//           </div>

//           {/* Practitioner Filter */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Practitioner
//             </label>
//             <input
//               type="text"
//               placeholder="Practitioner ID"
//               value={filters.practitionerId}
//               onChange={(e) => handleFilterChange('practitionerId', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* Clear Filters */}
//           <div className="flex items-end">
//             <button
//               onClick={() => setFilters({ date: '', status: '', practitionerId: '' })}
//               className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//             >
//               Clear Filters
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Sessions Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {sessions.map((session) => (
//           <div 
//             key={session._id} 
//             className="bg-green-50 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-200"
//           >
//             {/* Card Header */}
//             <div className="p-4 border-b border-green-200">
//               <div className="flex justify-between items-start mb-2">
//                 <div>
//                   <h3 className="font-semibold text-gray-900 text-lg capitalize">
//                     {session.therapyType}
//                   </h3>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Session ID: {session._id.slice(-8)}
//                   </p>
//                 </div>
//                 <span 
//                   className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}
//                 >
//                   {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
//                 </span>
//               </div>

//               {/* AI Recommendation Badge */}
//               {session.aiMetadata?.recommendedByAI && (
//                 <div className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
//                   <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
//                   AI Recommended
//                 </div>
//               )}
//             </div>

//             {/* Card Body */}
//             <div className="p-4 space-y-4">
//               {/* Patient Information */}
//               <div className="space-y-2">
//                 <h4 className="font-medium text-gray-900 text-sm border-b border-green-200 pb-1">
//                   Patient Information
//                 </h4>
//                 <div className="space-y-1">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Name:</span>
//                     <span className="font-medium text-gray-900">{session.patientId?.name || 'N/A'}</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Phone:</span>
//                     <span className="font-medium text-gray-900">{session.patientId?.phone || 'N/A'}</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Patient ID:</span>
//                     <span className="font-medium text-gray-900 text-xs">{session.patientId?._id?.slice(-8) || 'N/A'}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Practitioner Information */}
//               <div className="space-y-2">
//                 <h4 className="font-medium text-gray-900 text-sm border-b border-green-200 pb-1">
//                   Practitioner Information
//                 </h4>
//                 <div className="space-y-1">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Name:</span>
//                     <span className="font-medium text-gray-900">{session.practitionerId?.name || 'N/A'}</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Specialization:</span>
//                     <span className="font-medium text-gray-900 text-right">
//                       {session.practitionerId?.specialization?.[0]?.therapyType || 'N/A'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Experience:</span>
//                     <span className="font-medium text-gray-900">
//                       {session.practitionerId?.specialization?.[0]?.yearsOfExperience 
//                         ? `${session.practitionerId.specialization[0].yearsOfExperience} yrs`
//                         : 'N/A'
//                       }
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Session Timing */}
//               <div className="space-y-2">
//                 <h4 className="font-medium text-gray-900 text-sm border-b border-green-200 pb-1">
//                   Session Timing
//                 </h4>
//                 <div className="space-y-1">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Date:</span>
//                     <span className="font-medium text-gray-900">
//                       {formatDateTime(session.scheduledStart).split(',')[0]}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Time:</span>
//                     <span className="font-medium text-gray-900">
//                       {formatTime(session.scheduledStart)} - {formatTime(session.scheduledEnd)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Duration:</span>
//                     <span className="font-medium text-gray-900">
//                       {formatDuration(session.durationMinutes)}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Additional Information */}
//               <div className="space-y-2">
//                 <h4 className="font-medium text-gray-900 text-sm border-b border-green-200 pb-1">
//                   Additional Info
//                 </h4>
//                 <div className="space-y-1">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Center ID:</span>
//                     <span className="font-medium text-gray-900 text-xs">{session.centerId?.slice(-8) || 'N/A'}</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Conflict Check:</span>
//                     <span className={`font-medium ${session.conflictChecked ? 'text-green-600' : 'text-yellow-600'}`}>
//                       {session.conflictChecked ? 'Completed' : 'Pending'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Reschedules:</span>
//                     <span className="font-medium text-gray-900">
//                       {session.rescheduleHistory?.length || 0}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Card Footer */}
//             <div className="p-4 border-t border-green-200 bg-green-100 rounded-b-lg">
//               <div className="flex justify-between items-center">
//                 {/* Reassign Practitioner Button */}
//                 <button
//                   onClick={() => {
//                     setShowModal(true);
//                     setSelectedSession(session);
//                   }}
//                   className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Reassign Practitioner
//                 </button>
                
//                 {/* Reschedule Button */}
//                 <button 
//                   className="px-3 py-2 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors"
//                 >
//                   Reschedule
//                 </button>
//               </div>

//               <div className="text-xs text-gray-600 mt-2 text-center">
//                 Created: {formatDateTime(session.createdAt)}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Modal for Reassign Practitioner */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl p-6 w-96">
//             <h2 className="text-xl font-semibold mb-4">Reassign Practitioner</h2>
            
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Select Practitioner
//             </label>
//             <select
//               value={newPractitionerId}
//               onChange={(e) => setNewPractitionerId(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">-- Select Practitioner --</option>
//               {availablePractitioners.map((practitioner) => (
//                 <option key={practitioner._id} value={practitioner._id}>
//                   {practitioner.name}
//                 </option>
//               ))}
//             </select>

//             <div className="mt-6 flex justify-end gap-4">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleReassignPractitioner}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Reassign
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SessionCard;

