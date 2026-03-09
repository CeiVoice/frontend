import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import API_BASE from './config/api';
import Top from './components/top_bar';
import Side from './components/side_bar';
import Report from './components/ticket/report';
import Confirmation from './components/ticket/confirmation';
import Success from './components/ticket/success';

function Layout({ userEmail, onSignout, roles, onRoleChange }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showReport, setShowReport] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingMessage, setPendingMessage] = useState('');
    const [reports, setReports] = useState([]);
    const [submitError, setSubmitError] = useState(null);

    const handleReportSubmit = (reportData) => {
        setPendingMessage(reportData);
        setShowReport(false);
        setShowConfirmation(true);
    };

    const handleConfirm = () => {
        const token = localStorage.getItem('authToken');
        const org = JSON.parse(localStorage.getItem('selectedOrganization') || 'null');

        if (!token || !org) {
            setSubmitError('Please select an organization first.');
            setShowConfirmation(false);
            setShowSuccess(true);
            return;
        }

        // Close modal immediately, fire request in background
        setShowConfirmation(false);
        setShowSuccess(true);

        const decoded = jwtDecode(token);
        fetch(`${API_BASE}/api/tickets/draft`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                Title: pendingMessage.topicName,
                Detail: pendingMessage.message,
                CreatedBy: decoded.id,
                OrgId: org.id
            })
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { console.error('Failed to create ticket:', err.error); });
                }
            })
            .catch(err => console.error('Submit ticket error:', err));
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
                <Side isOpen={sidebarOpen} onSignout={onSignout} />
                <Outlet context={{ reports, sidebarOpen, userEmail, roles, onRoleChange }} />
            </div>
            {showReport && (
                <div
                    className="z-50 fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm p-4"
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
                    className="z-50 fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm p-4"
                >
                    <div
                        className="bg-white shadow-xl rounded-2xl w-full max-w-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Confirmation
                            onConfirm={handleConfirm}
                            onCancel={() => {
                                setShowConfirmation(false);
                                setShowReport(true);
                            }}
                            isLoading={isSubmitting}
                        />
                    </div>
                </div>
            )}
            {showSuccess && (
                <div
                    className="z-50 fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => setShowSuccess(false)}
                >
                    <div
                        className="bg-white shadow-xl rounded-2xl w-full max-w-lg"
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
