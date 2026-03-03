import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Top from './components/top_bar';
import Side from './components/side_bar';
import Report from './components/ticket/report';
import Confirmation from './components/ticket/confirmation';
import Success from './components/ticket/success';
import { EXAMPLE_TICKETS } from './components/constants/ticketExamples';

function Layout({ userEmail, onSignout, roles, onRoleChange }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showReport, setShowReport] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [pendingMessage, setPendingMessage] = useState('');
    const [reports, setReports] = useState(EXAMPLE_TICKETS);

    const handleReportSubmit = (reportData) => {
        setPendingMessage(reportData);
        setShowReport(false);
        setShowConfirmation(true);
    };

    const handleConfirm = () => {
        console.log('Report submitted:', pendingMessage);
        const newReport = {
            topicName: pendingMessage.topicName,
            topic: pendingMessage.topic,
            message: pendingMessage.message,
            date: new Date().toLocaleString(),
            status: 'Solving'
        };
        setReports([newReport, ...reports]);
        setShowConfirmation(false);
        setShowSuccess(true);
    };

    return (
        <div className='flex flex-col'>
            <Top
                onToggleMenu={() => setSidebarOpen((v) => !v)}
                onCreate={() => setShowReport(true)}
                userEmail={userEmail}
                onSignout={onSignout}
            />
            <div className='flex flex-row'>
                <Side isOpen={sidebarOpen} />
                <Outlet context={{ reports, sidebarOpen, userEmail, roles, onRoleChange }} />
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

export default Layout;
