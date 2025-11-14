/* =======================================
   MOCK DATABASE (js/mock-data.js)
   ======================================= */

// --- 1. CUSTOMERS ---
const mockCustomers = [
    { 
        id: 1, 
        name: "Sarah Chen", 
        email: "sarah.chen@example.com", 
        phone: "555-1234" 
    },
    { 
        id: 2, 
        name: "David Lee", 
        email: "david.lee@example.com", 
        phone: "555-5678" 
    },
    { 
        id: 3, 
        name: "Emily Rodriguez", 
        email: "emily.r@example.com", 
        phone: "555-8765" 
    }
];

// --- 2. STYLISTS ---
const mockStylists = [
    { 
        id: 101, 
        name: "Anna Petrova", 
        image: "assets/images/stylist-anna.jpg",
        bio: "With over 10 years of experience, Anna is a master colorist and specializes in advanced skin treatments.",
        specialties: ["Hair Coloring", "Facials", "Manicures"] 
    },
    { 
        id: 102, 
        name: "Mark Johnson", 
        image: "assets/images/stylist-mark.jpg",
        bio: "Mark is an expert barber and stylist, focusing on precision cuts and modern men's grooming.",
        specialties: ["Haircuts", "Men's Grooming"]
    },
    { 
        id: 103, 
        name: "Elena Gomez", 
        image: "assets/images/stylist-elena.jpg",
        bio: "Elena brings a holistic approach to wellness, specializing in therapeutic massage and body treatments.",
        specialties: ["Massage", "Body Treatments"]
    },
   
];

// --- 3. SERVICES ---
const mockServices = [
    // Category: Hair
    { 
        id: 1, 
        name: "Women's Haircut & Style", 
        category: "Hair",
        description: "A customized haircut, shampoo, conditioning, and professional blow-dry style.",
        price: 800, 
        duration: 60, // in minutes
        stylistIds: [101, 102] // Anna or Mark can do this
    },
    { 
        id: 2, 
        name: "Men's Haircut", 
        category: "Hair",
        description: "Precision cut, shampoo, and style for a sharp, clean look.",
        price: 450, 
        duration: 30,
        stylistIds: [102] // Only Mark specializes in this
    },
    { 
        id: 3, 
        name: "Full Balayage", 
        category: "Hair",
        description: "Hand-painted highlights for a natural, sun-kissed look. Includes toner.",
        price: 1500, 
        duration: 180,
        stylistIds: [101] // Only Anna (master colorist)
    },

    // Category: Skin
    { 
        id: 4, 
        name: "Velvet Touch Signature Facial", 
        category: "Skin",
        description: "Deep cleansing, exfoliation, extractions, and a hydrating mask tailored to your skin type.",
        price: 1200, 
        duration: 60,
        stylistIds: [101] // Only Anna
    },
    { 
        id: 5, 
        name: "HydraFacial Express", 
        category: "Skin",
        description: "A 30-minute version of the popular treatment for a quick glow.",
        price: 1100, 
        duration: 30,
        stylistIds: [101]
    },

    // Category: Massage & Spa
    { 
        id: 6, 
        name: "Swedish Massage", 
        category: "Spa",
        description: "A relaxing full-body massage using long, flowing strokes to reduce tension.",
        price: 1000, 
        duration: 60,
        stylistIds: [103] // Only Elena
    },
    { 
        id: 7, 
        name: "Deep Tissue Massage", 
        category: "Spa",
        description: "Targets deeper layers of muscle to relieve chronic pain and knots.",
        price: 1300, 
        duration: 60,
        stylistIds: [103]
    },

    // Category: Nails
    { 
        id: 8, 
        name: "Classic Manicure", 
        category: "Nails",
        description: "Nail shaping, cuticle care, a relaxing hand massage, and polish.",
        price: 500, 
        duration: 40,
        stylistIds: [101]
    }
];

// --- 4. APPOINTMENTS ---
const mockAppointments = [
    // --- Past Appointments (for feedback) ---
    {
        id: 1001,
        customerId: 1, // Sarah Chen
        serviceId: 1,  // Women's Haircut
        stylistId: 102, // Mark Johnson
        date: "2025-10-28", // Past date
        time: "02:00 PM",
        status: "Completed"
    },
    {
        id: 1002,
        customerId: 2, // David Lee
        serviceId: 2,  // Men's Haircut
        stylistId: 102, // Mark Johnson
        date: "2025-11-01", // Past date
        time: "10:30 AM",
        status: "Completed"
    },

    // --- Upcoming Appointments (for cancellation) ---
    {
        id: 1003,
        customerId: 1, // Sarah Chen
        serviceId: 4,  // Signature Facial
        stylistId: 101, // Anna Petrova
        date: "2025-11-18", // Future date
        time: "11:00 AM",
        status: "Confirmed"
    },
    {
        id: 1004,
        customerId: 3, // Emily Rodriguez
        serviceId: 6,  // Swedish Massage
        stylistId: 103, // Elena Gomez
        date: "2025-11-20", // Future date
        time: "01:00 PM",
        status: "Confirmed"
    },
    {
        id: 1005,
        customerId: 2, // David Lee
        serviceId: 2,  // Men's Haircut
        stylistId: 102, // Mark Johnson
        date: "2025-11-22", // Future date
        time: "03:00 PM",
        status: "Confirmed"
    }
];