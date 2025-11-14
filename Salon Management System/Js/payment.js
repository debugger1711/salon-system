// ========================================
// Payment Page - Load Booking Data
// ========================================

document.addEventListener("DOMContentLoaded", function() {
    // Load booking data from localStorage
    const pendingBooking = localStorage.getItem('pendingBooking');
    
    if (!pendingBooking) {
        // No booking data found, redirect to booking page
        alert('No booking found. Please start a new booking.');
        window.location.href = 'booking.html';
        return;
    }
    
    const booking = JSON.parse(pendingBooking);
    
    // Update summary in payment page
    const summaryService = document.getElementById('summary-service');
    const summaryStylist = document.getElementById('summary-stylist');
    const summaryDate = document.getElementById('summary-date');
    const summaryTime = document.getElementById('summary-time');
    const summaryPrice = document.getElementById('summary-price');
    
    if (summaryService) summaryService.textContent = booking.serviceName;
    if (summaryStylist) summaryStylist.textContent = booking.stylistName;
    if (summaryDate) {
        const date = new Date(booking.date + 'T00:00:00');
        summaryDate.textContent = date.toLocaleDateString();
    }
    if (summaryTime) summaryTime.textContent = booking.time;
    if (summaryPrice) summaryPrice.textContent = `₹${booking.servicePrice}`;
    
    // ========== CARD NUMBER FORMATTING ==========
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, ''); // Remove spaces
            value = value.replace(/\D/g, ''); // Remove non-digits
            
            // Limit to 12 digits
            if (value.length > 12) {
                value = value.substring(0, 12);
            }
            
            // Add spaces every 4 digits
            let formattedValue = value.match(/.{1,4}/g);
            if (formattedValue) {
                formattedValue = formattedValue.join(' ');
            } else {
                formattedValue = value;
            }
            
            e.target.value = formattedValue;
        });
    }
    
    // ========== EXPIRY DATE FORMATTING ==========
    const cardExpiryInput = document.getElementById('card-expiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            
            // Limit to 4 digits
            if (value.length > 4) {
                value = value.substring(0, 4);
            }
            
            // Add slash after 2 digits
            if (value.length >= 2) {
                value = value.substring(0, 2) + ' / ' + value.substring(2);
            }
            
            e.target.value = value;
        });
    }
    
    // ========== CVV VALIDATION ==========
    const cardCvcInput = document.getElementById('card-cvc');
    if (cardCvcInput) {
        cardCvcInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            
            // Limit to 3 digits
            if (value.length > 3) {
                value = value.substring(0, 3);
            }
            
            e.target.value = value;
        });
    }
    
    // ========== VALIDATION FUNCTIONS ==========
    function validateCardNumber(cardNumber) {
        // Remove spaces and check if exactly 12 digits
        const digits = cardNumber.replace(/\s/g, '');
        return /^\d{12}$/.test(digits);
    }
    
    function validateExpiry(expiry) {
        // Dummy validation - just check if it has some digits
        // Accept any format as long as it has at least 2 digits
        const digits = expiry.replace(/\D/g, '');
        return digits.length >= 2;
    }
    
    function validateCVV(cvv) {
        // Must be exactly 3 digits
        return /^\d{3}$/.test(cvv);
    }
    
    function showValidationError(message) {
        // Remove existing error message
        const existingError = document.querySelector('.payment-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'payment-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background-color: #fee;
            color: #c33;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            border: 1px solid #fcc;
        `;
        
        // Insert before form
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.insertBefore(errorDiv, paymentForm.firstChild);
        }
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    // ========== FORM SUBMISSION ==========
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const cardName = document.getElementById('card-name').value.trim();
            const cardNumber = document.getElementById('card-number').value.trim();
            const cardExpiry = document.getElementById('card-expiry').value.trim();
            const cardCvc = document.getElementById('card-cvc').value.trim();
            
            // Basic field check
            if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
                showValidationError('Please fill in all payment fields.');
                return;
            }
            
            // Validate card name
            if (cardName.length < 3) {
                showValidationError('Please enter a valid name on card.');
                return;
            }
            
            // Validate card number (12 digits)
            if (!validateCardNumber(cardNumber)) {
                showValidationError('Card number must be exactly 12 digits.');
                return;
            }
            
            // Validate expiry date (dummy validation)
            if (!validateExpiry(cardExpiry)) {
                showValidationError('Please enter an expiry date.');
                return;
            }
            
            // Validate CVV (3 digits)
            if (!validateCVV(cardCvc)) {
                showValidationError('CVV must be exactly 3 digits.');
                return;
            }
            
            // All validations passed - save appointment
            saveAppointment(booking);
            
            // Store booking data for confirmation page
            const confirmationData = {
                ...booking,
                bookingId: 'BK-' + Date.now().toString().slice(-6)
            };
            localStorage.setItem('lastBooking', JSON.stringify(confirmationData));
            
            // Redirect to confirmation page
            window.location.href = 'confirmation.html';
        });
    }
});

// ========================================
// Save Appointment to localStorage
// ========================================
function saveAppointment(bookingData) {
    // Get current user
    const userData = localStorage.getItem('velvetUser');
    if (!userData) {
        console.error('No user logged in');
        return;
    }
    
    const currentUser = JSON.parse(userData);
    
    // Get existing appointments from localStorage
    const APPOINTMENTS_KEY = 'velvetAppointments';
    let appointments = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || '[]');
    
    // Create new appointment
    const newAppointment = {
        id: Date.now(), // Use timestamp as unique ID
        customerId: currentUser.id,
        customerName: currentUser.name,
        serviceId: bookingData.serviceId,
        stylistId: bookingData.stylistId,
        date: bookingData.date,
        time: bookingData.time,
        status: 'Confirmed',
        createdAt: new Date().toISOString()
    };
    
    // Add to appointments array
    appointments.push(newAppointment);
    
    // Save back to localStorage
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    
    // Clear pending booking
    localStorage.removeItem('pendingBooking');
    
    console.log('Appointment saved:', newAppointment);
}

