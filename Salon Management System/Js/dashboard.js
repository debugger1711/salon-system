document.addEventListener("DOMContentLoaded", function() {

    // --- 1. GET THE LOGGED-IN USER & SECURITY CHECK ---
    const userData = localStorage.getItem('velvetUser');
    let currentUser;

    if (userData) {
        currentUser = JSON.parse(userData);
    } else {
        // --- *** यही नया कोड है *** ---
        // अगर कोई यूज़र लॉग-इन नहीं है (userData खाली है),
        // तो उसे तुरंत लॉग-इन पेज पर वापस भेज दें।
        alert("Please log in to access your dashboard.");
        window.location.href = 'login.html'; 
        return; // आगे का कोई भी कोड रन न करें
        // --- *** --- ---
    }

    // --- Get Elements ---
    const allPages = document.querySelectorAll(".dashboard-page");
    const allNavLinks = document.querySelectorAll(".nav-link");
    
    const adminNav = document.getElementById("admin-nav");
    const stylistNav = document.getElementById("stylist-nav");
    const customerNav = document.getElementById("customer-nav");
    
    const welcomeMessage = document.getElementById("welcome-user");
    const roleBadge = document.getElementById("user-role-badge");

    // --- Get Modal Elements ---
    const feedbackModal = document.getElementById("feedback-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const feedbackForm = document.getElementById("feedback-form");
    const modalServiceName = document.getElementById("modal-service-name");
    
    // --- Logout Button ---
    const logoutBtn = document.getElementById("logout-btn");

    
    // --- Function to show a specific page ---
    function showPage(pageId) {
        allPages.forEach(page => page.classList.remove("active"));
        const pageToShow = document.getElementById(pageId);
        if (pageToShow) {
            pageToShow.classList.add("active");
        }
    }

    // --- 2. Initialize Dashboard on Load ---
    function initializeDashboard() {
        let defaultPage = '';
        const userRole = currentUser.role;
        
        // Find the customer object from mock data (if exists)
        const customer = mockCustomers.find(c => c.name === currentUser.name);

        if (userRole === 'admin') {
            adminNav.style.display = 'block';
            welcomeMessage.textContent = `Welcome, ${currentUser.name}!`;
            roleBadge.textContent = 'Admin';
            defaultPage = 'page-admin-dashboard';

        } else if (userRole === 'stylist') {
            stylistNav.style.display = 'block';
            welcomeMessage.textContent = `Welcome, ${currentUser.name}!`;
            roleBadge.textContent = 'Stylist';
            defaultPage = 'page-stylist-calendar';

        } else if (userRole === 'customer') {
            // Show customer dashboard for any user with customer role
            customerNav.style.display = 'block';
            welcomeMessage.textContent = `Welcome, ${currentUser.name}!`;
            roleBadge.textContent = 'Customer';
            defaultPage = 'page-customer-appointments';
            
            // Populate customer appointments (works for both mock and new users)
            populateCustomerAppointments(customer || currentUser);
            
            // Populate customer profile
            if (customer) {
                populateCustomerProfile(customer);
            } else {
                // For new registered users, populate with currentUser data
                populateCustomerProfileFromUser(currentUser);
            }

        } else {
            // Default fallback
            welcomeMessage.textContent = 'Welcome, Guest!';
            roleBadge.textContent = 'Guest';
        }

        // Show default page
        if (defaultPage) {
            showPage(defaultPage);
            const defaultLink = document.querySelector(`.nav-link[data-page="${defaultPage}"]`);
            if (defaultLink) {
                defaultLink.classList.add('active');
            }
        }
    }


    // --- 3. POPULATE CUSTOMER APPOINTMENTS ---
    function populateCustomerAppointments(customer) {
        const upcomingTable = document.querySelector("#page-customer-appointments .data-table:first-of-type tbody");
        const pastTable = document.querySelector("#page-customer-appointments .data-table:last-of-type tbody");

        if (!upcomingTable || !pastTable) {
            console.log('Appointment tables not found');
            return;
        }

        upcomingTable.innerHTML = "";
        pastTable.innerHTML = "";

        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        // Get appointments from mock data (if customer exists in mock data)
        let mockAppts = [];
        if (customer && customer.id) {
            mockAppts = mockAppointments.filter(app => app.customerId === customer.id);
        }
        
        // Get appointments from localStorage
        const APPOINTMENTS_KEY = 'velvetAppointments';
        const storedAppointments = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || '[]');
        
        // Filter stored appointments for current user
        const userAppts = storedAppointments.filter(app => {
            // Match by customerId or customerName
            return app.customerId === currentUser.id || 
                   app.customerName === currentUser.name ||
                   (customer && app.customerId === customer.id);
        });
        
        // Combine both sources
        const allAppointments = [...mockAppts, ...userAppts];
        
        // Remove duplicates based on ID
        const uniqueAppointments = [];
        const seenIds = new Set();
        allAppointments.forEach(app => {
            if (!seenIds.has(app.id)) {
                seenIds.add(app.id);
                uniqueAppointments.push(app);
            }
        });

        uniqueAppointments.forEach(app => {
            const service = mockServices.find(s => s.id === app.serviceId);
            const stylist = mockStylists.find(s => s.id === app.stylistId);
            
            if (!service || !stylist) {
                console.log('Service or stylist not found for appointment:', app);
                return;
            }
            
            // Parse date correctly - handle both YYYY-MM-DD and other formats
            let appDate;
            if (app.date.includes('T')) {
                appDate = new Date(app.date);
            } else {
                appDate = new Date(app.date + "T00:00:00");
            }
            appDate.setHours(0, 0, 0, 0);
            
            const isUpcoming = appDate >= today;

            const row = document.createElement('tr');
            
            // Format date for display
            const formattedDate = appDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            if (isUpcoming) {
                row.innerHTML = `
                    <td>${service.name}</td>
                    <td>${stylist.name}</td>
                    <td>${formattedDate}</td>
                    <td>${app.time}</td>
                    <td><button class="btn-cancel" data-id="${app.id}">Cancel</button></td>
                `;
                upcomingTable.appendChild(row);
            } else {
                row.innerHTML = `
                    <td>${service.name}</td>
                    <td>${stylist.name}</td>
                    <td>${formattedDate}</td>
                    <td>${app.time}</td>
                    <td>
                        <button class="btn-feedback" data-service-id="${service.id}" data-service-name="${service.name}">
                            Leave Feedback
                        </button>
                    </td>
                `;
                pastTable.appendChild(row);
            }
        });

        // Event Listeners for buttons - use event delegation
        // Remove old listeners if any
        const newUpcomingTable = upcomingTable.cloneNode(true);
        upcomingTable.parentNode.replaceChild(newUpcomingTable, upcomingTable);
        const newPastTable = pastTable.cloneNode(true);
        pastTable.parentNode.replaceChild(newPastTable, pastTable);
        
        // Get the new table references
        const updatedUpcomingTable = document.querySelector("#page-customer-appointments .data-table:first-of-type tbody");
        const updatedPastTable = document.querySelector("#page-customer-appointments .data-table:last-of-type tbody");
        
        // Add event listener to upcoming table
        if (updatedUpcomingTable) {
            updatedUpcomingTable.addEventListener('click', function(e) {
                if (e.target.classList.contains('btn-cancel')) {
                    const appointmentId = parseInt(e.target.getAttribute('data-id'));
                    if (confirm('Are you sure you want to cancel this appointment?')) {
                        // Remove from localStorage
                        const APPOINTMENTS_KEY = 'velvetAppointments';
                        const storedAppointments = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || '[]');
                        const updatedAppointments = storedAppointments.filter(app => app.id !== appointmentId);
                        localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
                        
                        // Refresh appointments display
                        populateCustomerAppointments(customer || currentUser);
                        alert('Appointment cancelled.');
                    }
                }
            });
        }

        // Add event listener to past table
        if (updatedPastTable) {
            updatedPastTable.addEventListener('click', function(e) {
                if (e.target.classList.contains('btn-feedback')) {
                    const serviceId = parseInt(e.target.getAttribute('data-service-id'));
                    const serviceName = e.target.getAttribute('data-service-name');
                    
                    // Check if feedback already exists for this appointment
                    const FEEDBACKS_KEY = 'velvetFeedbacks';
                    const feedbacks = JSON.parse(localStorage.getItem(FEEDBACKS_KEY) || '[]');
                    const existingFeedback = feedbacks.find(f => 
                        f.customerId === currentUser.id && 
                        f.serviceId === serviceId
                    );
                    
                    if (existingFeedback) {
                        if (confirm('You have already submitted feedback for this service. Would you like to update it?')) {
                            openFeedbackModal(serviceName, serviceId);
                            // Pre-fill existing feedback
                            setTimeout(() => {
                                const ratingInput = feedbackForm.querySelector(`input[name="rating"][value="${existingFeedback.rating}"]`);
                                if (ratingInput) ratingInput.checked = true;
                                const feedbackText = document.getElementById('feedback-text');
                                if (feedbackText) feedbackText.value = existingFeedback.feedback || '';
                            }, 100);
                        }
                    } else {
                        openFeedbackModal(serviceName, serviceId);
                    }
                }
            });
        }
    }

    // --- 4. POPULATE CUSTOMER PROFILE ---
    function populateCustomerProfile(customer) {
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profilePhone = document.getElementById('profile-phone');
        
        if (profileName) profileName.value = customer.name;
        if (profileEmail) profileEmail.value = customer.email;
        if (profilePhone) profilePhone.value = customer.phone;
    }
    
    // --- 4b. POPULATE CUSTOMER PROFILE FROM USER DATA (for new registered users) ---
    function populateCustomerProfileFromUser(user) {
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profilePhone = document.getElementById('profile-phone');
        
        if (profileName) profileName.value = user.name || '';
        if (profileEmail) profileEmail.value = user.email || '';
        if (profilePhone) profilePhone.value = user.mobile || '';
    }


    // --- 5. FEEDBACK MODAL FUNCTIONS ---
    let currentServiceId = null;
    let currentServiceName = null;
    
    function openFeedbackModal(serviceName, serviceId) {
        currentServiceName = serviceName;
        currentServiceId = serviceId;
        modalServiceName.textContent = serviceName;
        feedbackModal.style.display = 'flex';
        
        // Reset form
        feedbackForm.reset();
        
        // Reset star ratings visual state
        const starInputs = feedbackForm.querySelectorAll('input[type="radio"]');
        starInputs.forEach(input => {
            input.checked = false;
        });
    }
    
    function closeFeedbackModal() {
        feedbackModal.style.display = 'none';
        feedbackForm.reset();
        currentServiceId = null;
        currentServiceName = null;
    }

    closeModalBtn.addEventListener('click', closeFeedbackModal);
    
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get rating
        const ratingInput = feedbackForm.querySelector('input[name="rating"]:checked');
        if (!ratingInput) {
            alert('Please select a rating.');
            return;
        }
        
        const rating = parseInt(ratingInput.value);
        const feedbackText = document.getElementById('feedback-text').value.trim();
        
        // Save feedback to localStorage
        const FEEDBACKS_KEY = 'velvetFeedbacks';
        let feedbacks = JSON.parse(localStorage.getItem(FEEDBACKS_KEY) || '[]');
        
        const newFeedback = {
            id: Date.now(),
            customerId: currentUser.id,
            customerName: currentUser.name,
            serviceId: currentServiceId,
            serviceName: currentServiceName,
            rating: rating,
            feedback: feedbackText,
            date: new Date().toISOString()
        };
        
        feedbacks.push(newFeedback);
        localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(feedbacks));
        
        // Show success message
        alert(`Thank you for your ${rating}-star feedback! Your review has been saved.`);
        closeFeedbackModal();
        
        // Optionally refresh the appointments to show feedback was submitted
        // You could add a visual indicator that feedback was given
    });
    
    feedbackModal.addEventListener('click', function(e) {
        if (e.target === feedbackModal) {
            closeFeedbackModal();
        }
    });


    // --- 6. Add Click Handlers to Nav Links ---
    allNavLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            const pageId = this.getAttribute("data-page");
            showPage(pageId);
            allNavLinks.forEach(nav => nav.classList.remove("active"));
            this.classList.add("active");
            
            // Refresh appointments when navigating to appointments page
            if (pageId === 'page-customer-appointments') {
                populateCustomerAppointments(customer || currentUser);
            }
        });
    });

    // --- 7. Logout Button Listener ---
    if(logoutBtn) { 
        logoutBtn.addEventListener("click", function(event) {
            event.preventDefault(); 
            localStorage.removeItem("velvetUser"); 
            alert("You have been logged out.");
            window.location.href = "login.html";
        });
    }

    // --- 8. Run the initialization function ---
    initializeDashboard();

});