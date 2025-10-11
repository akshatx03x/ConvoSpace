import React from 'react'
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    // Clean White Theme matching the Login Card (bg-white, soft shadow)
    <nav className='bg-white shadow-lg p-2 border-b border-gray-200'>
      <div className='max-w-7xl mx-auto flex justify-between items-center h-12'>
        
        {/* Logo/Brand Section - Clean, Dark Text */}
        <Link to="/" className='text-3xl font-sans text-gray-800 tracking-wider cursor-pointer transition-transform duration-300 transform hover:scale-105'>
          AURORA
        </Link>

        {/* Navigation Links List */}
        <ul className='flex items-center space-x-12 font-medium'>
          
          {/* Home Link - Dark gray text, muted accent hover */}
          <li className='relative group'>
            <Link to='/' className='text-gray-700 hover:text-[#A06C78] transition-all duration-300 cursor-pointer p-1'>
              Home
              {/* Elegant underglow line in accent color */}
              <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[#A06C78] group-hover:w-full transition-all duration-300'></span>
            </Link>
          </li>
          
          {/* Collection Link */}
          <li className='relative group'>
            <Link to='/collection' className='text-gray-700 hover:text-[#A06C78] transition-all duration-300 cursor-pointer p-1'>
              Collection
              <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[#A06C78] group-hover:w-full transition-all duration-300'></span>
            </Link>
          </li>
          
          {/* About Link */}
          <li className='relative group'>
            <Link to='/about' className='text-gray-700 hover:text-[#A06C78] transition-all duration-300 cursor-pointer p-1'>
              About
              <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[#A06C78] group-hover:w-full transition-all duration-300'></span>
            </Link>
          </li>
          
          {/* CTA Button - Muted purple/brown accent color matching the login button */}
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
