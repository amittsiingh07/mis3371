/*
Program name: validation.js
Author: Amit Singh
Date created: 05/08/2026
Date last edited: 05/08/2026
Version: 4.0
Description: External JavaScript file for patient registration form validation (Homework 4).
             Added cookies, local storage, fetch API, remember me functionality,
             welcome back message, and clear user data option.
*/

// ===== ERROR TRACKING OBJECT =====
let fieldErrors = {
    firstname: true,
    lastname: true,
    dob: true,
    email: true,
    phone: true,
    zip: true,
    address: true,
    city: true,
    state: true,
    username: true,
    password: true,
    confirmpassword: true,
    ssn: false,
    hipaa: true
};

// ===== HELPER FUNCTIONS =====

function showError(fieldId, message) {
    let errorDiv = document.getElementById(fieldId);
    if (errorDiv) {
        errorDiv.innerHTML = '❌ ' + message;
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '11px';
        errorDiv.style.marginTop = '3px';
    }
}

function clearError(fieldId) {
    let errorDiv = document.getElementById(fieldId);
    if (errorDiv) {
        errorDiv.innerHTML = '✓ Looks good!';
        errorDiv.style.color = 'green';
    }
}

function checkFormValidity() {
    let hasErrors = false;
    
    for (let field in fieldErrors) {
        if (fieldErrors[field] === true) {
            hasErrors = true;
            console.log("Field with error:", field);
        }
    }
    
    let submitBtn = document.getElementById('btn-submit');
    if (submitBtn) {
        submitBtn.disabled = hasErrors;
        if (hasErrors) {
            submitBtn.style.backgroundColor = '#cccccc';
            submitBtn.style.cursor = 'not-allowed';
        } else {
            submitBtn.style.backgroundColor = '#003399';
            submitBtn.style.cursor = 'pointer';
        }
    }
    
    return !hasErrors;
}

function getFieldValue(fieldId) {
    let field = document.getElementById(fieldId);
    return field ? field.value : '';
}

// ===== COOKIE FUNCTIONS (NEW FOR HW4) =====

function setCookie(name, value, hours) {
    let date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    let expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
    console.log("Cookie saved:", name, "=", value);
}

function getCookie(name) {
    let cookieName = name + "=";
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    console.log("Cookie deleted:", name);
}

function checkWelcomeCookie() {
    let firstName = getCookie("patientFirstName");
    let welcomeMessage = document.getElementById("welcomeMessage");
    let notUserBtn = document.getElementById("notUserBtn");
    let rememberMe = document.getElementById("rememberMe");
    
    if (firstName && firstName !== "") {
        welcomeMessage.innerHTML = "Welcome back, " + firstName + "! 👋";
        if (notUserBtn) notUserBtn.style.display = "inline-block";
        
        // If remember me is checked, load the data
        if (rememberMe && rememberMe.checked) {
            loadAllFormData();
            // Also prefill the first name field
            let firstNameField = document.getElementById("firstname");
            if (firstNameField && firstNameField.value === "") {
                firstNameField.value = firstName;
                validateFirstName();
            }
        }
    } else {
        welcomeMessage.innerHTML = "Welcome New User! 👋 Please fill out the form below.";
        if (notUserBtn) notUserBtn.style.display = "none";
    }
}

function saveNameCookie() {
    let rememberMe = document.getElementById("rememberMe");
    let firstName = document.getElementById("firstname").value;
    
    if (rememberMe && rememberMe.checked && firstName && firstName !== "") {
        setCookie("patientFirstName", firstName, 48); // 48 hour expiry
        let welcomeMessage = document.getElementById("welcomeMessage");
        if (welcomeMessage) {
            welcomeMessage.innerHTML = "Welcome back, " + firstName + "! 👋";
        }
        let notUserBtn = document.getElementById("notUserBtn");
        if (notUserBtn) notUserBtn.style.display = "inline-block";
    } else if (rememberMe && !rememberMe.checked) {
        deleteCookie("patientFirstName");
    }
}

