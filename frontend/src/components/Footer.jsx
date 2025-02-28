import React from 'react';

const Footer = () => {
  return (
    <footer className='bg-gray-800 text-white py-6 mt-8'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-wrap justify-between items-center'>
          <div className='w-full md:w-auto text-center md:text-left'>
            <p className='text-sm'>
              &copy; {new Date().getFullYear()} Toyzer Store. All rights reserved.
            </p>
          </div>
          <div className='w-full md:w-auto text-center md:text-right mt-4 md:mt-0'>
            <nav className='flex flex-wrap justify-center md:justify-end gap-4'>
              <a href='/' className='text-sm hover:text-gray-400 transition duration-300 ease-in-out'>
                Home
              </a>
              <a href='/about' className='text-sm hover:text-gray-400 transition duration-300 ease-in-out'>
                About
              </a>
              <a href='/contact' className='text-sm hover:text-gray-400 transition duration-300 ease-in-out'>
                Contact
              </a>
              <a href='/privacy' className='text-sm hover:text-gray-400 transition duration-300 ease-in-out'>
                Privacy Policy
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;