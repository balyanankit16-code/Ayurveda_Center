// import React, { useState, useEffect } from 'react';
// import api from '../../utils/axios';
// import { useAuth } from '../../utils/authContext';

// const PractitionerSessions = () => {
//   const { user, isAuthenticated, loading: authLoading } = useAuth();
//   const [upcomingSessions, setUpcomingSessions] = useState([]);
//   const [completedSessions, setCompletedSessions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('upcoming');
//   const [showCompleteModal, setShowCompleteModal] = useState(false);
//   const [showOutcomeModal, setShowOutcomeModal] = useState(false);
//   const [selectedSession, setSelectedSession] = useState(null);
//   const [outcomeData, setOutcomeData] = useState({
//     completedOnTime: true,
//     effectiveness: 5,
//     notes: '',
//     goalsAchieved: [''],
//     challengesFaced: [''],
//     recommendations: ''
//   });

//   // Fetch user data first
//   const fetchUserData = async () => {
//     try {
//       const response = await api.get('/auth/me');
//       return response.data.data;
//     } catch (error) {
//       console.error('Error fetching user:', error);
//       throw error;
//     }
//   };

//   // Fetch upcoming sessions
//   const fetchUpcomingSessions = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const response = await api.get('/practitioner/sessions/upcoming?page=1&limit=10');
//       console.log('Upcoming sessions response:', response.data);
      
//       if (response.data.success) {
//         // Your backend returns: data: { sessions, totalPages, currentPage, total }
//         const sessions = response.data.data.sessions || [];
//         setUpcomingSessions(sessions);
//       } else {
//         throw new Error(response.data.message || 'Failed to fetch upcoming sessions');
//       }
//     } catch (err) {
//       console.error('Error fetching upcoming sessions:', err);
//       setError(err.response?.data?.message || err.message || 'Failed to fetch upcoming sessions');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch completed sessions
//   const fetchCompletedSessions = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const response = await api.get('/practitioner/sessions/completed?page=1&limit=10');
//       console.log('Completed sessions response:', response.data);
      
//       if (response.data.success) {
//         const sessions = response.data.data.sessions || [];
//         setCompletedSessions(sessions);
//       } else {
//         throw new Error(response.data.message || 'Failed to fetch completed sessions');
//       }
//     } catch (err) {
//       console.error('Error fetching completed sessions:', err);
//       setError(err.response?.data?.message || err.message || 'Failed to fetch completed sessions');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Mark session as complete
//   const markSessionComplete = async (sessionId, outcome) => {
//     setLoading(true);
//     setError('');
//     try {
//       const response = await api.patch(`/practitioner/sessions/${sessionId}/complete`, { outcome });
      
//       if (response.data.success) {
//         // Remove from upcoming and add to completed
//         setUpcomingSessions(prev => prev.filter(session => session._id !== sessionId));
//         setCompletedSessions(prev => [response.data.data, ...prev]);
//         return response.data.data;
//       } else {
//         throw new Error(response.data.message || 'Failed to mark session complete');
//       }
//     } catch (err) {
//       console.error('Error marking session complete:', err);
//       setError(err.response?.data?.message || err.message || 'Failed to mark session as complete');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Add session outcome
//   const addSessionOutcome = async (sessionId, outcome) => {
//     setLoading(true);
//     setError('');
//     try {
//       const response = await api.patch(`/practitioner/sessions/${sessionId}/outcome`, { outcome });
      
//       if (response.data.success) {
//         // Update the session in completed sessions
//         setCompletedSessions(prev => 
//           prev.map(session => 
//             session._id === sessionId ? response.data.data : session
//           )
//         );
//         return response.data.data;
//       } else {
//         throw new Error(response.data.message || 'Failed to add outcome');
//       }
//     } catch (err) {
//       console.error('Error adding session outcome:', err);
//       setError(err.response?.data?.message || err.message || 'Failed to add session outcome');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Refresh all sessions
//   const refreshSessions = async () => {
//     await Promise.all([
//       fetchUpcomingSessions(),
//       fetchCompletedSessions()
//     ]);
//   };

//   // Initial load
//   useEffect(() => {
//     const initialize = async () => {
//       if (!isAuthenticated) return;
      
