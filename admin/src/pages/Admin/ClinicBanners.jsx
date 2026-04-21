import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

const ClinicBanners = () => {
    const {
        aToken,
        clinicBanners,
        getClinicBanners,
        addClinicBanner,
        toggleClinicBanner,
        replaceClinicBannerImage,
    } = useContext(AdminContext)
    const [newBannerImage, setNewBannerImage] = useState(false)

    useEffect(() => {
        if (aToken) {
            getClinicBanners()
        }
    }, [aToken])

    const submitNewBanner = async (e) => {
        e.preventDefault()
        if (!newBannerImage) return
        const response = await addClinicBanner(newBannerImage)
        if (response.success) {
            setNewBannerImage(false)
            e.target.reset()
        }
    }

    return (
        <div className='m-5 w-full'>
            <p className='mb-3 text-lg font-medium'>Clinic Footer Banners</p>

            <form onSubmit={submitNewBanner} className='bg-white border rounded p-5 max-w-3xl'>
                <p className='text-sm text-gray-700 mb-2'>Upload new clinic image for user footer scrolling banner</p>
                <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => setNewBannerImage(e.target.files[0])}
                    className='border rounded px-3 py-2 w-full'
                    required
                />
                <button type='submit' className='mt-4 bg-primary text-white px-6 py-2 rounded-full'>
                    Add Banner
                </button>
            </form>

            <div className='bg-white border rounded p-5 mt-5'>
                <p className='font-medium text-gray-800 mb-4'>Manage Existing Banners</p>
                {clinicBanners.length === 0 ? (
                    <p className='text-gray-500'>No clinic banners uploaded yet.</p>
                ) : (
                    <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {clinicBanners.map((banner) => (
                            <div key={banner._id} className='border rounded-lg p-3'>
                                <img src={banner.image} alt='Clinic Banner' className='w-full h-36 object-cover rounded-md' />
                                <div className='mt-3 flex items-center justify-between gap-2'>
                                    <button
                                        type='button'
                                        onClick={() => toggleClinicBanner(banner._id)}
                                        className={`text-xs px-3 py-1 rounded-full ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}
                                    >
                                        {banner.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                    <label className='text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 cursor-pointer'>
                                        Replace
                                        <input
                                            type='file'
                                            accept='image/*'
                                            hidden
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    replaceClinicBannerImage(banner._id, file)
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ClinicBanners
