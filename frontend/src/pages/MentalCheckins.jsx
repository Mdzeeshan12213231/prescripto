import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const moodOptions = [
    { id: 'great', label: 'Great', color: 'from-green-400 to-emerald-500' },
    { id: 'good', label: 'Good', color: 'from-teal-400 to-cyan-500' },
    { id: 'okay', label: 'Okay', color: 'from-blue-400 to-indigo-500' },
    { id: 'stressed', label: 'Stressed', color: 'from-orange-400 to-amber-500' },
    { id: 'low', label: 'Low', color: 'from-rose-400 to-red-500' },
]

const MentalCheckins = () => {
    const navigate = useNavigate()
    const { token, wellnessHistory, submitWellnessCheckin, loadWellnessHistory } = useContext(AppContext)
    const [formData, setFormData] = useState({
        mood: 'good',
        stressLevel: 5,
        sleepHours: 7,
        energyLevel: 6,
        notes: '',
    })

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        loadWellnessHistory()
    }, [token])

    const submitCheckin = async (e) => {
        e.preventDefault()
        await submitWellnessCheckin(formData)
        setFormData({ ...formData, notes: '' })
    }

    return (
        <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white py-8'>
            <div className='max-w-5xl mx-auto px-4'>
                <h1 className='text-3xl font-bold text-gray-900'>Mental Health Check-ins</h1>
                <p className='text-gray-600 mt-2'>Track mood, stress, and sleep with a calm and professional check-in experience.</p>

                <form onSubmit={submitCheckin} className='mt-6 bg-white rounded-2xl p-6 shadow-md space-y-5'>
                    <div>
                        <p className='font-medium text-gray-800 mb-2'>How are you feeling today?</p>
                        <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
                            {moodOptions.map((mood) => (
                                <button
                                    key={mood.id}
                                    type='button'
                                    onClick={() => setFormData({ ...formData, mood: mood.id })}
                                    className={`rounded-xl px-3 py-3 text-white text-sm font-medium bg-gradient-to-r ${mood.color} transition-transform hover:scale-[1.02] ${formData.mood === mood.id ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                >
                                    {mood.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='grid md:grid-cols-3 gap-4'>
                        <div>
                            <label className='text-sm font-medium text-gray-700'>Stress (1-10)</label>
                            <input type='number' min='1' max='10' className='mt-1 w-full border rounded-lg px-3 py-2' value={formData.stressLevel} onChange={(e) => setFormData({ ...formData, stressLevel: Number(e.target.value) })} />
                        </div>
                        <div>
                            <label className='text-sm font-medium text-gray-700'>Sleep hours</label>
                            <input type='number' min='0' max='24' step='0.5' className='mt-1 w-full border rounded-lg px-3 py-2' value={formData.sleepHours} onChange={(e) => setFormData({ ...formData, sleepHours: Number(e.target.value) })} />
                        </div>
                        <div>
                            <label className='text-sm font-medium text-gray-700'>Energy (1-10)</label>
                            <input type='number' min='1' max='10' className='mt-1 w-full border rounded-lg px-3 py-2' value={formData.energyLevel} onChange={(e) => setFormData({ ...formData, energyLevel: Number(e.target.value) })} />
                        </div>
                    </div>

                    <div>
                        <label className='text-sm font-medium text-gray-700'>Notes</label>
                        <textarea className='mt-1 w-full border rounded-lg px-3 py-2' rows='3' value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder='Share what influenced your mood today...' />
                    </div>

                    <button className='bg-primary text-white px-6 py-2 rounded-full'>Submit Check-in</button>
                </form>

                <div className='mt-6 bg-white rounded-xl shadow p-5'>
                    <h2 className='text-xl font-semibold text-gray-900'>Recent Check-ins</h2>
                    {wellnessHistory.length === 0 ? (
                        <p className='text-gray-500 mt-3'>No check-ins submitted yet.</p>
                    ) : (
                        <div className='mt-3 divide-y'>
                            {wellnessHistory.slice(0, 7).map((item) => (
                                <div key={item._id} className='py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
                                    <p className='font-medium text-gray-900'>{item.checkInDate} • {item.mood}</p>
                                    <p className='text-sm text-gray-600'>Stress {item.stressLevel}/10 • Sleep {item.sleepHours}h • Energy {item.energyLevel}/10</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MentalCheckins

