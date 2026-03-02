export const EXAMPLE_TICKETS = [
    {
        id: 1,
        topicName: "Login Issue",
        message: "Unable to login with correct credentials",
        topic: "Authentication",
        status: "Solved",
        admin_status: "Approved",
        date: "2024-02-20",
        organization: "TechCorp Inc",
        createdBy: { email: "67011213@kmitl.ac.th", department: "IT" },
        assignedTo: ["67676767@kmitl.ac.th"],
        followers: ["67011213@kmitl.ac.th"],
        timeline: [
            { status: "NEW", date: "20/01/2025 12:00 AM" },
            { status: "PENDING", date: "20/01/2025 12:00 AM" },
            { status: "SOLVED", date: "20/01/2025 12:00 AM" }
        ]
    },
    {
        id: 2,
        topicName: "Email Not Received",
        message: "Confirmation email not arriving in inbox",
        topic: "Email Service",
        status: "Solving",
        admin_status: "Approved",
        date: "2024-02-21",
        organization: "TechCorp Inc",
        createdBy: { email: "67011213@kmitl.ac.th", department: "IT" },
        assignedTo: ["67011213@kmitl.ac.th"],
        followers: ["67011274@kmitl.ac.th"],
        timeline: [
            { status: "NEW", date: "21/01/2025 09:00 AM" },
            { status: "PENDING", date: "21/01/2025 10:00 AM" }
        ]
    },
    {
        id: 3,
        topicName: "Dashboard Loading Slow",
        message: "Dashboard takes too long to load",
        topic: "Performance",
        status: "Solving",
        admin_status: "Approved",
        date: "2024-02-22",
        organization: "Creative Studios",
        createdBy: { email: "67011274@kmitl.ac.th", department: "Financial" },
        assignedTo: ["67676767@kmitl.ac.th"],
        followers: ["67011274@kmitl.ac.th", "67011213@kmitl.ac.th"],
        timeline: [
            { status: "NEW", date: "22/01/2025 08:00 AM" },
            { status: "PENDING", date: "22/01/2025 09:00 AM" }
        ]
    },
    {
        id: 4,
        topicName: "Subscription Payment Failed",
        message: "Payment declined but amount was charged",
        topic: "Billing",
        status: "Solved",
        admin_status: "Approved",
        date: "2024-02-19",
        organization: "StartUp Labs",
        createdBy: { email: "67676767@kmitl.ac.th", department: "Technician" },
        assignedTo: ["67011274@kmitl.ac.th"],
        followers: ["67676767@kmitl.ac.th"],
        timeline: [
            { status: "NEW", date: "19/01/2025 02:00 PM" },
            { status: "PENDING", date: "19/01/2025 03:00 PM" },
            { status: "SOLVED", date: "19/01/2025 05:00 PM" }
        ]
    },
    {
        id: 5,
        topicName: "Data Export Error",
        message: "Cannot export user data to CSV",
        topic: "Features",
        status: "Solving",
        admin_status: "Draft",
        date: "2024-02-23",
        organization: "Global Solutions",
        createdBy: { email: "67011213@kmitl.ac.th", department: "IT" },
        assignedTo: ["67011264@kmitl.ac.th"],
        followers: ["67011213@kmitl.ac.th"],
        timeline: [
            { status: "NEW", date: "23/01/2025 11:00 AM" },
            { status: "PENDING", date: "23/01/2025 11:30 AM" }
        ]
    },
    {
        id: 6,
        topicName: "Data Export Error 1",
        message: "Cannot export user data to CSV",
        topic: "Profile",
        status: "Solving",
        admin_status: "Draft",
        date: "2024-02-23",
        organization: "Global Solutions",
        createdBy: { email: "67011274@kmitl.ac.th", department: "Financial" },
        assignedTo: ["67676765@kmitl.ac.th"],
        followers: ["67011274@kmitl.ac.th"],
        timeline: [
            { status: "NEW", date: "23/01/2025 01:00 PM" }
        ]
    },
    {
        id: 7,
        topicName: "Data Error",
        message: "Cannot export user data",
        topic: "Billing",
        status: "Solving",
        admin_status: "Draft",
        date: "2024-02-23",
        organization: "TechCorp Inc",
        createdBy: { email: "67676767@kmitl.ac.th", department: "Technician" },
        assignedTo: ["67011313@kmitl.ac.th"],
        followers: ["67676767@kmitl.ac.th"],
        timeline: [
            { status: "NEW", date: "23/01/2025 03:00 PM" },
            { status: "PENDING", date: "23/01/2025 03:30 PM" }
        ]
    },
    {
        id: 8,
        topicName: "Missing Profile Information",
        message: "Profile photo not displaying correctly",
        topic: "Profile",
        status: "Solved",
        admin_status: "Approved",
        date: "2024-02-18",
        organization: "Creative Studios",
        createdBy: { email: "67676767@kmitl.ac.th", department: "Technician" },
        assignedTo: ["67011223@kmitl.ac.th"],
        followers: ["67676767@kmitl.ac.th", "67011274@kmitl.ac.th"],
        timeline: [
            { status: "NEW", date: "18/01/2025 10:00 AM" },
            { status: "PENDING", date: "18/01/2025 11:00 AM" },
            { status: "SOLVED", date: "18/01/2025 02:00 PM" }
        ]
    },
    {
        id: 9,
        topicName: "Missing Profile Information",
        message: "Profile photo not displaying correctly",
        topic: "Profile",
        status: "Solved",
        admin_status: "Approved",
        date: "2024-02-18",
        organization: "Creative Studios",
        createdBy: { email: "67011999@kmitl.ac.th", department: "Technician" },
        assignedTo: ["67011215@kmitl.ac.th"],
        followers: ["67011999@kmitl.ac.th"],
        timeline: [
            { status: "NEW", date: "18/01/2025 10:00 AM" },
            { status: "PENDING", date: "18/01/2025 11:00 AM" },
            { status: "SOLVED", date: "18/01/2025 02:00 PM" }
        ]
    }
];
