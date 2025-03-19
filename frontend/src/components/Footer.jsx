import React from 'react';
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className='bg-gray-800 text-white py-6 mt-8' dir='rtl'> 
      <div className='container mx-auto px-4'>
        <div className='flex flex-wrap justify-center items-center'>
          <div className='w-full md:w-auto text-center md:text-left'>
            <p className='text-sm'>
              &copy; {new Date().getFullYear()} Toyzer | {t("All rights reserved")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;