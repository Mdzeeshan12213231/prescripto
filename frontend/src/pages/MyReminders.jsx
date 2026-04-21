import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MyReminders = () => {
    const navigate = useNavigate()
    const { token, reminders, createReminder, updateReminder, deleteReminder, loadReminders } = useContext(AppContext)
    const [formData, setFormData] = useState({
        type: 'water',
        title: '',
        notes: '',
        time: '09:00',
        daysOfWeek: [],
    })

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        loadReminders()
    }, [token])

    const toggleDay = (day) => {
        setFormData((prev) => {
            const exists = prev.daysOfWeek.includes(day)
            return {
                ...prev,
                daysOfWeek: exists ? prev.daysOfWeek.filter((d) => d !== day) : [...prev.daysOfWeek, day],
            }
        })
    }

    const submitReminder = async (e) => {
        e.preventDefault()
        if (!formData.title.trim()) return
        const result = await createReminder(formData)
        if (result?.success) {
            setFormData({
                type: 'water',
                title: '',
                notes: '',
                time: '09:00',
                daysOfWeek: [],
            })
        }
    }

    const toggleReminder = (reminder) => {
        updateReminder({ reminderId: reminder._id, enabled: !reminder.enabled })
    }

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-5xl mx-auto px-4'>
                <h1 className='text-3xl font-bold text-gray-900'>Health Reminders</h1>
                <p className='text-gray-600 mt-2'>Create reminders for water, walks, and healthy sleep routines.</p>

                <form onSubmit={submitReminder} className='mt-6 bg-white rounded-xl p-5 shadow space-y-4'>
                    <div className='grid md:grid-cols-2 gap-4'>
                        <div>
                            <label className='text-sm font-medium text-gray-700'>Type</label>
                            <select
                                className='mt-1 w-full border rounded-lg px-3 py-2'
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value='water'>Water</option>
                                <option value='walk'>Walk</option>
                                <option value='sleep'>Sleep</option>
                                <option value='medication'>Medication</option>
                                <option value='wellness'>Wellness</option>
                            </select>
                        </div>
                        <div>
                            <label className='text-sm font-medium text-gray-700'>Time</label>
                            <input
                                type='time'
                                className='mt-1 w-full border rounded-lg px-3 py-2'
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className='text-sm font-medium text-gray-700'>Title</label>
                        <input
                            type='text'
                            className='mt-1 w-full border rounded-lg px-3 py-2'
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder='Drink a glass of water'
                            required
                        />
                    </div>

                    <div>
                        <label className='text-sm font-medium text-gray-700'>Notes</label>
                        <textarea
                            className='mt-1 w-full border rounded-lg px-3 py-2'
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows='2'
                        />
                    </div>

                    <div>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Repeat on</p>
                        <div className='flex flex-wrap gap-2'>
                            {dayLabels.map((label, idx) => (
                                <button
                                    type='button'
                                    key={label}
                                    onClick={() => toggleDay(idx)}
                                    className={`px-3 py-1 rounded-full text-sm border ${formData.daysOfWeek.includes(idx) ? 'bg-primary text-white border-primary' : 'text-gray-700 border-gray-300'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className='bg-primary text-white px-6 py-2 rounded-full'>Add Reminder</button>
                </form>

                <div className='mt-6 bg-white rounded-xl shadow divide-y'>
                    {reminders.length === 0 ? (
                        <p className='p-6 text-gray-500'>No reminders yet.</p>
                    ) : (
                        reminders.map((reminder) => (
                            <div key={reminder._id} className='p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                                <div>
                                    <p className='font-semibold text-gray-900'>{reminder.title}</p>
                                    <p className='text-sm text-gray-600'>{reminder.type} • {reminder.time}</p>
                                </div>
                                <div className='flex gap-2'>
                                    <button
                                        onClick={() => toggleReminder(reminder)}
                                        className={`px-4 py-1 rounded-full text-sm ${reminder.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                                    >
                                        {reminder.enabled ? 'Enabled' : 'Disabled'}
                                    </button>
                                    <button
                                        onClick={() => deleteReminder(reminder._id)}
                                        className='px-4 py-1 rounded-full text-sm bg-red-100 text-red-700'
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default MyReminders

