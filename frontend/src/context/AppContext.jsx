import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '₹'
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(false)
    const [reminders, setReminders] = useState([])
    const [wellnessHistory, setWellnessHistory] = useState([])
    const [activityMetrics, setActivityMetrics] = useState([])
    const [healthReport, setHealthReport] = useState(null)
    const [clinicBanners, setClinicBanners] = useState([])

    // Getting Doctors using API
    const getDoctosData = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    // Getting User Profile using API
    const loadUserProfileData = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })

            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    const loadReminders = async () => {
        if (!token) return
        try {
            const { data } = await axios.get(`${backendUrl}/api/reminder/list`, { headers: { token } })
            if (data.success) {
                setReminders(data.reminders)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to load reminders')
        }
    }

    const createReminder = async (payload) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/reminder/create`, payload, { headers: { token } })
            if (data.success) {
                toast.success('Reminder created')
                loadReminders()
            } else {
                toast.error(data.message)
            }
            return data
        } catch (error) {
            console.log(error)
            toast.error('Failed to create reminder')
            return { success: false }
        }
    }

    const updateReminder = async (payload) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/reminder/update`, payload, { headers: { token } })
            if (data.success) {
                toast.success('Reminder updated')
                loadReminders()
            } else {
                toast.error(data.message)
            }
            return data
        } catch (error) {
            console.log(error)
            toast.error('Failed to update reminder')
            return { success: false }
        }
    }

    const deleteReminder = async (reminderId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/reminder/delete`, { reminderId }, { headers: { token } })
            if (data.success) {
                toast.success('Reminder deleted')
                loadReminders()
            } else {
                toast.error(data.message)
            }
            return data
        } catch (error) {
            console.log(error)
            toast.error('Failed to delete reminder')
            return { success: false }
        }
    }

    const loadWellnessHistory = async (limit = 30) => {
        if (!token) return
        try {
            const { data } = await axios.get(`${backendUrl}/api/wellness/history?limit=${limit}`, { headers: { token } })
            if (data.success) {
                setWellnessHistory(data.checkins)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to load wellness history')
        }
    }

    const submitWellnessCheckin = async (payload) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/wellness/checkin`, payload, { headers: { token } })
            if (data.success) {
                toast.success(data.message || 'Check-in submitted')
                loadWellnessHistory()
            } else {
                toast.error(data.message)
            }
            return data
        } catch (error) {
            console.log(error)
            toast.error('Failed to submit check-in')
            return { success: false }
        }
    }

    const loadActivityMetrics = async (days = 7) => {
        if (!token) return
        try {
            const { data } = await axios.get(`${backendUrl}/api/activity/metrics?days=${days}`, { headers: { token } })
            if (data.success) {
                setActivityMetrics(data.metrics)
                return data.summary
            }
            toast.error(data.message)
            return null
        } catch (error) {
            console.log(error)
            toast.error('Failed to load activity metrics')
            return null
        }
    }

    const syncActivityMetrics = async (payload) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/activity/sync`, payload, { headers: { token } })
            if (data.success) {
                toast.success('Activity synced')
                loadActivityMetrics()
            } else {
                toast.error(data.message)
            }
            return data
        } catch (error) {
            console.log(error)
            toast.error('Failed to sync activity')
            return { success: false }
        }
    }

    const loadWeeklyHealthReport = async () => {
        if (!token) return
        try {
            const { data } = await axios.get(`${backendUrl}/api/report/weekly`, { headers: { token } })
            if (data.success) {
                setHealthReport(data.report)
                return data.report
            }
            toast.error(data.message)
            return null
        } catch (error) {
            console.log(error)
            toast.error('Failed to load weekly report')
            return null
        }
    }

    const downloadWeeklyReport = async () => {
        if (!token) return
        try {
            const response = await axios.get(`${backendUrl}/api/report/weekly/pdf`, {
                headers: { token },
                responseType: 'blob',
            })

            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `weekly-health-report-${new Date().toISOString().split('T')[0]}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            toast.success('Weekly report downloaded')
        } catch (error) {
            console.log(error)
            toast.error('Failed to download weekly report')
        }
    }

    const loadClinicBanners = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/clinic-banners`)
            if (data.success) {
                setClinicBanners(data.banners)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to load clinic banners')
        }
    }

    useEffect(() => {
        getDoctosData()
        loadClinicBanners()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
            loadReminders()
            loadWellnessHistory()
            loadActivityMetrics()
        }
    }, [token])

    const value = {
        doctors, getDoctosData,
        currencySymbol,
        backendUrl,
        token, setToken,
        userData, setUserData, loadUserProfileData,
        reminders, loadReminders, createReminder, updateReminder, deleteReminder,
        wellnessHistory, loadWellnessHistory, submitWellnessCheckin,
        activityMetrics, loadActivityMetrics, syncActivityMetrics,
        healthReport, loadWeeklyHealthReport, downloadWeeklyReport,
        clinicBanners, loadClinicBanners
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider
