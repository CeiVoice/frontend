import React, { useState } from 'react';
import Top from './components/top_bar';
import Side from './components/side_bar';
function Page1() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    return (
        <>
            <Top onToggleMenu={() => setSidebarOpen((v) => !v)} />
            <Side isOpen={sidebarOpen} />
        </>
    );
}

export default Page1;
