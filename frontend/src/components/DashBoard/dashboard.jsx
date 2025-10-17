import React from 'react'
import NavBar from '../../context/navBar'
import VideoCalling from '../../context/VideoCalling'
import Footer from '../Extras/Footer'
import GeminiChatUI from '../../pages/GeminiUi'

const Dashboard = () => {
  return (
    <div>
        <NavBar/>
        <VideoCalling/>
        <div className="p-10"></div>
    </div>
  )
}

export default Dashboard
