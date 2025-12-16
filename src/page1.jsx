import React, { useState } from 'react';
import Top from './components/top_bar';
import Side from './components/side_bar';
import Report from './components/report';
import Home from './components/home';
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
                <Home sidebarOpen={sidebarOpen} />
            </div>
            {showReport && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setShowReport(false)}
                >
                    <div
                        className="w-full max-w-4xl max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Report
                            userEmail={userEmail}
                            sidebarOpen={false}
                            setReportRef={() => { }}
                            onBack={() => setShowReport(false)}
                            isModal
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Page1;
