import React, { useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const HealthReport = () => {
    const navigate = useNavigate()
    const { token, healthReport, loadWeeklyHealthReport, downloadWeeklyReport } = useContext(AppContext)

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        loadWeeklyHealthReport()
    }, [token])

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-5xl mx-auto px-4'>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-900'>Weekly Health Report</h1>
                        <p className='text-gray-600 mt-2'>A complete summary of your activity, reminders, and wellness check-ins.</p>
                    </div>
                    <button onClick={downloadWeeklyReport} className='bg-primary text-white px-5 py-2 rounded-full'>Download PDF</button>
                </div>

                {!healthReport ? (
                    <div className='bg-white rounded-xl shadow p-6 mt-6 text-gray-500'>Loading report...</div>
                ) : (
                    <div className='grid md:grid-cols-2 gap-4 mt-6'>
                        <div className='bg-white rounded-xl shadow p-5'>
                            <h2 className='text-lg font-semibold'>Activity</h2>
                            <p className='mt-2 text-gray-700'>Total Steps: {healthReport.activity.totalSteps}</p>
                            <p className='text-gray-700'>Active Minutes: {healthReport.activity.totalActiveMinutes}</p>
                            <p className='text-gray-700'>Calories Burned: {healthReport.activity.totalCaloriesBurned}</p>
                            <p className='text-gray-700'>Avg Heart Rate: {healthReport.activity.averageHeartRate}</p>
                        </div>

                        <div className='bg-white rounded-xl shadow p-5'>
                            <h2 className='text-lg font-semibold'>Mental Wellness</h2>
                            <p className='mt-2 text-gray-700'>Check-ins: {healthReport.mentalWellness.checkinCount}</p>
                            <p className='text-gray-700'>Avg Stress: {healthReport.mentalWellness.averageStressLevel}</p>
                            <p className='text-gray-700'>Avg Sleep: {healthReport.mentalWellness.averageSleepHours}h</p>
                            <p className='text-gray-700'>Dominant Mood: {healthReport.mentalWellness.dominantMood}</p>
                        </div>

                        <div className='bg-white rounded-xl shadow p-5'>
                            <h2 className='text-lg font-semibold'>Reminders</h2>
                            <p className='mt-2 text-gray-700'>Active Reminders: {healthReport.reminders.totalActive}</p>
                            <div className='mt-2 space-y-1 text-gray-700'>
                                {Object.entries(healthReport.reminders.byType).map(([type, count]) => (
                                    <p key={type}>{type}: {count}</p>
                                ))}
                            </div>
                        </div>

                        <div className='bg-white rounded-xl shadow p-5'>
                            <h2 className='text-lg font-semibold'>Clinical Updates</h2>
                            <p className='mt-2 text-gray-700'>New Prescriptions: {healthReport.clinical.newPrescriptionsThisWeek}</p>
                            <p className='text-gray-700'>New Test Results: {healthReport.clinical.newTestResultsThisWeek}</p>
                            <p className='text-gray-500 text-sm mt-3'>
                                Period: {healthReport.period.startDate} to {healthReport.period.endDate}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HealthReport