//       try {
//         // First verify we have practitioner access
//         if (user?.role !== 'practitioner') {
//           setError('Access denied. Practitioner role required.');
//           return;
//         }
        
//         await refreshSessions();
//       } catch (err) {
//         console.error('Initialization failed:', err);
//         setError('Failed to load sessions. Please try again.');
//       }
//     };

//     if (!authLoading) {
//       initialize();
//     }
//   }, [isAuthenticated, authLoading, user]);

//   // Handle mark session as complete
//   const handleMarkComplete = async () => {
//     if (!selectedSession) return;

//     try {
//       await markSessionComplete(selectedSession._id, outcomeData);
//       setShowCompleteModal(false);
//       setSelectedSession(null);
//       setOutcomeData({
//         completedOnTime: true,
//         effectiveness: 5,
//         notes: '',
//         goalsAchieved: [''],
//         challengesFaced: [''],
//         recommendations: ''
//       });
//       alert('Session marked as completed successfully!');
//     } catch (err) {
//       // Error is handled in the function
//     }
//   };

//   // Handle add outcome
//   const handleAddOutcome = async () => {
//     if (!selectedSession) return;

//     try {
//       await addSessionOutcome(selectedSession._id, outcomeData);
//       setShowOutcomeModal(false);
//       setSelectedSession(null);
//       setOutcomeData({
//         completedOnTime: true,
//         effectiveness: 5,
//         notes: '',
//         goalsAchieved: [''],
//         challengesFaced: [''],
//         recommendations: ''
//       });
//       alert('Outcome added successfully!');
//     } catch (err) {
//       // Error is handled in the function
//     }
//   };

//   // Open complete modal
//   const openCompleteModal = (session) => {
//     setSelectedSession(session);
//     setShowCompleteModal(true);
//   };

//   // Open outcome modal
//   const openOutcomeModal = (session) => {
//     setSelectedSession(session);
//     setOutcomeData(session.outcome || {
//       completedOnTime: true,
//       effectiveness: 5,
//       notes: '',
//       goalsAchieved: [''],
//       challengesFaced: [''],
//       recommendations: ''
//     });
//     setShowOutcomeModal(true);
//   };

//   // Format date and time
//   const formatDateTime = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       return {
//         date: date.toLocaleDateString('en-US', { 
//           weekday: 'short', 
//           year: 'numeric', 
//           month: 'short', 
//           day: 'numeric' 
//         }),
//         time: date.toLocaleTimeString('en-US', { 
//           hour: '2-digit', 
//           minute: '2-digit' 
//         })
//       };
//     } catch (error) {
//       return { date: 'Invalid date', time: '' };
//     }
//   };

//   // Calculate patient age
//   const calculateAge = (dateOfBirth) => {
//     if (!dateOfBirth) return 'N/A';
//     try {
//       const birthDate = new Date(dateOfBirth);
//       const today = new Date();
//       let age = today.getFullYear() - birthDate.getFullYear();
//       const monthDiff = today.getMonth() - birthDate.getMonth();
//       if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//         age--;
//       }
//       return age;
//     } catch (error) {
//       return 'N/A';
//     }
//   };

//   // Show loading while checking authentication
//   if (authLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
//         <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
//           <div className="text-gray-600">Checking authentication...</div>
//         </div>
//       </div>
//     );
//   }

