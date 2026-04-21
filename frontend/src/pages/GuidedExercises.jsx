import React from 'react'

const exercisePlans = [
    {
        title: 'Calm Breathing',
        duration: '5 min',
        level: 'Beginner',
        steps: ['Sit comfortably and relax your shoulders', 'Inhale for 4 seconds', 'Hold for 4 seconds', 'Exhale slowly for 6 seconds'],
    },
    {
        title: 'Desk Stretch Yoga',
        duration: '8 min',
        level: 'Beginner',
        steps: ['Neck rolls for 30 seconds', 'Seated spinal twist each side', 'Shoulder openers', 'Forward fold with deep breathing'],
    },
    {
        title: 'Sleep Wind-Down',
        duration: '10 min',
        level: 'All levels',
        steps: ['Dim lights and reduce noise', 'Box breathing cycle x5', 'Gentle seated stretch', 'Reflect on 3 positive moments'],
    },
]

const GuidedExercises = () => {
    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-5xl mx-auto px-4'>
                <h1 className='text-3xl font-bold text-gray-900'>Guided Exercises</h1>
                <p className='text-gray-600 mt-2'>Breathing and yoga routines designed to improve focus and recovery.</p>

                <div className='grid md:grid-cols-2 gap-4 mt-6'>
                    {exercisePlans.map((plan) => (
                        <div key={plan.title} className='bg-white rounded-xl p-5 shadow hover:shadow-md transition-shadow'>
                            <div className='flex items-center justify-between'>
                                <h2 className='text-xl font-semibold text-gray-900'>{plan.title}</h2>
                                <span className='text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700'>{plan.level}</span>
                            </div>
                            <p className='text-sm text-gray-500 mt-1'>Duration: {plan.duration}</p>
                            <ol className='list-decimal list-inside mt-4 space-y-1 text-gray-700'>
                                {plan.steps.map((step) => (
                                    <li key={step}>{step}</li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default GuidedExercises

