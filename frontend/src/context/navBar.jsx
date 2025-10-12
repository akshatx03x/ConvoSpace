import React from 'react'
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className='bg-white shadow-lg p-2 border-b border-gray-200'>
      <div className='max-w-7xl mx-auto flex justify-between items-center h-12'>
        
        <Link to="/" className='text-3xl font-sans text-gray-800 tracking-wider cursor-pointer transition-transform duration-300 transform hover:scale-105'>
          ConvoSpace
        </Link>

        <ul className='flex items-center space-x-12 font-medium'>
          <li className='relative group'>
            <Link to='/dashboard' className='text-gray-700 hover:text-[#A06C78] transition-all duration-300 cursor-pointer p-1'>
              Home
              <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[#A06C78] group-hover:w-full transition-all duration-300'></span>
            </Link>
          </li>
          
          <li className='relative group'>
            <Link to='/collection' className='text-gray-700 hover:text-[#A06C78] transition-all duration-300 cursor-pointer p-1'>
              Collection
              <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[#A06C78] group-hover:w-full transition-all duration-300'></span>
            </Link>
          </li>
          <li className='relative group'>
            <Link to='/about' className='text-gray-700 hover:text-[#A06C78] transition-all duration-300 cursor-pointer p-1'>
              About
              <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[#A06C78] group-hover:w-full transition-all duration-300'></span>
            </Link>
          </li>
          <li>
            <Link 
              to='/booking' 
              className='text-white bg-[#A06C78] hover:bg-[#8B5C67] px-4 py-2 rounded-lg font-bold transition-colors duration-300 cursor-pointer shadow-md'
            >
              Book Now
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default NavBar