function clearUserData() {
    // Clear cookie
    deleteCookie("patientFirstName");
    
    // Clear local storage
    localStorage.clear();
    
    // Reset the form
    document.getElementById("registrationForm").reset();
    
    // Reset error flags
    for (let field in fieldErrors) {
        if (field !== 'ssn') {
            fieldErrors[field] = true;
        }
    }
    fieldErrors.ssn = false;
    
    // Clear all error messages
    let errorContainers = document.querySelectorAll('.error-container');
    errorContainers.forEach(container => {
        container.innerHTML = '';
    });
    
    // Reset slider values
    let painSlider = document.getElementById("painSlider");
    let healthSlider = document.getElementById("healthSlider");
    if (painSlider) painSlider.value = 5;
    if (healthSlider) healthSlider.value = 5;
    updateSliderValue('painSlider', 'painValue');
    updateSliderValue('healthSlider', 'healthValue');
    
    // Update welcome message
    let welcomeMessage = document.getElementById("welcomeMessage");
    if (welcomeMessage) {
        welcomeMessage.innerHTML = "Welcome New User! 👋 Please fill out the form below.";
    }
    
    // Hide the "Not you" button
    let notUserBtn = document.getElementById("notUserBtn");
    if (notUserBtn) notUserBtn.style.display = "none";
    
    // Re-run validation to disable submit button
    checkFormValidity();
    
    alert("All your saved data has been cleared. You are now a new user.");
}

// ===== LOCAL STORAGE FUNCTIONS (NEW FOR HW4) =====

function saveToLocalStorage() {
    let rememberMe = document.getElementById("rememberMe");
    
    if (!rememberMe || !rememberMe.checked) {
        return;
    }
    
    // Save text fields
    let fields = ['firstname', 'lastname', 'mi', 'dob', 'email', 'cellphone', 
                  'address1', 'address2', 'city', 'zip', 'username', 
                  'homephone', 'ecname', 'ecrelation', 'ecphone', 
                  'inscompany', 'policynum', 'groupnum', 'pcp',
                  'medications', 'allergies', 'chiefcomplaint', 'symptoms'];
    
    for (let field of fields) {
        let element = document.getElementById(field);
        if (element) {
            localStorage.setItem(field, element.value);
        }
    }
    
    // Save state selection
    let stateSelect = document.getElementById('stateSelect');
    if (stateSelect) {
        localStorage.setItem('state', stateSelect.value);
    }
    
    // Save radio button selections
    let gender = document.querySelector('input[name="gender"]:checked');
    if (gender) localStorage.setItem('gender', gender.value);
    
    let contact = document.querySelector('input[name="contact"]:checked');
    if (contact) localStorage.setItem('contact', contact.value);
    
    let smoke = document.querySelector('input[name="smoke"]:checked');
    if (smoke) localStorage.setItem('smoke', smoke.value);
    
    let hasinsurance = document.querySelector('input[name="hasinsurance"]:checked');
    if (hasinsurance) localStorage.setItem('hasinsurance', hasinsurance.value);
    
    // Save checkbox states for illness (loaded via fetch, so use dynamic query)
    let illnessCheckboxes = document.querySelectorAll('#illnessesContainer input[type="checkbox"]:checked');
    let illnessValues = [];
    illnessCheckboxes.forEach(cb => illnessValues.push(cb.value));
    localStorage.setItem('illnesses', JSON.stringify(illnessValues));
    
    // Save vaccine checkboxes
    let vaccineCheckboxes = document.querySelectorAll('input[name="vaccine"]:checked');
    let vaccineValues = [];
    vaccineCheckboxes.forEach(cb => vaccineValues.push(cb.value));
    localStorage.setItem('vaccines', JSON.stringify(vaccineValues));
    
    // Save slider values
    let painSlider = document.getElementById('painSlider');
    if (painSlider) localStorage.setItem('painlevel', painSlider.value);
    
    let healthSlider = document.getElementById('healthSlider');
    if (healthSlider) localStorage.setItem('healthrating', healthSlider.value);
    
    // Save checkbox states
    let hipaaCheckbox = document.getElementById('hipaaCheckbox');
    if (hipaaCheckbox) localStorage.setItem('hipaa', hipaaCheckbox.checked);
    
    let emailsms = document.querySelector('input[name="emailsms"]');
    if (emailsms) localStorage.setItem('emailsms', emailsms.checked);
    
    console.log("Data saved to local storage");
}

