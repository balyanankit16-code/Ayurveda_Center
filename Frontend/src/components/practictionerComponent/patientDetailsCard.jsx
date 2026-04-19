import React, { useState, useEffect } from 'react';
import api from '../../utils/axios.js';
import VideoCallModal from './VideoCallModal.jsx';
import webrtcService from '../../services/webrtcService.js';
import socketService from '../../utils/socket.js';

const PatientCard = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedPatientForCall, setSelectedPatientForCall] = useState(null);

  useEffect(() => {
    fetchPatients();
    
    // Initialize socket connection
    const socket = socketService.connect();
    webrtcService.initialize(socket);

    return () => {
      socketService.disconnect();
    };
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/practitioner/patients');
      setPatients(response.data.data.patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      alert('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    setDetailsLoading(true);
    try {
      const response = await api.get(`/practitioner/patients/${patientId}`);
      setPatientDetails(response.data.data);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      alert('Failed to fetch patient details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    fetchPatientDetails(patient._id);
  };

  const handleStartVideoCall = (patient) => {
    setSelectedPatientForCall(patient);
    setShowVideoCall(true);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) return <div className="text-center py-8">Loading patients...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Patient List */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Assigned Patients</h2>
          <div className="space-y-3">
            {patients.map((patient) => (
              <div
                key={patient._id}
                onClick={() => handlePatientClick(patient)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedPatient?._id === patient._id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <h3 className="font-semibold text-gray-800">{patient.name}</h3>
                <p className="text-sm text-gray-600">
                  {patient.gender || 'N/A'} • {calculateAge(patient.dateOfBirth)} yrs
                </p>
                <p className="text-sm text-gray-600">{patient.phone || 'No phone'}</p>
              </div>
            ))}
            {patients.length === 0 && (
              <p className="text-center text-gray-500 py-4">No patients assigned</p>
            )}
          </div>
        </div>
      </div>

      {/* Patient Details */}
      <div className="lg:col-span-2">
        {detailsLoading ? (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p>Loading patient details...</p>
          </div>
        ) : patientDetails ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Patient Details - {patientDetails.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-gray-900">{patientDetails.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{patientDetails.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{patientDetails.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Gender</label>
                    <p className="text-gray-900">{patientDetails.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                    <p className="text-gray-900">
                      {patientDetails.dateOfBirth 
                        ? new Date(patientDetails.dateOfBirth).toLocaleDateString() 
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Medical Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Medical History</label>
                    <p className="text-gray-900">
                      {patientDetails.medicalHistory?.condition || 'No condition specified'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Therapy Preferences</label>
                    <div className="mt-1">
                      {patientDetails.therapyPreferences?.length > 0 ? (
                        patientDetails.therapyPreferences.map((pref, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm mr-2 mb-2 inline-block">
                            {pref}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No preferences specified</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-500">Select a patient to view details</p>
          </div>
        )}
      </div>

      {/* Video Call Modal */}
      <VideoCallModal
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        patient={selectedPatientForCall}
        onCallEnd={() => {
          // Refresh patient data or update UI as needed
          if (selectedPatientForCall) {
            fetchPatientDetails(selectedPatientForCall._id);
          }
        }}
      />
    </div>
  );
};

export default PatientCard;
