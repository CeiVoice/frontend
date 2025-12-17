import React, { useState } from 'react';
import Top from './components/top_bar';
import Side from './components/side_bar';
import Report from './components/report';
import Home from './components/home';
import Confirmation from './components/confirmation';
import Success from './components/success';
import AdminPage from './admin/admin_page';
function Page1({ userEmail, userRole }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showReport, setShowReport] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [pendingMessage, setPendingMessage] = useState('');

    const handleReportSubmit = (message) => {
        setPendingMessage(message);
        setShowReport(false);
        setShowConfirmation(true);
    };

    const handleConfirm = () => {
        // Handle actual submission (e.g., send to API)
        console.log('Report submitted:', pendingMessage);
        setShowConfirmation(false);
        setShowSuccess(true);
    };

    return (
        <div className='flex flex-col'>
            <Top
                onToggleMenu={() => setSidebarOpen((v) => !v)}
                onCreate={() => setShowReport(true)}
                onHome={() => {
                    setShowReport(false);
                    setShowConfirmation(false);
                }}
                userEmail={userEmail}
            />
            <div className='flex flex-row'>
                <Side isOpen={sidebarOpen} />
                {userRole === 'admin' ? <AdminPage /> : <Home sidebarOpen={sidebarOpen} />}
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
                            onSubmit={handleReportSubmit}
                            isModal
                        />
                    </div>
                </div>
            )}
            {showConfirmation && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Confirmation
                            onConfirm={handleConfirm}
                            onCancel={() => {
                                setShowConfirmation(false);
                                setShowReport(true);
                            }}
                        />
                    </div>
                </div>
            )}
            {showSuccess && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setShowSuccess(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Success onClose={() => setShowSuccess(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Page1;