//   // Check if user is authenticated and practitioner
//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
//         <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
//           <div className="text-red-500 text-6xl mb-4">🔒</div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
//           <p className="text-gray-600 mb-6">Please login to access this page</p>
//           <button
//             onClick={() => window.location.href = '/auth'}
//             className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//           >
//             Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (user?.role !== 'practitioner') {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
//         <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
//           <div className="text-red-500 text-6xl mb-4">⛔</div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
//           <p className="text-gray-600 mb-6">Practitioner access required</p>
//           <button
//             onClick={() => window.history.back()}
//             className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (loading && upcomingSessions.length === 0 && completedSessions.length === 0) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
//         <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
//           <div className="text-gray-600">Loading sessions...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
//             <p className="text-gray-600 mt-2">
//               Manage your upcoming sessions and review completed ones
//             </p>
//           </div>
//           <div className="text-sm text-gray-500 bg-green-50 px-3 py-1 rounded-full">
//             Welcome, {user?.name || 'Practitioner'}
//           </div>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <div className="text-red-500 mr-3">
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="text-red-800">{error}</div>
//             </div>
//             <button
//               onClick={refreshSessions}
//               className="text-red-600 hover:text-red-800 text-sm font-medium"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Tabs */}
//       <div className="bg-white rounded-lg shadow-sm mb-6">
//         <div className="border-b border-gray-200">
//           <nav className="flex -mb-px">
//             <button
//               onClick={() => setActiveTab('upcoming')}
//               className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
//                 activeTab === 'upcoming'
//                   ? 'border-green-500 text-green-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               Upcoming Sessions ({upcomingSessions.length})
//             </button>
//             <button
//               onClick={() => setActiveTab('completed')}
//               className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
//                 activeTab === 'completed'
//                   ? 'border-green-500 text-green-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               Completed Sessions ({completedSessions.length})
//             </button>
//           </nav>
//         </div>
//       </div>

//       {/* Sessions List */}
//       <div className="space-y-4">
//         {activeTab === 'upcoming' && (
//           <>
//             {upcomingSessions.length === 0 ? (
//               <div className="bg-white rounded-lg shadow-sm p-8 text-center">
//                 <div className="text-gray-400 text-6xl mb-4">📅</div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Sessions</h3>
//                 <p className="text-gray-600">You don't have any upcoming sessions scheduled.</p>
//               </div>
//             ) : (
//               upcomingSessions.map((session) => {
//                 const { date, time } = formatDateTime(session.scheduledStart);
//                 return (
//                   <div key={session._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-4">
//                           <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
//                             <span className="text-green-600 text-lg">👤</span>
//                           </div>
//                           <div>
//                             <h3 className="text-lg font-semibold text-gray-900">
//                               {session.patientId?.name || 'Patient'}
//                             </h3>
//                             <p className="text-gray-600">
//                               {session.therapyType} • {calculateAge(session.patientId?.dateOfBirth)} yrs • {session.patientId?.gender}
//                             </p>
//                           </div>
//                         </div>
                        
//                         <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
//                           <div>
//                             <p className="text-sm text-gray-600">Date & Time</p>
//                             <p className="font-semibold text-gray-900">{date} at {time}</p>
//                           </div>
//                           <div>
//                             <p className="text-sm text-gray-600">Duration</p>
//                             <p className="font-semibold text-gray-900">{session.durationMinutes} minutes</p>
//                           </div>
//                           <div>
//                             <p className="text-sm text-gray-600">Center</p>
//                             <p className="font-semibold text-gray-900">{session.centerId?.name}</p>
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="flex flex-col space-y-2">
//                         <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//                           session.status === 'confirmed' 
//                             ? 'bg-green-100 text-green-800' 
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}>
//                           {session.status}
//                         </span>
//                         <button
//                           onClick={() => openCompleteModal(session)}
//                           className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
//                         >
//                           Mark Complete
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             )}
//           </>
//         )}

//         {activeTab === 'completed' && (
//           <>
//             {completedSessions.length === 0 ? (
//               <div className="bg-white rounded-lg shadow-sm p-8 text-center">
//                 <div className="text-gray-400 text-6xl mb-4">✅</div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Sessions</h3>
//                 <p className="text-gray-600">You haven't completed any sessions yet.</p>
//               </div>
//             ) : (
//               completedSessions.map((session) => {
//                 const { date, time } = formatDateTime(session.scheduledStart);
//                 return (
//                   <div key={session._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-4">
//                           <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                             <span className="text-blue-600 text-lg">👤</span>
//                           </div>
//                           <div>
//                             <h3 className="text-lg font-semibold text-gray-900">
//                               {session.patientId?.name || 'Patient'}
//                             </h3>
//                             <p className="text-gray-600">
//                               {session.therapyType} • {session.patientId?.gender}
//                             </p>
//                           </div>
//                         </div>
                        
//                         <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
//                           <div>
//                             <p className="text-sm text-gray-600">Date & Time</p>
//                             <p className="font-semibold text-gray-900">{date} at {time}</p>
//                           </div>
//                           <div>
//                             <p className="text-sm text-gray-600">Duration</p>
//                             <p className="font-semibold text-gray-900">{session.durationMinutes} minutes</p>
//                           </div>
//                           <div>
//                             <p className="text-sm text-gray-600">Center</p>
//                             <p className="font-semibold text-gray-900">{session.centerId?.name}</p>
//                           </div>
//                         </div>

