/*
Program name: validation.js
Author: Amit Singh
Date created: 04/16/2026
Date last edited: 04/16/2026
Version: 3.0
Description: External JavaScript file for patient registration form validation (Homework 3).
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
            console.log("Field with error:", field); // Debug - shows which field is causing error
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
    let state = document.getElementById('state');
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
    alert("Review feature - shows all form data");
    // Your existing displayReview code here
}

// ===== PAGE LOAD =====

window.onload = function() {
    console.log("Homework 3 loaded - Submit button should be disabled");
    
    setDateRange();
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
    validateState();
    validateUsername();
    validatePassword();
    validateHipaa();
    
    // Make sure submit button is disabled
    let submitBtn = document.getElementById('btn-submit');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.backgroundColor = '#cccccc';
    }
    
    console.log("Initial validation complete. Submit button should be gray.");
};