function loadAllFormData() {
    let rememberMe = document.getElementById("rememberMe");
    
    if (!rememberMe || !rememberMe.checked) {
        return;
    }
    
    // Load text fields
    let fields = ['firstname', 'lastname', 'mi', 'dob', 'email', 'cellphone', 
                  'address1', 'address2', 'city', 'zip', 'username', 
                  'homephone', 'ecname', 'ecrelation', 'ecphone', 
                  'inscompany', 'policynum', 'groupnum', 'pcp',
                  'medications', 'allergies', 'chiefcomplaint', 'symptoms'];
    
    for (let field of fields) {
        let savedValue = localStorage.getItem(field);
        let element = document.getElementById(field);
        if (savedValue && element && element.value === '') {
            element.value = savedValue;
            // Trigger validation for loaded fields
            if (field === 'firstname') validateFirstName();
            if (field === 'lastname') validateLastName();
            if (field === 'email') validateEmail();
            if (field === 'cellphone') validatePhone();
            if (field === 'zip') validateZip();
            if (field === 'username') validateUsername();
            if (field === 'dob') validateBirthDate();
            if (field === 'address1') validateAddress();
            if (field === 'city') validateCity();
        }
    }
    
    // Load state
    let savedState = localStorage.getItem('state');
    let stateSelect = document.getElementById('stateSelect');
    if (savedState && stateSelect) {
        stateSelect.value = savedState;
        validateState();
    }
    
    // Load radio buttons
    let savedGender = localStorage.getItem('gender');
    if (savedGender) {
        let genderRadio = document.querySelector(`input[name="gender"][value="${savedGender}"]`);
        if (genderRadio) genderRadio.checked = true;
    }
    
    let savedContact = localStorage.getItem('contact');
    if (savedContact) {
        let contactRadio = document.querySelector(`input[name="contact"][value="${savedContact}"]`);
        if (contactRadio) contactRadio.checked = true;
    }
    
    let savedSmoke = localStorage.getItem('smoke');
    if (savedSmoke) {
        let smokeRadio = document.querySelector(`input[name="smoke"][value="${savedSmoke}"]`);
        if (smokeRadio) smokeRadio.checked = true;
    }
    
    let savedInsurance = localStorage.getItem('hasinsurance');
    if (savedInsurance) {
        let insuranceRadio = document.querySelector(`input[name="hasinsurance"][value="${savedInsurance}"]`);
        if (insuranceRadio) insuranceRadio.checked = true;
    }
    
    // Load vaccine checkboxes
    let savedVaccines = localStorage.getItem('vaccines');
    if (savedVaccines) {
        let vaccineValues = JSON.parse(savedVaccines);
        let vaccineCheckboxes = document.querySelectorAll('input[name="vaccine"]');
        vaccineCheckboxes.forEach(cb => {
            cb.checked = vaccineValues.includes(cb.value);
        });
    }
    
    // Load slider values
    let savedPain = localStorage.getItem('painlevel');
    if (savedPain) {
        let painSlider = document.getElementById('painSlider');
        if (painSlider) {
            painSlider.value = savedPain;
            updateSliderValue('painSlider', 'painValue');
        }
    }
    
    let savedHealth = localStorage.getItem('healthrating');
    if (savedHealth) {
        let healthSlider = document.getElementById('healthSlider');
        if (healthSlider) {
            healthSlider.value = savedHealth;
            updateSliderValue('healthSlider', 'healthValue');
        }
    }
    
    // Load checkboxes
    let savedHipaa = localStorage.getItem('hipaa');
    if (savedHipaa) {
        let hipaaCheckbox = document.getElementById('hipaaCheckbox');
        if (hipaaCheckbox) hipaaCheckbox.checked = savedHipaa === 'true';
        validateHipaa();
    }
    
    let savedEmailsms = localStorage.getItem('emailsms');
    if (savedEmailsms) {
        let emailsms = document.querySelector('input[name="emailsms"]');
        if (emailsms) emailsms.checked = savedEmailsms === 'true';
    }
    
    // Load illnesses (after fetch has loaded them)
    setTimeout(() => {
        let savedIllnesses = localStorage.getItem('illnesses');
        if (savedIllnesses) {
            let illnessValues = JSON.parse(savedIllnesses);
            let illnessCheckboxes = document.querySelectorAll('#illnessesContainer input[type="checkbox"]');
            illnessCheckboxes.forEach(cb => {
                cb.checked = illnessValues.includes(cb.value);
            });
        }
    }, 500);
    
    console.log("Data loaded from local storage");
    checkFormValidity();
}

