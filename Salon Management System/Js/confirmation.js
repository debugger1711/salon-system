// ========================================
// Confirmation Page - Display Booking Details
// ========================================

document.addEventListener("DOMContentLoaded", function() {
    // Try to get booking data from lastBooking (set by payment page)
    let bookingData = localStorage.getItem('lastBooking');
    
    if (bookingData) {
        const booking = JSON.parse(bookingData);
        
        // Update confirmation page
        const summaryBookingId = document.getElementById('summary-booking-id');
        const summaryService = document.getElementById('summary-service');
        const summaryStylist = document.getElementById('summary-stylist');
        const summaryDateTime = document.getElementById('summary-datetime');
        
        if (summaryBookingId) summaryBookingId.textContent = booking.bookingId || 'BK-' + Date.now().toString().slice(-6);
        if (summaryService) summaryService.textContent = booking.serviceName;
        if (summaryStylist) summaryStylist.textContent = booking.stylistName;
        if (summaryDateTime) {
            const date = new Date(booking.date + 'T00:00:00');
            const dateStr = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            summaryDateTime.textContent = `${dateStr} at ${booking.time}`;
        }
        
        // Clear lastBooking after displaying
        localStorage.removeItem('lastBooking');
        return;
    }
    
    // Fallback: Try to get from the most recent appointment
    const APPOINTMENTS_KEY = 'velvetAppointments';
    const appointments = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || '[]');
    
    if (appointments.length > 0) {
        // Get the most recent appointment
        const latestAppointment = appointments[appointments.length - 1];
        const service = mockServices.find(s => s.id === latestAppointment.serviceId);
        const stylist = mockStylists.find(s => s.id === latestAppointment.stylistId);
        
        if (service && stylist) {
            const summaryBookingId = document.getElementById('summary-booking-id');
            const summaryService = document.getElementById('summary-service');
            const summaryStylist = document.getElementById('summary-stylist');
            const summaryDateTime = document.getElementById('summary-datetime');
            
            if (summaryBookingId) summaryBookingId.textContent = 'BK-' + latestAppointment.id.toString().slice(-6);
            if (summaryService) summaryService.textContent = service.name;
            if (summaryStylist) summaryStylist.textContent = stylist.name;
            if (summaryDateTime) {
                const date = new Date(latestAppointment.date + 'T00:00:00');
                const dateStr = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
                summaryDateTime.textContent = `${dateStr} at ${latestAppointment.time}`;
            }
            return;
        }
    }
    
    // No booking found
    alert('No booking found.');
    window.location.href = 'booking.html';
});

function displayConfirmation(appointment) {
    // This function can be used if we have appointment data directly
    // For now, the main flow uses pendingBooking
}

