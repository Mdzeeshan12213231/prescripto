import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'

const Home = () => {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
      
      {/* Embedded Video Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4"></h2>
          <p className="text-gray-600"></p>
        </div>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe 
            src="https://drive.google.com/file/d/1kj7j4slrTFhN-xu3FxkQaPjvwTRq2V3E/preview"
            width="100%" 
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
            title="Prescripto Introduction Video"
            allowFullScreen>
          </iframe>
        </div>
      </div>
    </div>
  )
}

export default Home