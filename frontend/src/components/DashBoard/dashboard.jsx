import React from 'react'
import NavBar from '../../context/navBar'
import VideoCalling from '../../context/VideoCalling'

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
