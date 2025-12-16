import React, { useState } from 'react';
import Top from './components/top_bar';
import Side from './components/side_bar';
import Report from './components/report';
function Page1({ userEmail }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showReport, setShowReport] = useState(false);

    return (
        <div className='flex flex-col'>
            <Top
                onToggleMenu={() => setSidebarOpen((v) => !v)}
                onCreate={() => setShowReport(true)}
                onHome={() => setShowReport(false)}
                userEmail={userEmail}
            />
            <div className='flex flex-row'>
                <Side isOpen={sidebarOpen} />
                {showReport ? (
                    <Report
                        userEmail={userEmail}
                        sidebarOpen={sidebarOpen}
                        setReportRef={() => { }}
                        onBack={() => setShowReport(false)}
                    />
                ) : (
                    <div className={`flex-1 bg-gray-100 min-h-screen ${sidebarOpen ? 'ml-56 sm:ml-60 md:ml-64' : 'ml-0'}`}></div>
                )}
            </div>
        </div>
    );
}

export default Page1;
