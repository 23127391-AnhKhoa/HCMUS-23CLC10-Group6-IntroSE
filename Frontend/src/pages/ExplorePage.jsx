import React, { useState, useEffect } from 'react';
import ServCard from '../components/ExplorePage/ServCard';

const ExplorePage = () => {
    return (
        <div id="explore-page" className = "min-h-screen bg-white flex flex-col items-center justify-center">
            <div id="most-popular" className='flex flex-col items-center rounded-lg shadow-lg p-6 mb-8 w-full max-w-fit'>
                <div className="text-2xl font-bold mb-8 w-full text-left p-2">
                    <span>Most popular Service in <span className='text-blue-500'>ABC </span> </span>
                </div>
                <div id="serv-container" className='grid grid-cols-5 gap-x-2 gap-y-8'>
                    <ServCard />
                    <ServCard />
                    <ServCard />
                    <ServCard />
                    <ServCard />
                    <ServCard />
                    <ServCard />
                    <ServCard />
                    <ServCard />
                    <ServCard />
                </div>
            </div>
            <div id="may-like" className='flex flex-col items-center rounded-lg shadow-lg p-6 mb-8 w-full max-w-fit'>
                <div className="text-2xl font-bold mb-8 w-full text-left p-2">
                    <span>Services you might like</span>
                </div>
                <div id="serv-container-like" className='grid grid-cols-5 gap-x-2 gap-y-8'>
                    <ServCard />
                    <ServCard />
                    <ServCard />
                    <ServCard />
                    <ServCard />
                </div>
            </div>
        </div>
    );
}

export default ExplorePage;