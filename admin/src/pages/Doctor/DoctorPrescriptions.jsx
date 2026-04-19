import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'

const DoctorPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([])
    const [appointmentsWithPatients, setAppointmentsWithPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [selectedPrescription, setSelectedPrescription] = useState(null)
    const [formData, setFormData] = useState({
        patientId: '',
        appointmentId: '',
        diagnosis: '',
        symptoms: [''],
        medications: [{
            name: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: '',
            beforeAfterMeal: 'After Meal'
        }],
        testsRecommended: [{
            testName: '',
            testDescription: '',
            urgency: 'Routine'
        }],
        instructions: '',
        followUpDate: ''
    })

    const { backendUrl, dToken } = useContext(DoctorContext)
    const [docId, setDocId] = useState('')

    // Function to decode JWT token and extract docId
    const decodeToken = (token) => {
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            return payload.id;
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        if (dToken) {
            const extractedDocId = decodeToken(dToken);
            if (extractedDocId) {
                setDocId(extractedDocId);
            }
        }
    }, [dToken])

    useEffect(() => {
        if (dToken && docId) {
            loadPrescriptions()
            loadAppointmentsWithPatients()
        }
    }, [dToken, docId])

    const loadPrescriptions = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/prescription/doctor`, {
                headers: { dToken }
            })
            if (data.success) {
                setPrescriptions(data.prescriptions)
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to load prescriptions')
        }
    }

    const loadAppointmentsWithPatients = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/prescription/doctor/appointments`, {
                headers: { dToken }
            })

            if (data.success) {
                setAppointmentsWithPatients(data.appointments)
            } else {
                toast.error(data.message || 'Failed to load appointments')
            }
        } catch (error) {
            toast.error('Failed to load appointments')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field, value, index = null) => {
        if (index !== null) {
            if (field === 'symptoms') {
                const newSymptoms = [...formData.symptoms]
                newSymptoms[index] = value
                setFormData({ ...formData, symptoms: newSymptoms })
            } else if (field === 'medications') {
                const newMedications = [...formData.medications]
                newMedications[index] = { ...newMedications[index], [Object.keys(value)[0]]: Object.values(value)[0] }
                setFormData({ ...formData, medications: newMedications })
            } else if (field === 'testsRecommended') {
                const newTests = [...formData.testsRecommended]
                newTests[index] = { ...newTests[index], [Object.keys(value)[0]]: Object.values(value)[0] }
                setFormData({ ...formData, testsRecommended: newTests })
            }
        } else {
            setFormData({ ...formData, [field]: value })
        }
    }

    const addSymptom = () => {
        setFormData({ ...formData, symptoms: [...formData.symptoms, ''] })
    }

    const removeSymptom = (index) => {
        const newSymptoms = formData.symptoms.filter((_, i) => i !== index)
        setFormData({ ...formData, symptoms: newSymptoms })
    }

    const addMedication = () => {
        setFormData({
            ...formData,
            medications: [...formData.medications, {
                name: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: '',
                beforeAfterMeal: 'After Meal'
            }]
        })
    }

    const removeMedication = (index) => {
        const newMedications = formData.medications.filter((_, i) => i !== index)
        setFormData({ ...formData, medications: newMedications })
    }

    const addTest = () => {
        setFormData({
            ...formData,
            testsRecommended: [...formData.testsRecommended, {
                testName: '',
                testDescription: '',
                urgency: 'Routine'
            }]
        })
    }

    const removeTest = (index) => {
        const newTests = formData.testsRecommended.filter((_, i) => i !== index)
        setFormData({ ...formData, testsRecommended: newTests })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Validate required fields
        if (!formData.patientId || !formData.appointmentId || !formData.diagnosis || !formData.medications[0].name) {
            toast.error('Please fill all required fields')
            return
        }

        try {
            const { data } = await axios.post(`${backendUrl}/api/prescription/create`, {
                ...formData,
                docId
            }, {
                headers: { dToken }
            })

            if (data.success) {
                toast.success('Prescription created successfully')
                setShowCreateForm(false)
                setFormData({
                    patientId: '',
                    appointmentId: '',
                    diagnosis: '',
                    symptoms: [''],
                    medications: [{
                        name: '',
                        dosage: '',
                        frequency: '',
                        duration: '',
                        instructions: '',
                        beforeAfterMeal: 'After Meal'
                    }],
                    testsRecommended: [{
                        testName: '',
                        testDescription: '',
                        urgency: 'Routine'
                    }],
                    instructions: '',
                    followUpDate: ''
                })
                loadPrescriptions()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to create prescription')
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'text-green-600 bg-green-100'
            case 'Completed': return 'text-blue-600 bg-blue-100'
            case 'Cancelled': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Prescription Management</h1>
                        <p className="mt-2 text-gray-600">Create and manage patient prescriptions</p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create Prescription
                    </button>
                </div>

                {/* Prescriptions List */}
                <div className="bg-white shadow rounded-lg">
                    {prescriptions.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-gray-400 text-6xl mb-4">📋</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescriptions</h3>
                            <p className="text-gray-500 mb-4">You haven't created any prescriptions yet.</p>
                            <p className="text-sm text-gray-400">
                                Complete some appointments first, then you can create prescriptions here.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {prescriptions.map((prescription) => (
                                <div key={prescription._id} className="p-6 hover:bg-gray-50 cursor-pointer"
                                     onClick={() => setSelectedPrescription(prescription)}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {prescription.prescriptionId}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>
                                                    {prescription.status}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">
                                                Patient: {prescription.patientName}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {formatDate(prescription.createdAt)}
                                            </p>
                                            <p className="mt-2 text-sm text-gray-700">
                                                Diagnosis: {prescription.diagnosis}
                                            </p>
                                        </div>
                                        <div className="text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Prescription Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-medium text-gray-900">Create New Prescription</h3>
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                                {/* Appointment Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Completed Appointment *
                    </label>
                    <select
                        value={formData.appointmentId}
                        onChange={(e) => {
                            const selectedAppointment = appointmentsWithPatients.find(apt => apt._id === e.target.value);
                            if (selectedAppointment) {
                                setFormData({
                                    ...formData,
                                    appointmentId: selectedAppointment._id,
                                    patientId: selectedAppointment.patientId
                                });
                            }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select a completed appointment</option>
                        {appointmentsWithPatients.map((appointment) => (
                            <option key={appointment._id} value={appointment._id}>
                                {appointment.patientName} - {formatDate(appointment.slotDate)} {appointment.slotTime}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                        Only completed appointments are shown for prescription creation
                    </p>

                    {appointmentsWithPatients.length === 0 && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-yellow-800 text-sm font-medium mb-2">
                                No completed appointments found. You can only create prescriptions for completed appointments.
                            </p>
                            <p className="text-yellow-700 text-sm">
                                To create a prescription:
                            </p>
                            <ol className="text-yellow-700 text-sm list-decimal list-inside mt-1">
                                <li>Go to "Appointments" in the sidebar</li>
                                <li>Click the green tick icon (✓) to mark an appointment as completed</li>
                                <li>Return here to create prescriptions for completed appointments</li>
                            </ol>
                            <p className="text-yellow-700 text-sm mt-2">
                                <strong>Note:</strong> If you just marked an appointment complete, refresh this page once.
                            </p>
                        </div>
                    )}
                </div>

                                {/* Diagnosis */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Diagnosis *
                                    </label>
                                    <textarea
                                        value={formData.diagnosis}
                                        onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        required
                                    />
                                </div>

                                {/* Symptoms */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Symptoms
                                    </label>
                                    {formData.symptoms.map((symptom, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={symptom}
                                                onChange={(e) => handleInputChange('symptoms', e.target.value, index)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter symptom"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSymptom(index)}
                                                className="px-3 py-2 text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addSymptom}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        + Add Symptom
                                    </button>
                                </div>

                                {/* Medications */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Medications *
                                    </label>
                                    {formData.medications.map((medication, index) => (
                                        <div key={index} className="border rounded p-4 mb-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Medication Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={medication.name}
                                                        onChange={(e) => handleInputChange('medications', { name: e.target.value }, index)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Dosage *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={medication.dosage}
                                                        onChange={(e) => handleInputChange('medications', { dosage: e.target.value }, index)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="e.g., 500mg"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Frequency *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={medication.frequency}
                                                        onChange={(e) => handleInputChange('medications', { frequency: e.target.value }, index)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="e.g., Twice daily"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Duration *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={medication.duration}
                                                        onChange={(e) => handleInputChange('medications', { duration: e.target.value }, index)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="e.g., 7 days"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Timing
                                                    </label>
                                                    <select
                                                        value={medication.beforeAfterMeal}
                                                        onChange={(e) => handleInputChange('medications', { beforeAfterMeal: e.target.value }, index)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="After Meal">After Meal</option>
                                                        <option value="Before Meal">Before Meal</option>
                                                        <option value="Empty Stomach">Empty Stomach</option>
                                                        <option value="As Needed">As Needed</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Instructions
                                                </label>
                                                <textarea
                                                    value={medication.instructions}
                                                    onChange={(e) => handleInputChange('medications', { instructions: e.target.value }, index)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    rows="2"
                                                    placeholder="Special instructions for this medication"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeMedication(index)}
                                                className="mt-2 text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Remove Medication
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addMedication}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        + Add Medication
                                    </button>
                                </div>

                                {/* Tests Recommended */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tests Recommended
                                    </label>
                                    {formData.testsRecommended.map((test, index) => (
                                        <div key={index} className="border rounded p-4 mb-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Test Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={test.testName}
                                                        onChange={(e) => handleInputChange('testsRecommended', { testName: e.target.value }, index)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Urgency
                                                    </label>
                                                    <select
                                                        value={test.urgency}
                                                        onChange={(e) => handleInputChange('testsRecommended', { urgency: e.target.value }, index)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="Routine">Routine</option>
                                                        <option value="Urgent">Urgent</option>
                                                        <option value="Emergency">Emergency</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Test Description
                                                </label>
                                                <textarea
                                                    value={test.testDescription}
                                                    onChange={(e) => handleInputChange('testsRecommended', { testDescription: e.target.value }, index)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    rows="2"
                                                    placeholder="Description of the test"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeTest(index)}
                                                className="mt-2 text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Remove Test
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addTest}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        + Add Test
                                    </button>
                                </div>

                                {/* Instructions and Follow-up */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            General Instructions
                                        </label>
                                        <textarea
                                            value={formData.instructions}
                                            onChange={(e) => handleInputChange('instructions', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows="3"
                                            placeholder="General instructions for the patient"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Follow-up Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.followUpDate}
                                            onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Create Prescription
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Prescription Details Modal */}
            {selectedPrescription && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Prescription Details
                                </h3>
                                <button
                                    onClick={() => setSelectedPrescription(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900">Prescription ID</h4>
                                    <p className="text-gray-600">{selectedPrescription.prescriptionId}</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Patient</h4>
                                        <p className="text-gray-600">{selectedPrescription.patientName}</p>
                                        <p className="text-gray-500 text-sm">{selectedPrescription.patientAge} years, {selectedPrescription.patientGender}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Doctor</h4>
                                        <p className="text-gray-600">Dr. {selectedPrescription.doctorName}</p>
                                        <p className="text-gray-500 text-sm">{selectedPrescription.doctorSpecialization}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-medium text-gray-900">Diagnosis</h4>
                                    <p className="text-gray-600">{selectedPrescription.diagnosis}</p>
                                </div>
                                
                                {selectedPrescription.symptoms.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-900">Symptoms</h4>
                                        <ul className="list-disc list-inside text-gray-600">
                                            {selectedPrescription.symptoms.map((symptom, index) => (
                                                <li key={index}>{symptom}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                <div>
                                    <h4 className="font-medium text-gray-900">Medications</h4>
                                    <div className="space-y-2">
                                        {selectedPrescription.medications.map((med, index) => (
                                            <div key={index} className="border rounded p-3">
                                                <div className="font-medium text-gray-900">{med.name}</div>
                                                <div className="text-sm text-gray-600">
                                                    {med.dosage} • {med.frequency} • {med.duration}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {med.beforeAfterMeal} • {med.instructions}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {selectedPrescription.testsRecommended.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-900">Tests Recommended</h4>
                                        <ul className="list-disc list-inside text-gray-600">
                                            {selectedPrescription.testsRecommended.map((test, index) => (
                                                <li key={index}>
                                                    {test.testName} ({test.urgency})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {selectedPrescription.instructions && (
                                    <div>
                                        <h4 className="font-medium text-gray-900">Instructions</h4>
                                        <p className="text-gray-600">{selectedPrescription.instructions}</p>
                                    </div>
                                )}
                                
                                {selectedPrescription.followUpDate && (
                                    <div>
                                        <h4 className="font-medium text-gray-900">Follow-up Date</h4>
                                        <p className="text-gray-600">{formatDate(selectedPrescription.followUpDate)}</p>
                                    </div>
                                )}
                                
                                <div className="text-sm text-gray-500">
                                    Created: {formatDate(selectedPrescription.createdAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DoctorPrescriptions 