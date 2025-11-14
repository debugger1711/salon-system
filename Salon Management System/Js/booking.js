// Wait for the page to load before running any script
document.addEventListener("DOMContentLoaded", function() {

    // --- 1. MOCK DATA (In a real app, this comes from a database) ---
    // NOTE: This now assumes js/mock-data.js is loaded first
    // You should delete these arrays if you are using mock-data.js
   // --- 1. MOCK DATA ---
// Use the data loaded from js/mock-data.js
const services = mockServices;
const stylists = mockStylists;
    // If you are using js/mock-data.js, use these lines instead of the arrays above:
    // const services = mockServices;
    // const stylists = mockStylists;


    // A mock function to get available times for a given date and stylist
    function getMockAvailableTimes(date, stylistId) {
        const day = new Date(date).getDate();
        if (day % 2 === 0) {
            return ["09:00 AM", "09:30 AM", "11:00 AM", "02:00 PM", "03:30 PM"];
        } else {
            return ["10:00 AM", "10:30 AM", "01:00 PM", "01:30 PM", "04:00 PM"];
        }
    }

    // --- 2. GET HTML ELEMENTS ---
    const serviceSelect = document.getElementById("service-select");
    const stylistSelectionDiv = document.querySelector(".stylist-selection");
    const datePicker = document.getElementById("date-picker");
    const timeSlotsGrid = document.getElementById("time-slots");
    
    // Summary elements
    const summaryService = document.getElementById("summary-service");
    const summaryStylist = document.getElementById("summary-stylist");
    const summaryDate = document.getElementById("summary-date");
    const summaryTime = document.getElementById("summary-time");
    const summaryPrice = document.getElementById("summary-price");
    
    const paymentButton = document.getElementById("proceed-to-payment-btn");

    // This object will hold the user's current selections
    let booking = {
        service: null,
        stylist: null,
        date: null,
        time: null
    };

    // --- 3. FUNCTIONS ---

    // Fills the service dropdown on page load
    function populateServices() {
        serviceSelect.innerHTML = "<option value=''>Choose a service...</option>"; // Reset
        services.forEach(service => {
            const option = document.createElement("option");
            option.value = service.id;
            option.textContent = `${service.name} (₹${service.price})`;
            option.dataset.price = service.price;
            option.dataset.name = service.name;
            serviceSelect.appendChild(option);
        });
    }

    // Shows available stylists for the selected service
    function populateStylists(selectedService) {
        stylistSelectionDiv.innerHTML = ""; // Clear previous stylists
        
        let availableStylists; 

        if (selectedService) {
            // A service IS selected, so filter the list
            const availableStylistIds = selectedService.stylistIds;
            availableStylists = stylists.filter(s => availableStylistIds.includes(s.id));
        } else {
            // No service is selected (value is null), so show EVERYONE
            availableStylists = stylists;
        }

        availableStylists.forEach(stylist => {
            const label = document.createElement("label");
            label.classList.add("stylist-card");
            label.innerHTML = `
                <input type="radio" name="stylist" value="${stylist.id}" data-name="${stylist.name}">
                <img src="${stylist.image}" alt="Stylist ${stylist.name}">
                <span>${stylist.name}</span>
            `;
            stylistSelectionDiv.appendChild(label);
        });
        
        // Add event listeners to the new radio buttons
        document.querySelectorAll('input[name="stylist"]').forEach(radio => {
            radio.addEventListener("change", handleStylistSelect);
        });
    }
    
    // --- THIS IS WHERE THE ERROR WAS ---
    // The duplicate block and extra brace have been REMOVED.

    // Generates time slots for the selected date
    function populateTimeSlots(date, stylistId) {
        timeSlotsGrid.innerHTML = ""; // Clear old slots
        if (!date || !stylistId) {
            timeSlotsGrid.innerHTML = "<p>Please select a service, stylist, and date.</p>";
            return;
        }

        const times = getMockAvailableTimes(date, stylistId);
        times.forEach(time => {
            const button = document.createElement("button");
            button.classList.add("time-slot");
            button.type = "button"; 
            button.textContent = time;
            timeSlotsGrid.appendChild(button);
        });
    }

    // Updates the summary sidebar
    function updateSummary() {
        // Service
        if (booking.service) {
            summaryService.textContent = booking.service.name;
            summaryPrice.textContent = `₹${booking.service.price}`;
        } else {
            summaryService.textContent = "---";
            summaryPrice.textContent = "₹0";
        }
        
        // Stylist
        summaryStylist.textContent = booking.stylist ? booking.stylist.name : "---";
        
        // Date
        // Added 'T00:00:00' to prevent time zone issues
        summaryDate.textContent = booking.date ? new Date(booking.date + 'T00:00:00').toLocaleDateString() : "---";
        
        // Time
        summaryTime.textContent = booking.time ? booking.time : "---";

        // Enable/Disable Payment Button
        if (booking.service && booking.stylist && booking.date && booking.time) {
            paymentButton.classList.remove("disabled"); 
        } else {
            paymentButton.classList.add("disabled");
        }
    }
    
    // --- 4. EVENT HANDLERS ---
    
    function handleServiceSelect(e) {
        const selectedId = e.target.value;
        if (!selectedId) {
            booking.service = null;
            populateStylists(null);
        } else {
            booking.service = services.find(s => s.id == selectedId);
            populateStylists(booking.service);
        }
        
        // Reset subsequent steps
        booking.stylist = null;
        booking.date = null;
        booking.time = null;
        datePicker.value = ""; // Clear date input
        populateTimeSlots(null, null);
        updateSummary();
    }
    
    function handleStylistSelect(e) {
        booking.stylist = {
            id: e.target.value,
            name: e.target.dataset.name
        };
        
        // Reset subsequent steps
        booking.time = null;
        populateTimeSlots(booking.date, booking.stylist.id); 
        updateSummary();
    }
    
    function handleDateSelect(e) {
        booking.date = e.target.value;
        
        // Reset subsequent steps
        booking.time = null;
        populateTimeSlots(booking.date, booking.stylist ? booking.stylist.id : null);
        updateSummary();
    }
    
    function handleTimeSelect(e) {
        if (e.target.classList.contains("time-slot") && !e.target.classList.contains("disabled")) {
            const currentlySelected = timeSlotsGrid.querySelector(".selected");
            if (currentlySelected) {
                currentlySelected.classList.remove("selected");
            }
            
            e.target.classList.add("selected");
            booking.time = e.target.textContent;
            updateSummary();
        }
    }

    // --- 5. SAVE BOOKING DATA TO LOCALSTORAGE ---
    function saveBookingToStorage() {
        if (booking.service && booking.stylist && booking.date && booking.time) {
            const bookingData = {
                serviceId: booking.service.id,
                serviceName: booking.service.name,
                servicePrice: booking.service.price,
                stylistId: parseInt(booking.stylist.id),
                stylistName: booking.stylist.name,
                date: booking.date,
                time: booking.time
            };
            localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
            return true;
        }
        return false;
    }

    // --- 6. HANDLE PROCEED TO PAYMENT ---
    paymentButton.addEventListener("click", function(e) {
        if (paymentButton.classList.contains("disabled")) {
            e.preventDefault();
            alert("Please complete all booking steps before proceeding to payment.");
            return false;
        }
        
        if (!saveBookingToStorage()) {
            e.preventDefault();
            alert("Error saving booking data. Please try again.");
            return false;
        }
        
        // Allow navigation to proceed
        return true;
    });

    // --- 7. INITIALIZE & ADD LISTENERS ---
    populateServices(); 
    populateStylists(null); // Show all stylists on load
    serviceSelect.addEventListener("change", handleServiceSelect);
    datePicker.addEventListener("change", handleDateSelect);
    timeSlotsGrid.addEventListener("click", handleTimeSelect); 
    
    updateSummary(); 
});
// --- THE EXTRA BRACE AT THE END WAS REMOVED ---