function clearLocalStorage() {
    localStorage.clear();
    console.log("Local storage cleared");
}

// ===== FETCH API FUNCTIONS (NEW FOR HW4) =====

async function loadStatesFromFile() {
    try {
        const response = await fetch('states.html');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text();
        let stateSelect = document.getElementById('stateSelect');
        if (stateSelect) {
            stateSelect.innerHTML = '<option value="">Select State</option>' + data;
            console.log("States loaded via Fetch API");
        }
    } catch (error) {
        console.error('Error loading states:', error);
        // Fallback states
        let stateSelect = document.getElementById('stateSelect');
        if (stateSelect) {
            stateSelect.innerHTML = '<option value="">Select State</option><option value="TX">Texas</option><option value="CA">California</option><option value="NY">New York</option><option value="FL">Florida</option>';
        }
    }
}

async function loadIllnessesFromFile() {
    try {
        const response = await fetch('illnesses.html');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text();
        let illnessesContainer = document.getElementById('illnessesContainer');
        if (illnessesContainer) {
            illnessesContainer.innerHTML = data;
            // Add onchange events to save to local storage
            let checkboxes = illnessesContainer.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.setAttribute('onchange', 'saveToLocalStorage()');
            });
            console.log("Illnesses loaded via Fetch API");
        }
    } catch (error) {
        console.error('Error loading illnesses:', error);
        // Fallback illnesses
        let illnessesContainer = document.getElementById('illnessesContainer');
        if (illnessesContainer) {
            illnessesContainer.innerHTML = `
                <input type="checkbox" name="illness" value="diabetes" onchange="saveToLocalStorage()"> Diabetes
                <input type="checkbox" name="illness" value="heartdisease" onchange="saveToLocalStorage()"> Heart Disease
                <input type="checkbox" name="illness" value="asthma" onchange="saveToLocalStorage()"> Asthma
                <input type="checkbox" name="illness" value="cancer" onchange="saveToLocalStorage()"> Cancer
                <input type="checkbox" name="illness" value="stroke" onchange="saveToLocalStorage()"> Stroke
                <input type="checkbox" name="illness" value="hypertension" onchange="saveToLocalStorage()"> Hypertension
            `;
        }
    }
}

// ===== REMEMBER ME HANDLER (NEW FOR HW4) =====

function handleRememberMe() {
    let rememberMe = document.getElementById("rememberMe");
    
    if (rememberMe && rememberMe.checked) {
        saveNameCookie();
        saveToLocalStorage();
        alert("Your information will be saved for your next visit (48 hours).");
    } else {
        deleteCookie("patientFirstName");
        clearLocalStorage();
        alert("Your saved information has been cleared.");
        // Also reset welcome message
        let welcomeMessage = document.getElementById("welcomeMessage");
        if (welcomeMessage) {
            welcomeMessage.innerHTML = "Welcome New User! 👋 Please fill out the form below.";
        }
        let notUserBtn = document.getElementById("notUserBtn");
        if (notUserBtn) notUserBtn.style.display = "none";
    }
}

// ===== DATE RANGE =====

function setDateRange() {
    let today = new Date();
    let maxDate = today.toISOString().split('T')[0];
    let minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 120);
    let minDateStr = minDate.toISOString().split('T')[0];
    
    let dobField = document.getElementById('dob');
    if (dobField) {
        dobField.setAttribute('max', maxDate);
        dobField.setAttribute('min', minDateStr);
    }
}

// ===== SLIDER =====

