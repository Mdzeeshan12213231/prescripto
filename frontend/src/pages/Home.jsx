import React, { useContext, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'

const wellnessActivities = [
  {
    title: 'My Reminders',
    description: 'Set medicine, hydration, and wellness reminders in one place.',
    to: '/my-reminders',
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    title: 'Guided Exercises',
    description: 'Follow short guided routines to improve mobility and strength.',
    to: '/guided-exercises',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Mental Check-ins',
    description: 'Track your mood, stress, sleep, and energy levels daily.',
    to: '/mental-checkins',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Weekly Health Report',
    description: 'Review your weekly trends and download your health report.',
    to: '/health-report',
    gradient: 'from-rose-500 to-orange-500',
  },
]

const testQuestions = [
  {
    id: 'main_concern',
    question: 'What is your main health concern right now?',
    options: [
      { label: 'General fever, cold, or body pain', weights: { 'General physician': 3 } },
      { label: 'Skin rashes, acne, or allergies', weights: { Dermatologist: 3 } },
      { label: 'Headache, dizziness, or nerve pain', weights: { Neurologist: 3 } },
      { label: 'Stomach acidity, gas, or digestion issues', weights: { Gastroenterologist: 3 } },
      { label: 'Women health related issue', weights: { Gynecologist: 3 } },
      { label: 'Child health concern', weights: { Pediatricians: 3 } },
    ],
  },
  {
    id: 'duration',
    question: 'How long have you had these symptoms?',
    options: [
      { label: '1-2 days', weights: { 'General physician': 2 } },
      { label: '3-7 days', weights: { 'General physician': 1, Gastroenterologist: 1, Dermatologist: 1 } },
      { label: 'More than a week', weights: { Neurologist: 1, Dermatologist: 1, Gastroenterologist: 1, Gynecologist: 1 } },
      { label: 'On and off for months', weights: { Neurologist: 2, Gastroenterologist: 1, Gynecologist: 1 } },
    ],
  },
  {
    id: 'preference',
    question: 'What type of doctor do you prefer to consult first?',
    options: [
      { label: 'Primary care doctor', weights: { 'General physician': 2 } },
      { label: 'Specialist directly', weights: { Dermatologist: 1, Neurologist: 1, Gastroenterologist: 1, Gynecologist: 1, Pediatricians: 1 } },
      { label: 'Not sure, suggest best match', weights: { 'General physician': 1, Dermatologist: 1, Neurologist: 1, Gastroenterologist: 1, Gynecologist: 1, Pediatricians: 1 } },
    ],
  },
]

const Home = () => {
  const { doctors } = useContext(AppContext)
  const [answers, setAnswers] = useState({})

  const scoreMap = useMemo(() => {
    const baseScores = {
      'General physician': 0,
      Gynecologist: 0,
      Dermatologist: 0,
      Pediatricians: 0,
      Neurologist: 0,
      Gastroenterologist: 0,
    }

    testQuestions.forEach((question) => {
      const selectedOption = question.options.find((option) => option.label === answers[question.id])
      if (!selectedOption) return

      Object.entries(selectedOption.weights).forEach(([speciality, weight]) => {
        baseScores[speciality] = (baseScores[speciality] || 0) + weight
      })
    })

    return baseScores
  }, [answers])

  const recommendedSpeciality = useMemo(() => {
    const entries = Object.entries(scoreMap)
    const allZero = entries.every(([, score]) => score === 0)
    if (allZero) return null

    return entries.sort((a, b) => b[1] - a[1])[0][0]
  }, [scoreMap])

  const recommendedDoctors = useMemo(() => {
    if (!recommendedSpeciality) return []
    return doctors.filter((doctor) => doctor.speciality === recommendedSpeciality).slice(0, 3)
  }, [doctors, recommendedSpeciality])

  const isTestComplete = testQuestions.every((question) => answers[question.id])
  const answeredCount = testQuestions.filter((question) => answers[question.id]).length
  const progressPercent = Math.round((answeredCount / testQuestions.length) * 100)

  return (
    <div>
      <Header />
      <section className='mt-8 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-5 md:p-8 shadow-sm'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
          <div>
            <p className='text-sm font-semibold tracking-wider text-primary uppercase'>Wellness Hub</p>
            <h2 className='text-2xl md:text-3xl font-bold text-slate-900 mt-2'>Your Activities on Home Page</h2>
            <p className='text-slate-600 mt-2 max-w-2xl'>
              Quick access to the same wellness activities available in your profile list.
            </p>
          </div>
          <div className='relative rounded-2xl bg-slate-900 px-6 py-5 text-white overflow-hidden min-w-[240px]'>
            <p className='text-sm opacity-80'>Mood Swing</p>
            <p className='text-xl font-semibold mt-1'>Stay Balanced</p>
            <div className='absolute -right-5 -bottom-6 flex items-end gap-2'>
              <span className='h-10 w-10 rounded-full bg-cyan-300/80 animate-pulse' />
              <span className='h-14 w-14 rounded-full bg-violet-300/80 animate-pulse' style={{ animationDelay: '180ms' }} />
              <span className='h-8 w-8 rounded-full bg-emerald-300/80 animate-pulse' style={{ animationDelay: '360ms' }} />
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6'>
          {wellnessActivities.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className='group rounded-xl bg-white border border-slate-200 p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1'
            >
              <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${item.gradient}`} />
              <h3 className='font-semibold text-slate-900 mt-3'>{item.title}</h3>
              <p className='text-sm text-slate-600 mt-1'>{item.description}</p>
              <p className='mt-3 text-sm font-medium text-primary group-hover:translate-x-1 transition-transform'>Open activity →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className='mt-8 rounded-2xl border border-emerald-100 bg-gradient-to-br from-green-50 via-emerald-50/70 to-teal-50/60 p-5 md:p-8 shadow-sm'>
        <div className='flex items-start justify-between gap-4 flex-wrap'>
          <div>
            <p className='text-sm font-semibold tracking-wider text-primary uppercase'>Doctor Suggestion Test</p>
            <h2 className='text-2xl md:text-3xl font-bold text-slate-900 mt-2'>Find the Right Specialist</h2>
            <p className='text-slate-600 mt-2 max-w-2xl'>
              Take this quick test and get a suggested doctor speciality based on your symptoms and preference.
            </p>
            <div className='mt-4 max-w-md'>
              <div className='flex items-center justify-between text-xs font-medium text-slate-600 mb-1'>
                <span>Progress</span>
                <span>{answeredCount}/{testQuestions.length} answered</span>
              </div>
              <div className='h-2 rounded-full bg-slate-200 overflow-hidden'>
                <div
                  className='h-full rounded-full bg-gradient-to-r from-cyan-500 to-primary transition-all duration-500 ease-out'
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
          <div className='rounded-full px-4 py-2 text-sm font-medium bg-emerald-100 text-emerald-800'>
            {isTestComplete ? 'Test completed' : 'Answer all questions'}
          </div>
        </div>

        <div className='grid lg:grid-cols-3 gap-4 mt-6'>
          {testQuestions.map((question) => (
            <div key={question.id} className='rounded-xl border border-emerald-100 p-4 bg-white/80'>
              <p className='font-semibold text-slate-900'>{question.question}</p>
              <div className='mt-3 space-y-2'>
                {question.options.map((option) => (
                  <button
                    type='button'
                    key={option.label}
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.label }))}
                    className={`w-full text-left text-sm rounded-lg px-3 py-2 border transition-all ${
                      answers[question.id] === option.label
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-primary/40'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className='mt-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 md:p-6'>
          {!isTestComplete ? (
            <p className='text-slate-200'>Complete all test questions to get your doctor suggestion.</p>
          ) : (
            <div>
              <p className='text-sm uppercase tracking-wider text-cyan-300 font-semibold'>Suggested speciality</p>
              <h3 className='text-2xl font-bold mt-1'>{recommendedSpeciality}</h3>
              <div className='mt-4 flex flex-wrap gap-3'>
                <Link
                  to={`/doctors/${encodeURIComponent(recommendedSpeciality)}`}
                  className='rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-semibold hover:scale-105 transition-transform'
                >
                  View {recommendedSpeciality} Doctors
                </Link>
                <button
                  type='button'
                  onClick={() => setAnswers({})}
                  className='rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20 transition-colors'
                >
                  Retake Test
                </button>
              </div>

              <div className='mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                {recommendedDoctors.length > 0 ? (
                  recommendedDoctors.map((doctor) => (
                    <Link
                      key={doctor._id}
                      to={`/appointment/${doctor._id}`}
                      className='rounded-xl bg-white/10 hover:bg-white/20 transition-colors p-3 border border-white/20'
                    >
                      <div className='flex items-center gap-3'>
                        <img src={doctor.image} alt={doctor.name} className='w-12 h-12 rounded-full object-cover border border-white/40' />
                        <div>
                          <p className='font-semibold'>{doctor.name}</p>
                          <p className='text-xs text-slate-200'>{doctor.speciality}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className='text-slate-200 text-sm'>No doctors found for this speciality right now.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  )
}

export default Home