//                         {session.outcome && (
//                           <div className="mt-4 p-4 bg-gray-50 rounded-lg">
//                             <h4 className="font-semibold text-gray-900 mb-2">Session Outcome</h4>
//                             <p className="text-gray-600 text-sm">
//                               {session.outcome.notes || 'No additional notes provided.'}
//                             </p>
//                             {session.outcome.effectiveness && (
//                               <div className="mt-2 flex items-center space-x-1">
//                                 <span className="text-sm text-gray-600">Effectiveness:</span>
//                                 <div className="flex">
//                                   {[...Array(5)].map((_, i) => (
//                                     <span
//                                       key={i}
//                                       className={`text-lg ${
//                                         i < session.outcome.effectiveness 
//                                           ? 'text-yellow-400' 
//                                           : 'text-gray-300'
//                                       }`}
//                                     >
//                                       ★
//                                     </span>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </div>
                      
//                       <div className="flex flex-col space-y-2">
//                         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                           Completed
//                         </span>
//                         <button
//                           onClick={() => openOutcomeModal(session)}
//                           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
//                         >
//                           {session.outcome ? 'Edit Outcome' : 'Add Outcome'}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             )}
//           </>
//         )}
//       </div>

//       {/* Modals (keep the same modal code from your original component) */}
//       {showCompleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-xl font-semibold text-gray-900">Mark Session as Complete</h2>
//             </div>
            
//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Session Notes
//                 </label>
//                 <textarea
//                   value={outcomeData.notes}
//                   onChange={(e) => setOutcomeData({...outcomeData, notes: e.target.value})}
//                   rows="4"
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//                   placeholder="Add notes about the session..."
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Effectiveness Rating
//                   </label>
//                   <select
//                     value={outcomeData.effectiveness}
//                     onChange={(e) => setOutcomeData({...outcomeData, effectiveness: parseInt(e.target.value)})}
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//                   >
//                     <option value={5}>Excellent (5 stars)</option>
//                     <option value={4}>Very Good (4 stars)</option>
//                     <option value={3}>Good (3 stars)</option>
//                     <option value={2}>Fair (2 stars)</option>
//                     <option value={1}>Poor (1 star)</option>
//                   </select>
//                 </div>

//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     checked={outcomeData.completedOnTime}
//                     onChange={(e) => setOutcomeData({...outcomeData, completedOnTime: e.target.checked})}
//                     className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
//                   />
//                   <label className="ml-2 text-sm text-gray-700">Completed on time</label>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Recommendations
//                 </label>
//                 <textarea
//                   value={outcomeData.recommendations}
//                   onChange={(e) => setOutcomeData({...outcomeData, recommendations: e.target.value})}
//                   rows="2"
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//                   placeholder="Any recommendations for follow-up..."
//                 />
//               </div>
//             </div>

//             <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowCompleteModal(false)}
//                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleMarkComplete}
//                 disabled={loading}
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
//               >
//                 {loading ? 'Completing...' : 'Mark Complete'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showOutcomeModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-xl font-semibold text-gray-900">
//                 {selectedSession?.outcome ? 'Edit Session Outcome' : 'Add Session Outcome'}
//               </h2>
//             </div>
            
//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Session Notes
//                 </label>
//                 <textarea
//                   value={outcomeData.notes}
//                   onChange={(e) => setOutcomeData({...outcomeData, notes: e.target.value})}
//                   rows="4"
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//                   placeholder="Add notes about the session..."
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Effectiveness Rating
//                 </label>
//                 <select
//                   value={outcomeData.effectiveness}
//                   onChange={(e) => setOutcomeData({...outcomeData, effectiveness: parseInt(e.target.value)})}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//                 >
//                   <option value={5}>Excellent (5 stars)</option>
//                   <option value={4}>Very Good (4 stars)</option>
//                   <option value={3}>Good (3 stars)</option>
//                   <option value={2}>Fair (2 stars)</option>
//                   <option value={1}>Poor (1 star)</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Recommendations
//                 </label>
//                 <textarea
//                   value={outcomeData.recommendations}
//                   onChange={(e) => setOutcomeData({...outcomeData, recommendations: e.target.value})}
//                   rows="2"
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//                   placeholder="Any recommendations for follow-up..."
//                 />
//               </div>
//             </div>