function updateSliderValue(sliderId, displayId) {
    let slider = document.getElementById(sliderId);
    let display = document.getElementById(displayId);
    if (slider && display) {
        display.textContent = slider.value;
    }
}

// ===== SSN FUNCTIONS =====

function formatSSN(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 3 && value.length <= 5) {
        value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 5) {
        value = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5, 9);
    }
    input.value = value;
    validateSSN();
}

function validateSSN() {
    let ssn = getFieldValue('ssn');
    let errorId = 'ssnError';
    
    if (ssn === '') {
        clearError(errorId);
        fieldErrors.ssn = false;
        return true;
    } else if (/^\d{3}-\d{2}-\d{4}$/.test(ssn)) {
        clearError(errorId);
        fieldErrors.ssn = false;
        return true;
    } else {
        showError(errorId, 'Format must be XXX-XX-XXXX');
        fieldErrors.ssn = true;
        return false;
    }
}

// ===== VALIDATION FUNCTIONS =====

function validateFirstName() {
    let firstName = getFieldValue('firstname');
    let errorId = 'firstnameError';
    
    if (firstName === '') {
        showError(errorId, 'First name is required');
        fieldErrors.firstname = true;
    } else if (!/^[A-Za-z'\-\s]+$/.test(firstName)) {
        showError(errorId, 'Only letters, apostrophes and dashes allowed');
        fieldErrors.firstname = true;
    } else {
        clearError(errorId);
        fieldErrors.firstname = false;
        // Save cookie if remember me is checked
        saveNameCookie();
    }
    checkFormValidity();
    return !fieldErrors.firstname;
}

function validateLastName() {
    let lastName = getFieldValue('lastname');
    let errorId = 'lastnameError';
    
    if (lastName === '') {
        showError(errorId, 'Last name is required');
        fieldErrors.lastname = true;
    } else if (!/^[A-Za-z'\-\s]+$/.test(lastName)) {
        showError(errorId, 'Only letters, apostrophes and dashes allowed');
        fieldErrors.lastname = true;
    } else {
        clearError(errorId);
        fieldErrors.lastname = false;
    }
    checkFormValidity();
    return !fieldErrors.lastname;
}

function validateBirthDate() {
    let dob = getFieldValue('dob');
    let errorId = 'dobError';
    
    if (dob === '') {
        showError(errorId, 'Date of birth is required');
        fieldErrors.dob = true;
        checkFormValidity();
        return false;
    }
    
    let birthDate = new Date(dob);
    let today = new Date();
    let minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 120);
    
    if (birthDate > today) {
        showError(errorId, 'Cannot be born in the future');
        fieldErrors.dob = true;
    } else if (birthDate < minDate) {
        showError(errorId, 'Must be under 120 years old');
        fieldErrors.dob = true;
    } else {
        clearError(errorId);
        fieldErrors.dob = false;
    }
    checkFormValidity();
    return !fieldErrors.dob;
}

function validateEmail() {
    let email = getFieldValue('email');
    let errorId = 'emailError';
    
    let emailField = document.getElementById('email');
    if (emailField && email !== '') {
        emailField.value = email.toLowerCase();
        email = email.toLowerCase();
    }
    
    if (email === '') {
        showError(errorId, 'Email is required');
        fieldErrors.email = true;
    } else if (!email.includes('@') || !email.includes('.')) {
        showError(errorId, 'Enter valid email (name@domain.com)');
        fieldErrors.email = true;
    } else {
        clearError(errorId);
        fieldErrors.email = false;
    }
    checkFormValidity();
    return !fieldErrors.email;
}

function validatePhone() {
    let phone = getFieldValue('cellphone');
    let errorId = 'phoneError';
    
    if (phone === '') {
        showError(errorId, 'Cell phone is required');
        fieldErrors.phone = true;
    } else if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(phone)) {
        showError(errorId, 'Use format (XXX) XXX-XXXX');
        fieldErrors.phone = true;
    } else {
        clearError(errorId);
        fieldErrors.phone = false;
    }
    checkFormValidity();
    return !fieldErrors.phone;
}

