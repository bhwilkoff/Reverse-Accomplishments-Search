import React from 'react';

// A stylized representation of the Minerva University logo symbol from the brand guide
const MinervaLogo: React.FC = () => (
    <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M93.3,62.2C91.1,73,83.9,82,74.3,87.6c-9.6,5.6-21.3,7.5-32.6,4.9c-11.3-2.7-21.2-10-27.4-20.3C8.1,61.9,4.4,49.5,7.7,37.7c3.3-11.8,12.8-21.5,24.1-26.6c11.3-5.1,24.3-4.6,35.1,1.5C77.7,18.8,87,29.3,91.3,41.5" 
        stroke="#3c3732" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


const Header: React.FC = () => {
  return (
    <header className="bg-minerva-snow shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
           <div className="flex-shrink-0">
              <MinervaLogo />
           </div>
           <div>
              <h1 className="text-lg sm:text-xl font-bold text-minerva-charcoal tracking-tight">
                Reverse Accomplishments Search
              </h1>
              <p className="text-sm text-minerva-slate">for Minerva University Applicants</p>
           </div>
        </div>
        <div className="text-sm text-gray-500 hidden md:block">For Enrollment Team Only</div>
      </div>
    </header>
  );
};

export default Header;