//             <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowOutcomeModal(false)}
//                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleAddOutcome}
//                 disabled={loading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {loading ? 'Saving...' : 'Save Outcome'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PractitionerSessions

import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { useAuth } from '../../utils/authContext';

const PractitionerSessions = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [outcomeData, setOutcomeData] = useState({
    completedOnTime: true,
    effectiveness: 5,
    notes: '',
    goalsAchieved: [''],
    challengesFaced: [''],
    recommendations: ''
  });
  const [rescheduleData, setRescheduleData] = useState({
    newDate: '',
    reason: ''
  });

  // Fetch user data first
  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  };

  // Fetch upcoming sessions
  const fetchUpcomingSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/practitioner/sessions/upcoming?page=1&limit=10');
      console.log('Upcoming sessions response:', response.data);
      
      if (response.data.success) {
        // Your backend returns: data: { sessions, totalPages, currentPage, total }
        const sessions = response.data.data.sessions || [];
        setUpcomingSessions(sessions);
      } else {
        throw new Error(response.data.message || 'Failed to fetch upcoming sessions');
      }
    } catch (err) {
      console.error('Error fetching upcoming sessions:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch upcoming sessions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch completed sessions
  const fetchCompletedSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/practitioner/sessions/completed?page=1&limit=10');
      console.log('Completed sessions response:', response.data);
      
      if (response.data.success) {
        const sessions = response.data.data.sessions || [];
        setCompletedSessions(sessions);
      } else {
        throw new Error(response.data.message || 'Failed to fetch completed sessions');
      }
    } catch (err) {
      console.error('Error fetching completed sessions:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch completed sessions');
    } finally {
      setLoading(false);
    }
  };

  // Mark session as complete
  const markSessionComplete = async (sessionId, outcome) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.patch(`/practitioner/sessions/${sessionId}/complete`, { outcome });
      
      if (response.data.success) {
        // Remove from upcoming and add to completed
        setUpcomingSessions(prev => prev.filter(session => session._id !== sessionId));
        setCompletedSessions(prev => [response.data.data, ...prev]);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to mark session complete');
      }
    } catch (err) {
      console.error('Error marking session complete:', err);
      setError(err.response?.data?.message || err.message || 'Failed to mark session as complete');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add session outcome
  const addSessionOutcome = async (sessionId, outcome) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.patch(`/practitioner/sessions/${sessionId}/outcome`, { outcome });
      
      if (response.data.success) {
        // Update the session in completed sessions
        setCompletedSessions(prev => 
          prev.map(session => 
            session._id === sessionId ? response.data.data : session
          )
        );
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to add outcome');
      }
    } catch (err) {
      console.error('Error adding session outcome:', err);
      setError(err.response?.data?.message || err.message || 'Failed to add session outcome');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create reschedule request
  const createRescheduleRequest = async (sessionId, requestData) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/reschedule', {
        sessionId,
        newDate: requestData.newDate,
        reason: requestData.reason
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create reschedule request');
      }
    } catch (err) {
      console.error('Error creating reschedule request:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create reschedule request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh all sessions
  const refreshSessions = async () => {
    await Promise.all([
      fetchUpcomingSessions(),
      fetchCompletedSessions()
    ]);
  };

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      if (!isAuthenticated) return;
      
      try {
        // First verify we have practitioner access
        if (user?.role !== 'practitioner') {
          setError('Access denied. Practitioner role required.');
          return;
        }
        
        await refreshSessions();
      } catch (err) {
        console.error('Initialization failed:', err);
        setError('Failed to load sessions. Please try again.');
      }
    };

    if (!authLoading) {
      initialize();
    }
  }, [isAuthenticated, authLoading, user]);

  // Handle mark session as complete
  const handleMarkComplete = async () => {
    if (!selectedSession) return;

    try {
      await markSessionComplete(selectedSession._id, outcomeData);
      setShowCompleteModal(false);
      setSelectedSession(null);
      setOutcomeData({
        completedOnTime: true,
        effectiveness: 5,
        notes: '',
        goalsAchieved: [''],
        challengesFaced: [''],
        recommendations: ''
      });
      alert('Session marked as completed successfully!');
    } catch (err) {
      // Error is handled in the function
    }
  };

  // Handle add outcome
  const handleAddOutcome = async () => {
    if (!selectedSession) return;

    try {
      await addSessionOutcome(selectedSession._id, outcomeData);
      setShowOutcomeModal(false);
      setSelectedSession(null);
      setOutcomeData({
        completedOnTime: true,
        effectiveness: 5,
        notes: '',
        goalsAchieved: [''],
        challengesFaced: [''],
        recommendations: ''
      });
      alert('Outcome added successfully!');
    } catch (err) {
      // Error is handled in the function
    }
  };

  // Handle reschedule request
  const handleRescheduleRequest = async () => {
    if (!selectedSession) return;

    try {
      await createRescheduleRequest(selectedSession._id, rescheduleData);
      setShowRescheduleModal(false);
      setSelectedSession(null);
      setRescheduleData({
        newDate: '',
        reason: ''
      });
      alert('Reschedule request submitted successfully!');
    } catch (err) {
      // Error is handled in the function
    }
  };

  // Open complete modal
  const openCompleteModal = (session) => {
    setSelectedSession(session);
    setShowCompleteModal(true);
  };

  // Open outcome modal
  const openOutcomeModal = (session) => {
    setSelectedSession(session);
    setOutcomeData(session.outcome || {
      completedOnTime: true,
      effectiveness: 5,
      notes: '',
      goalsAchieved: [''],
      challengesFaced: [''],
      recommendations: ''
    });
    setShowOutcomeModal(true);
  };

  // Open reschedule modal
  const openRescheduleModal = (session) => {
    setSelectedSession(session);
    setRescheduleData({
      newDate: '',
      reason: ''
    });
    setShowRescheduleModal(true);
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        time: date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
    } catch (error) {
      return { date: 'Invalid date', time: '' };
    }
  };

  // Calculate patient age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      return 'N/A';
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and practitioner
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please login to access this page</p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (user?.role !== 'practitioner') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⛔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Practitioner access required</p>
          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading && upcomingSessions.length === 0 && completedSessions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading sessions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
            <p className="text-gray-600 mt-2">
              Manage your upcoming sessions and review completed ones
            </p>
          </div>
          <div className="text-sm text-gray-500 bg-green-50 px-3 py-1 rounded-full">
            Welcome, {user?.name || 'Practitioner'}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-red-800">{error}</div>
            </div>
            <button
              onClick={refreshSessions}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming Sessions ({upcomingSessions.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed Sessions ({completedSessions.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {activeTab === 'upcoming' && (
          <>
            {upcomingSessions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Sessions</h3>
                <p className="text-gray-600">You don't have any upcoming sessions scheduled.</p>
              </div>
            ) : (
              upcomingSessions.map((session) => {
                const { date, time } = formatDateTime(session.scheduledStart);
                return (
                  <div key={session._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-lg">👤</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {session.patientId?.name || 'Patient'}
                            </h3>
                            <p className="text-gray-600">
                              {session.therapyType} • {calculateAge(session.patientId?.dateOfBirth)} yrs • {session.patientId?.gender}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Date & Time</p>
                            <p className="font-semibold text-gray-900">{date} at {time}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-semibold text-gray-900">{session.durationMinutes} minutes</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Center</p>
                            <p className="font-semibold text-gray-900">{session.centerId?.name}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          session.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {session.status}
                        </span>
                        <button
                          onClick={() => openRescheduleModal(session)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => openCompleteModal(session)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Mark Complete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {activeTab === 'completed' && (
          <>
            {completedSessions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">✅</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Sessions</h3>
                <p className="text-gray-600">You haven't completed any sessions yet.</p>
              </div>
            ) : (
              completedSessions.map((session) => {
                const { date, time } = formatDateTime(session.scheduledStart);
                return (
                  <div key={session._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-lg">👤</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {session.patientId?.name || 'Patient'}
                            </h3>
                            <p className="text-gray-600">
                              {session.therapyType} • {session.patientId?.gender}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Date & Time</p>
                            <p className="font-semibold text-gray-900">{date} at {time}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-semibold text-gray-900">{session.durationMinutes} minutes</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Center</p>
                            <p className="font-semibold text-gray-900">{session.centerId?.name}</p>
                          </div>
                        </div>

                        {session.outcome && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">Session Outcome</h4>
                            <p className="text-gray-600 text-sm">
                              {session.outcome.notes || 'No additional notes provided.'}
                            </p>
                            {session.outcome.effectiveness && (
                              <div className="mt-2 flex items-center space-x-1">
                                <span className="text-sm text-gray-600">Effectiveness:</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`text-lg ${
                                        i < session.outcome.effectiveness 
                                          ? 'text-yellow-400' 
                                          : 'text-gray-300'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                        <button
                          onClick={() => openOutcomeModal(session)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          {session.outcome ? 'Edit Outcome' : 'Add Outcome'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      {/* Complete Session Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Mark Session as Complete</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Notes
                </label>
                <textarea
                  value={outcomeData.notes}
                  onChange={(e) => setOutcomeData({...outcomeData, notes: e.target.value})}
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Add notes about the session..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effectiveness Rating
                  </label>
                  <select
                    value={outcomeData.effectiveness}
                    onChange={(e) => setOutcomeData({...outcomeData, effectiveness: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value={5}>Excellent (5 stars)</option>
                    <option value={4}>Very Good (4 stars)</option>
                    <option value={3}>Good (3 stars)</option>
                    <option value={2}>Fair (2 stars)</option>
                    <option value={1}>Poor (1 star)</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={outcomeData.completedOnTime}
                    onChange={(e) => setOutcomeData({...outcomeData, completedOnTime: e.target.checked})}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Completed on time</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendations
                </label>
                <textarea
                  value={outcomeData.recommendations}
                  onChange={(e) => setOutcomeData({...outcomeData, recommendations: e.target.value})}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Any recommendations for follow-up..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkComplete}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Completing...' : 'Mark Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outcome Modal */}
      {showOutcomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedSession?.outcome ? 'Edit Session Outcome' : 'Add Session Outcome'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Notes
                </label>
                <textarea
                  value={outcomeData.notes}
                  onChange={(e) => setOutcomeData({...outcomeData, notes: e.target.value})}
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Add notes about the session..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effectiveness Rating
                </label>
                <select
                  value={outcomeData.effectiveness}
                  onChange={(e) => setOutcomeData({...outcomeData, effectiveness: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={5}>Excellent (5 stars)</option>
                  <option value={4}>Very Good (4 stars)</option>
                  <option value={3}>Good (3 stars)</option>
                  <option value={2}>Fair (2 stars)</option>
                  <option value={1}>Poor (1 star)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendations
                </label>
                <textarea
                  value={outcomeData.recommendations}
                  onChange={(e) => setOutcomeData({...outcomeData, recommendations: e.target.value})}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Any recommendations for follow-up..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowOutcomeModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOutcome}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Outcome'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Request Reschedule</h2>
              <p className="text-gray-600 text-sm mt-1">
                Request to reschedule this session to a new date and time
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={rescheduleData.newDate}
                  onChange={(e) => setRescheduleData({...rescheduleData, newDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Reschedule
                </label>
                <textarea
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({...rescheduleData, reason: e.target.value})}
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide the reason for rescheduling this session..."
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {rescheduleData.reason.length}/300 characters
                </p>
              </div>

              {selectedSession && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 text-sm mb-2">Current Session Details</h4>
                  <p className="text-blue-800 text-sm">
                    <strong>Patient:</strong> {selectedSession.patientId?.name || 'Patient'}
                  </p>
                  <p className="text-blue-800 text-sm">
                    <strong>Current Time:</strong> {formatDateTime(selectedSession.scheduledStart).date} at {formatDateTime(selectedSession.scheduledStart).time}
                  </p>
                  <p className="text-blue-800 text-sm">
                    <strong>Therapy Type:</strong> {selectedSession.therapyType}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleRequest}
                disabled={loading || !rescheduleData.newDate || !rescheduleData.reason}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PractitionerSessions;