function validateZip() {
    let zip = getFieldValue('zip');
    let errorId = 'zipError';
    
    if (zip === '') {
        showError(errorId, 'Zip code is required');
        fieldErrors.zip = true;
    } else if (!/^\d{5}$/.test(zip)) {
        showError(errorId, 'Enter 5 digits only');
        fieldErrors.zip = true;
    } else {
        clearError(errorId);
        fieldErrors.zip = false;
    }
    checkFormValidity();
    return !fieldErrors.zip;
}

function validateAddress() {
    let address = getFieldValue('address1');
    let errorId = 'addressError';
    
    if (address === '') {
        showError(errorId, 'Address is required');
        fieldErrors.address = true;
    } else {
        clearError(errorId);
        fieldErrors.address = false;
    }
    checkFormValidity();
    return !fieldErrors.address;
}

function validateCity() {
    let city = getFieldValue('city');
    let errorId = 'cityError';
    
    if (city === '') {
        showError(errorId, 'City is required');
        fieldErrors.city = true;
    } else {
        clearError(errorId);
        fieldErrors.city = false;
    }
    checkFormValidity();
    return !fieldErrors.city;
}

function validateState() {
    let state = document.getElementById('stateSelect');
    let errorId = 'stateError';
    
    if (!state || state.value === '') {
        showError(errorId, 'Select a state');
        fieldErrors.state = true;
    } else {
        clearError(errorId);
        fieldErrors.state = false;
    }
    checkFormValidity();
    return !fieldErrors.state;
}

function validateUsername() {
    let username = getFieldValue('username');
    let errorId = 'usernameError';
    
    if (username === '') {
        showError(errorId, 'Username is required');
        fieldErrors.username = true;
    } else if (username.length < 5) {
        showError(errorId, 'Must be at least 5 characters');
        fieldErrors.username = true;
    } else if (!/^[A-Za-z]/.test(username)) {
        showError(errorId, 'Must start with a letter');
        fieldErrors.username = true;
    } else if (/\s/.test(username)) {
        showError(errorId, 'No spaces allowed');
        fieldErrors.username = true;
    } else {
        clearError(errorId);
        fieldErrors.username = false;
    }
    checkFormValidity();
    return !fieldErrors.username;
}

