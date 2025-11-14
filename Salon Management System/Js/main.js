// Wait for the entire page to load before running the script
document.addEventListener("DOMContentLoaded", function() {

    // --- 1. MOCK DATA ---
    // In a real app, you'd get this from a database.
    // We add 'id' and 'category' for filtering.
    const allServices = [
        { 
            id: 1, 
            title: "Women's Haircut & Style", 
            description: "A professional cut and style tailored to you.",
            price: 800, 
            duration: 60, 
            category: "hair",
            image: "assets/images/service-haircut.jpg" 
        },
        { 
            id: 2, 
            title: "Classic Facial", 
            description: "Deep cleansing, exfoliation, and hydration.",
            price: 1200, 
            duration: 45, 
            category: "skin",
            image: "assets/images/service-facial.jpg" 
        },
        { 
            id: 3, 
            title: "Men's Haircut", 
            description: "A sharp, clean cut from our expert barbers.",
            price: 450, 
            duration: 30, 
            category: "hair",
            image: "assets/images/service-haircut-men.jpg" 
        },
        { 
            id: 4, 
            title: "Manicure", 
            description: "Nail shaping, cuticle care, and polish.",
            price: 500, 
            duration: 40, 
            category: "nails",
            image: "assets/images/service-manicure.jpg" 
        },
        { 
            id: 5, 
            title: "Swedish Massage", 
            description: "A relaxing full-body massage.",
            price: 1000, 
            duration: 60, 
            category: "spa",
            image: "assets/images/service-massage.jpg" 
        },
        { 
            id: 6, 
            title: "Balayage / Highlights", 
            description: "Beautiful, sun-kissed hair coloring.",
            price: 1500, 
            duration: 180, 
            category: "hair",
            image: "assets/images/service-balayage.jpg" 
        }
    ];


    // --- 2. GET HTML ELEMENTS ---
    // These are the elements we need to interact with.
    const searchBox = document.getElementById("search-box");
    const categoryFilter = document.getElementById("filter-category");
    const servicesGrid = document.getElementById("services-grid");

    
    // --- 3. RENDER SERVICES FUNCTION ---
    // This function takes an array of services and displays them on the page.
    function renderServices(servicesToDisplay) {
        // Clear the grid first
        servicesGrid.innerHTML = "";

        // Loop through each service and create its HTML card
        servicesToDisplay.forEach(service => {
            // Create a new 'article' element
            const serviceCard = document.createElement("article");
            serviceCard.classList.add("service-card");
            // Add the data-category attribute (optional, but good practice)
            serviceCard.setAttribute("data-category", service.category);

            // Set the inner HTML for the card
            serviceCard.innerHTML = `
                <img src="${service.image}" alt="${service.title}">
                <div class="service-card-content">
                    <h3 class="service-title">${service.title}</h3>
                    <p class="service-description">${service.description}</p>
                    <div class="service-details">
                        <span class="service-price">₹${service.price}</span>
                        <span class="service-duration">${service.duration} min</span>
                    </div>
                    <a href="booking.html?service_id=${service.id}" class="btn btn-primary">Book Now</a>
                </div>
            `;
            
            // Add the newly created card to the grid
            servicesGrid.appendChild(serviceCard);
        });

        // Optional: Show a message if no services match
        if (servicesToDisplay.length === 0) {
            servicesGrid.innerHTML = "<p>No services found matching your criteria.</p>";
        }
    }


    // --- 4. FILTERING FUNCTION ---
    // This function runs every time the user types in the search or changes the filter.
    function filterServices() {
        // Get the current values from the form, converted to lowercase for matching
        const searchTerm = searchBox.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        // Use the .filter() method to create a new array
        const filteredServices = allServices.filter(service => {
            
            // Condition 1: Check if the service title includes the search term
            const matchesSearch = service.title.toLowerCase().includes(searchTerm);
            
            // Condition 2: Check if the category matches, or if "all" is selected
            const matchesCategory = (selectedCategory === "all") || (service.category === selectedCategory);
            
            // Only return services that match BOTH conditions
            return matchesSearch && matchesCategory;
        });

        // Re-render the grid with only the filtered services
        renderServices(filteredServices);
    }


    // --- 5. ADD EVENT LISTENERS ---
    // Run the filterServices function whenever the user types or selects a new category.
    searchBox.addEventListener("input", filterServices);
    categoryFilter.addEventListener("change", filterServices);


    // --- 6. INITIAL RENDER ---
    // Display all services when the page first loads
    renderServices(allServices);

});