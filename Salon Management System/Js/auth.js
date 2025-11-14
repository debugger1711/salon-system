// ========================================
// Authentication with OTP Auto-Capture
// ========================================

// Wait for the page to load
document.addEventListener("DOMContentLoaded", function() {
    
    // ========== ELEMENTS ==========
    const showLoginBtn = document.getElementById("show-login-btn");
    const showRegisterBtn = document.getElementById("show-register-btn");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    
    // ========== DUMMY USER DATABASE (localStorage) ==========
    const STORAGE_KEY = 'velvetUsers';
    const OTP_STORAGE_KEY = 'velvetOTPs';
    const SESSION_KEY = 'velvetUser';
    
    // Initialize storage if empty
    function initStorage() {
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        }
        if (!localStorage.getItem(OTP_STORAGE_KEY)) {
            localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify({}));
        }
    }
    
    initStorage();
    
    // ========== UTILITY FUNCTIONS ==========
    function getUsers() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }
    
    function saveUser(user) {
        const users = getUsers();
        users.push(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
    
    function getUserByEmail(email) {
        const users = getUsers();
        return users.find(u => u.email === email);
    }
    
    function getUserByMobile(mobile) {
        const users = getUsers();
        return users.find(u => u.mobile === mobile);
    }
    
    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    function saveOTP(identifier, otp) {
        const otps = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '{}');
        otps[identifier] = {
            otp: otp,
            expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
        };
        localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
    }
    
    function verifyOTP(identifier, inputOTP) {
        const otps = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '{}');
        const otpData = otps[identifier];
        
        if (!otpData) {
            return { valid: false, message: 'OTP not found. Please request a new one.' };
        }
        
        if (Date.now() > otpData.expiresAt) {
            delete otps[identifier];
            localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
            return { valid: false, message: 'OTP has expired. Please request a new one.' };
        }
        
        if (otpData.otp !== inputOTP) {
            return { valid: false, message: 'Invalid OTP. Please try again.' };
        }
        
        // OTP verified, remove it
        delete otps[identifier];
        localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
        return { valid: true, message: 'OTP verified successfully!' };
    }
    
    function showMessage(message, type = 'error') {
        // Remove existing messages
        const existingMsg = document.querySelector('.auth-message');
        if (existingMsg) {
            existingMsg.remove();
        }
        
        // Create message element
        const msgDiv = document.createElement('div');
        msgDiv.className = `auth-message ${type}`;
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            padding: 12px 16px;
            margin-bottom: 20px;
            border-radius: 6px;
            font-size: 0.95rem;
            ${type === 'error' ? 'background-color: #fee; color: #c33; border: 1px solid #fcc;' : 'background-color: #efe; color: #3c3; border: 1px solid #cfc;'}
        `;
        
        // Insert message
        const activeForm = loginForm.style.display !== 'none' ? loginForm : registerForm;
        activeForm.insertBefore(msgDiv, activeForm.firstChild.nextSibling);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (msgDiv.parentNode) {
                msgDiv.remove();
            }
        }, 5000);
    }
    
    // ========== OTP AUTO-CAPTURE ==========
    let otpInputs = [];
    
    function initializeOTPCapture() {
        // Check if SMS Receiver API is available (Chrome/Edge)
        if ('OTPCredential' in window) {
            navigator.credentials.get({
                otp: { transport: ['sms'] }
            }).then(otp => {
                if (otp && otp.code) {
                    autoFillOTP(otp.code);
                }
            }).catch(err => {
                console.log('SMS Receiver API not available or user denied:', err);
            });
        }
        
        // Fallback: Listen for paste events
        document.addEventListener('paste', handlePaste);
    }
    
    function handlePaste(e) {
        const target = e.target;
        if (target && target.classList.contains('otp-input')) {
            e.preventDefault();
            const pastedData = (e.clipboardData || window.clipboardData).getData('text');
            const otp = pastedData.replace(/\D/g, '').substring(0, 6);
            if (otp.length === 6) {
                autoFillOTP(otp);
            }
        }
    }
    
    function autoFillOTP(otp) {
        otpInputs.forEach((input, index) => {
            if (index < otp.length) {
                input.value = otp[index];
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        
        // Focus on last input
        if (otpInputs.length > 0) {
            otpInputs[otpInputs.length - 1].focus();
        }
    }
    
    function createOTPInputs(container) {
        // Clear existing OTP inputs
        const existingOTP = container.querySelector('.otp-container');
        if (existingOTP) {
            existingOTP.remove();
        }
        
        // Create OTP container
        const otpContainer = document.createElement('div');
        otpContainer.className = 'otp-container';
        otpContainer.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
            margin: 20px 0;
        `;
        
        otpInputs = [];
        
        // Create 6 input fields
        for (let i = 0; i < 6; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.className = 'otp-input';
            input.style.cssText = `
                width: 45px;
                height: 45px;
                text-align: center;
                font-size: 1.5rem;
                font-weight: bold;
                border: 2px solid #ddd;
                border-radius: 8px;
                transition: all 0.3s ease;
            `;
            
            // Handle input
            input.addEventListener('input', function(e) {
                const value = e.target.value.replace(/\D/g, '');
                e.target.value = value;
                
                // Move to next input
                if (value && i < 5) {
                    otpInputs[i + 1].focus();
                }
                
                // Auto-submit when all filled
                if (i === 5 && value) {
                    const fullOTP = otpInputs.map(inp => inp.value).join('');
                    if (fullOTP.length === 6) {
                        // Trigger verification
                        const verifyBtn = container.querySelector('.verify-otp-btn');
                        if (verifyBtn) {
                            verifyBtn.click();
                        }
                    }
                }
            });
            
            // Handle backspace
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' && !e.target.value && i > 0) {
                    otpInputs[i - 1].focus();
                }
            });
            
            // Handle arrow keys
            input.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowLeft' && i > 0) {
                    otpInputs[i - 1].focus();
                }
                if (e.key === 'ArrowRight' && i < 5) {
                    otpInputs[i + 1].focus();
                }
            });
            
            otpInputs.push(input);
            otpContainer.appendChild(input);
        }
        
        container.appendChild(otpContainer);
        
        // Focus first input
        setTimeout(() => otpInputs[0].focus(), 100);
        
        // Initialize OTP capture
        initializeOTPCapture();
    }
    
    function getOTPFromInputs() {
        return otpInputs.map(input => input.value).join('');
    }
    
    // ========== API FUNCTIONS (with fallback) ==========
    async function sendOTPAPI(mobile, email) {
        try {
            // Try to call actual API
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mobile, email })
            });
            
            if (response.ok) {
                const data = await response.json();
                return { success: true, message: data.message || 'OTP sent successfully!' };
            }
            throw new Error('API call failed');
        } catch (error) {
            // Fallback to dummy OTP
            console.log('API not available, using dummy OTP:', error);
            return sendOTPDummy(mobile, email);
        }
    }
    
    function sendOTPDummy(mobile, email) {
        const identifier = mobile || email;
        const otp = generateOTP();
        saveOTP(identifier, otp);
        
        // Simulate OTP sending (in real app, this would be sent via SMS/Email)
        console.log(`[DUMMY] OTP for ${identifier}: ${otp}`);
        alert(`[DUMMY MODE] OTP sent to ${mobile ? 'mobile' : 'email'}: ${otp}\n\n(In production, this would be sent via SMS/Email)`);
        
        return { success: true, message: 'OTP sent successfully! (Dummy mode)' };
    }
    
    async function loginAPI(emailOrMobile, password) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    identifier: emailOrMobile, 
                    password 
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return { success: true, user: data.user };
            }
            throw new Error('Login failed');
        } catch (error) {
            // Fallback to dummy login
            console.log('API not available, using dummy login:', error);
            return loginDummy(emailOrMobile, password);
        }
    }
    
    function loginDummy(emailOrMobile, password) {
        const users = getUsers();
        const user = users.find(u => 
            u.email === emailOrMobile || 
            u.mobile === emailOrMobile
        );
        
        if (!user) {
            return { success: false, message: 'User not found. Please register first.' };
        }
        
        if (user.password !== password) {
            return { success: false, message: 'Invalid password.' };
        }
        
        // Remove password before storing
        const { password: _, ...userData } = user;
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        
        return { success: true, user: userData };
    }
    
    // ========== REGISTRATION HANDLER ==========
    function handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const mobile = document.getElementById('register-mobile').value.trim();
        const password = document.getElementById('register-password').value;
        
        // Validation
        if (!name || !email || !mobile || !password) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters.', 'error');
            return;
        }
        
        // Check if user already exists
        if (getUserByEmail(email)) {
            showMessage('Email already registered. Please login instead.', 'error');
            return;
        }
        
        if (getUserByMobile(mobile)) {
            showMessage('Mobile number already registered. Please login instead.', 'error');
            return;
        }
        
        // Show OTP section
        showOTPSection(registerForm, mobile, email, () => {
            // OTP verified, complete registration
            const newUser = {
                id: Date.now(),
                name,
                email,
                mobile,
                password, // In production, hash this!
                role: 'customer',
                createdAt: new Date().toISOString()
            };
            
            saveUser(newUser);
            
            // Remove password before storing in session
            const { password: _, ...userData } = newUser;
            localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
            
            showMessage('Registration successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        });
    }
    
    // ========== LOGIN HANDLER ==========
    function handleLogin(e) {
        e.preventDefault();
        
        const emailOrMobile = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        
        if (!emailOrMobile || !password) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }
        
        // Try API first, fallback to dummy
        loginAPI(emailOrMobile, password).then(result => {
            if (result.success) {
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showMessage(result.message || 'Login failed. Please check your credentials.', 'error');
            }
        });
    }
    
    // ========== OTP SECTION ==========
    function showOTPSection(form, mobile, email, onVerified) {
        // Hide form fields
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.style.display = 'none';
        });
        
        // Hide submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.style.display = 'none';
        }
        
        // Create OTP section
        const existingOTPSection = form.querySelector('.otp-section');
        if (existingOTPSection) {
            existingOTPSection.remove();
        }
        
        const otpSection = document.createElement('div');
        otpSection.className = 'otp-section';
        otpSection.innerHTML = `
            <h3>Enter OTP</h3>
            <p style="text-align: center; color: #666; margin-bottom: 20px;">
                We've sent a 6-digit OTP to ${mobile ? 'your mobile' : 'your email'}
            </p>
        `;
        
        // Create OTP inputs
        createOTPInputs(otpSection);
        
        // Add verify button
        const verifyBtn = document.createElement('button');
        verifyBtn.type = 'button';
        verifyBtn.className = 'btn btn-primary btn-full-width verify-otp-btn';
        verifyBtn.textContent = 'Verify OTP';
        verifyBtn.style.marginTop = '20px';
        
        verifyBtn.addEventListener('click', async function() {
            const otp = getOTPFromInputs();
            
            if (otp.length !== 6) {
                showMessage('Please enter the complete 6-digit OTP.', 'error');
                return;
            }
            
            const identifier = mobile || email;
            const verification = verifyOTP(identifier, otp);
            
            if (verification.valid) {
                showMessage(verification.message, 'success');
                if (onVerified) {
                    setTimeout(() => onVerified(), 500);
                }
            } else {
                showMessage(verification.message, 'error');
                // Clear OTP inputs
                otpInputs.forEach(input => input.value = '');
                otpInputs[0].focus();
            }
        });
        
        // Add resend button
        const resendBtn = document.createElement('button');
        resendBtn.type = 'button';
        resendBtn.className = 'btn btn-secondary btn-full-width';
        resendBtn.textContent = 'Resend OTP';
        resendBtn.style.cssText = 'margin-top: 10px; background-color: #6c757d;';
        
        resendBtn.addEventListener('click', async function() {
            resendBtn.disabled = true;
            resendBtn.textContent = 'Sending...';
            
            const result = await sendOTPAPI(mobile, email);
            if (result.success) {
                showMessage('OTP resent successfully!', 'success');
                otpInputs.forEach(input => input.value = '');
                otpInputs[0].focus();
            } else {
                showMessage('Failed to resend OTP. Please try again.', 'error');
            }
            
            setTimeout(() => {
                resendBtn.disabled = false;
                resendBtn.textContent = 'Resend OTP';
            }, 3000);
        });
        
        otpSection.appendChild(verifyBtn);
        otpSection.appendChild(resendBtn);
        
        form.appendChild(otpSection);
        
        // Send OTP
        sendOTPAPI(mobile, email).then(result => {
            if (result.success) {
                showMessage(result.message, 'success');
            } else {
                showMessage('Failed to send OTP. Please try again.', 'error');
            }
        });
    }
    
    // ========== FORM TOGGLE ==========
    showLoginBtn.addEventListener("click", function() {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
        showLoginBtn.classList.add("active");
        showRegisterBtn.classList.remove("active");
        
        // Reset forms
        loginForm.reset();
        registerForm.reset();
    });
    
    showRegisterBtn.addEventListener("click", function() {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
        showLoginBtn.classList.remove("active");
        showRegisterBtn.classList.add("active");
        
        // Reset forms
        loginForm.reset();
        registerForm.reset();
    });
    
    // ========== FORM SUBMISSIONS ==========
    loginForm.addEventListener("submit", handleLogin);
    registerForm.addEventListener("submit", handleRegister);
    
    // ========== FORGOT PASSWORD ==========
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            const emailOrMobile = prompt('Enter your email or mobile number to reset password:');
            if (emailOrMobile) {
                alert('Password reset link/OTP would be sent to your registered email/mobile.\n\n(In production, this would trigger a password reset flow)');
            }
        });
    }
});