function validatePassword() {
    let password = getFieldValue('password');
    let confirm = getFieldValue('confirmpassword');
    let username = getFieldValue('username');
    let errorId = 'passwordError';
    let confirmId = 'confirmError';
    
    // Password validation
    if (password === '') {
        showError(errorId, 'Password is required');
        fieldErrors.password = true;
    } else if (password.length < 8) {
        showError(errorId, 'Must be at least 8 characters');
        fieldErrors.password = true;
    } else if (!/[A-Z]/.test(password)) {
        showError(errorId, 'Need an uppercase letter');
        fieldErrors.password = true;
    } else if (!/[a-z]/.test(password)) {
        showError(errorId, 'Need a lowercase letter');
        fieldErrors.password = true;
    } else if (!/[0-9]/.test(password)) {
        showError(errorId, 'Need a number');
        fieldErrors.password = true;
    } else if (!/[!@#$%^&*()\-_+=]/.test(password)) {
        showError(errorId, 'Need a special character (!@#$%^&*)');
        fieldErrors.password = true;
    } else if (password === username && username !== '') {
        showError(errorId, 'Cannot be same as username');
        fieldErrors.password = true;
    } else {
        clearError(errorId);
        fieldErrors.password = false;
    }
    
    // Confirm password validation
    if (confirm === '') {
        showError(confirmId, 'Please confirm your password');
        fieldErrors.confirmpassword = true;
    } else if (password !== confirm) {
        showError(confirmId, 'Passwords do not match');
        fieldErrors.confirmpassword = true;
    } else if (fieldErrors.password === false) {
        clearError(confirmId);
        fieldErrors.confirmpassword = false;
    }
    
    checkFormValidity();
    return !fieldErrors.password && !fieldErrors.confirmpassword;
}

function validateHipaa() {
    let hipaaChecked = document.getElementById('hipaaCheckbox').checked;
    let errorId = 'hipaaError';
    
    if (!hipaaChecked) {
        showError(errorId, 'You must accept HIPAA terms');
        fieldErrors.hipaa = true;
    } else {
        clearError(errorId);
        fieldErrors.hipaa = false;
    }
    checkFormValidity();
    return !fieldErrors.hipaa;
}

// ===== VALIDATE ALL FIELDS (for VALIDATE button) =====

function validateAllFields() {
    console.log("Validating all fields...");
    
    validateFirstName();
    validateLastName();
    validateBirthDate();
    validateEmail();
    validatePhone();
    validateZip();
    validateAddress();
    validateCity();
    validateState();
    validateUsername();
    validatePassword();
    validateSSN();
    validateHipaa();
    
    checkFormValidity();
    
    if (checkFormValidity()) {
        alert("✓ All fields are valid! You can now submit the form.");
    } else {
        alert("✗ Please fix the errors shown in red before submitting.");
    }
}

// ===== REVIEW FUNCTION =====

function displayReview() {
    let reviewHtml = '<table style="width: 100%; border-collapse: collapse;">';
    reviewHtml += '<tr style="background-color: #0066cc; color: white;"><td colspan="2" style="padding: 10px;"><strong>PERSONAL INFORMATION</strong></td></tr>';
    reviewHtml += '<tr><td style="padding: 8px;"><strong>First Name:</strong></td><td style="padding: 8px;">' + getFieldValue('firstname') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 8px;"><strong>Last Name:</strong></td><td style="padding: 8px;">' + getFieldValue('lastname') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 8px;"><strong>Date of Birth:</strong></td><td style="padding: 8px;">' + getFieldValue('dob') + '</td></tr>';
    reviewHtml += '<tr style="background-color: #0066cc; color: white;"><td colspan="2" style="padding: 10px;"><strong>CONTACT INFORMATION</strong></td></tr>';
    reviewHtml += '<tr><td style="padding: 8px;"><strong>Email:</strong></td><td style="padding: 8px;">' + getFieldValue('email') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 8px;"><strong>Phone:</strong></td><td style="padding: 8px;">' + getFieldValue('cellphone') + '</td></tr>';
    reviewHtml += '<tr style="background-color: #0066cc; color: white;"><td colspan="2" style="padding: 10px;"><strong>ACCOUNT INFORMATION</strong></td></tr>';
    reviewHtml += '<tr><td style="padding: 8px;"><strong>Username:</strong></td><td style="padding: 8px;">' + getFieldValue('username') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 8px;"><strong>Password:</strong></td><td style="padding: 8px;">••••••••</td></tr>';
    reviewHtml += '</table>';
    
    let reviewContent = document.getElementById('review-content');
    if (reviewContent) {
        reviewContent.innerHTML = reviewHtml;
    }
    
    let reviewArea = document.getElementById('review-area');
    if (reviewArea) {
        reviewArea.style.display = 'block';
        reviewArea.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== FORM SUBMIT HANDLER =====

function handleFormSubmit(event) {
    if (!checkFormValidity()) {
        event.preventDefault();
        alert('Please fix all errors before submitting.');
        return false;
    }
    return true;
}

// ===== PAGE LOAD =====

window.onload = function() {
    console.log("Homework 4 loaded - New features: Cookies, Local Storage, Fetch API");
    
    // Load states and illnesses via Fetch API
    loadStatesFromFile();
    loadIllnessesFromFile();
    
    // Set date range for DOB
    setDateRange();
    
    // Initialize slider displays
    updateSliderValue('painSlider', 'painValue');
    updateSliderValue('healthSlider', 'healthValue');
    
    // Run initial validation to show errors
    validateFirstName();
    validateLastName();
    validateBirthDate();
    validateEmail();
    validatePhone();
    validateZip();
    validateAddress();
    validateCity();
    validateUsername();
    validatePassword();
    validateHipaa();
    
    // Check for existing cookie and load data
    checkWelcomeCookie();
    
    // Make sure submit button is disabled initially
    let submitBtn = document.getElementById('btn-submit');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.backgroundColor = '#cccccc';
    }
    
    // Attach form submit handler
    let form = document.getElementById('registrationForm');
    if (form) {
        form.onsubmit = handleFormSubmit;
    }
    
    console.log("Homework 4 initialization complete");
};
