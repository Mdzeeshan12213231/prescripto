import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const MyPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([])
    const [testResults, setTestResults] = useState([])
    const [activeTab, setActiveTab] = useState('prescriptions')
    const [loading, setLoading] = useState(true)
    const [selectedPrescription, setSelectedPrescription] = useState(null)
    const [selectedTestResult, setSelectedTestResult] = useState(null)

    const navigate = useNavigate()
    const { backendUrl, token } = useContext(AppContext)

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        loadPrescriptions()
        loadTestResults()
    }, [token])

    const loadPrescriptions = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/prescription/patient`, {
                headers: { token }
            })
            if (data.success) {
                setPrescriptions(data.prescriptions)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to load prescriptions')
        }
    }

    const loadTestResults = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/prescription/test/patient`, {
                headers: { token }
            })
            if (data.success) {
                setTestResults(data.testResults)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to load test results')
        } finally {
            setLoading(false)
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
            case 'Active': return 'text-green-600'
            case 'Completed': return 'text-blue-600'
            case 'Cancelled': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Emergency': return 'text-red-600 bg-red-100'
            case 'Urgent': return 'text-orange-600 bg-orange-100'
            case 'Routine': return 'text-green-600 bg-green-100'
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Medical Records</h1>
                    <p className="mt-2 text-gray-600">View your prescriptions and test results</p>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('prescriptions')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'prescriptions'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Prescriptions ({prescriptions.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('testResults')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'testResults'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Test Results ({testResults.length})
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'prescriptions' ? (
                    <div className="bg-white shadow rounded-lg">
                        {prescriptions.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-gray-400 text-6xl mb-4">📋</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescriptions</h3>
                                <p className="text-gray-500">You don't have any prescriptions yet.</p>
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
                                                    Dr. {prescription.doctorName} • {prescription.doctorSpecialization}
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
                ) : (
                    <div className="bg-white shadow rounded-lg">
                        {testResults.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-gray-400 text-6xl mb-4">🔬</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Results</h3>
                                <p className="text-gray-500">You don't have any test results yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {testResults.map((testResult) => (
                                    <div key={testResult._id} className="p-6 hover:bg-gray-50 cursor-pointer"
                                         onClick={() => setSelectedTestResult(testResult)}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {testResult.testResultId}
                                                    </h3>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(testResult.status)}`}>
                                                        {testResult.status}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(testResult.priority)}`}>
                                                        {testResult.priority}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {testResult.testName} • {testResult.testType}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Test Date: {formatDate(testResult.testDate)}
                                                </p>
                                                {testResult.laboratoryName && (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Lab: {testResult.laboratoryName}
                                                    </p>
                                                )}
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
                )}
            </div>

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

            {/* Test Result Details Modal */}
            {selectedTestResult && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Test Result Details
                                </h3>
                                <button
                                    onClick={() => setSelectedTestResult(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900">Test ID</h4>
                                    <p className="text-gray-600">{selectedTestResult.testResultId}</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Test Name</h4>
                                        <p className="text-gray-600">{selectedTestResult.testName}</p>
                                        <p className="text-gray-500 text-sm">{selectedTestResult.testType}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Patient</h4>
                                        <p className="text-gray-600">{selectedTestResult.patientName}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Test Date</h4>
                                        <p className="text-gray-600">{formatDate(selectedTestResult.testDate)}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Result Date</h4>
                                        <p className="text-gray-600">{formatDate(selectedTestResult.resultDate)}</p>
                                    </div>
                                </div>
                                
                                {selectedTestResult.laboratoryName && (
                                    <div>
                                        <h4 className="font-medium text-gray-900">Laboratory</h4>
                                        <p className="text-gray-600">{selectedTestResult.laboratoryName}</p>
                                        {selectedTestResult.laboratoryAddress && (
                                            <p className="text-gray-500 text-sm">{selectedTestResult.laboratoryAddress}</p>
                                        )}
                                    </div>
                                )}
                                
                                <div>
                                    <h4 className="font-medium text-gray-900">Results</h4>
                                    <div className="space-y-2">
                                        {selectedTestResult.results.map((result, index) => (
                                            <div key={index} className="border rounded p-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{result.parameter}</div>
                                                        <div className="text-sm text-gray-600">
                                                            {result.value} {result.unit}
                                                        </div>
                                                        {result.normalRange && (
                                                            <div className="text-sm text-gray-500">
                                                                Normal Range: {result.normalRange}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        result.status === 'Normal' ? 'bg-green-100 text-green-800' :
                                                        result.status === 'High' ? 'bg-red-100 text-red-800' :
                                                        result.status === 'Low' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {result.status}
                                                    </span>
                                                </div>
                                                {result.remarks && (
                                                    <div className="mt-2 text-sm text-gray-600">
                                                        {result.remarks}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {selectedTestResult.analysis && (
                                    <div>
                                        <h4 className="font-medium text-gray-900">Analysis</h4>
                                        <p className="text-gray-600">{selectedTestResult.analysis}</p>
                                    </div>
                                )}
                                
                                {selectedTestResult.comments && (
                                    <div>
                                        <h4 className="font-medium text-gray-900">Comments</h4>
                                        <p className="text-gray-600">{selectedTestResult.comments}</p>
                                    </div>
                                )}
                                
                                {selectedTestResult.recommendations && (
                                    <div>
                                        <h4 className="font-medium text-gray-900">Recommendations</h4>
                                        <p className="text-gray-600">{selectedTestResult.recommendations}</p>
                                    </div>
                                )}
                                
                                {selectedTestResult.reportFile && (
                                    <div>
                                        <h4 className="font-medium text-gray-900">Report File</h4>
                                        <a 
                                            href={selectedTestResult.reportFile} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline"
                                        >
                                            View Report
                                        </a>
                                    </div>
                                )}
                                
                                <div className="text-sm text-gray-500">
                                    Created: {formatDate(selectedTestResult.createdAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyPrescriptions 