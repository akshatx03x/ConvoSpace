import React from 'react'
import { Link } from 'react-router-dom'

const NavBar = () => {
  return (
    <nav className='fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-lg p-2 border-b border-gray-200 z-50'>
      <div className='max-w-7xl mx-auto flex justify-between items-center h-12'>
        <Link 
          to="/dashboard" 
          className='text-3xl font-sans text-gray-800 tracking-wider cursor-pointer transition-transform duration-300 transform hover:scale-105'
        >
          ConvoSpace
        </Link>

        <ul className='flex items-center space-x-12 font-medium'>
          <li className='relative group'>
            <a
              href='#'
              className='text-gray-700 hover:text-[#A06C78] transition-all duration-300 cursor-pointer p-1'
            >
              Home
              <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[#A06C78] group-hover:w-full transition-all duration-300'></span>
            </a>
          </li>
          <li className='relative group'>
            <a
              href='#about'
              className='text-gray-700 hover:text-[#A06C78] transition-all duration-300 cursor-pointer p-1'
            >
              About
              <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[#A06C78] group-hover:w-full transition-all duration-300'></span>
            </a>
          </li>

          <li>
            <Link 
              to='/subscriptions' 
              className='text-white bg-[#A06C78] hover:bg-[#8B5C67] px-4 py-2 rounded-lg font-bold transition-colors duration-300 cursor-pointer shadow-md'
            >
              Subscriptions
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default NavBar
