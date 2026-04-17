/*
Program name: validation.js
Author: Amit Singh
Date created: 04/16/2026
Date last edited: 04/16/2026
Version: 3.0
Description: External JavaScript file for patient registration form validation (Homework 3).
             Handles REAL-TIME validation on input, error tracking, submit button enable/disable,
             SSN auto-formatting, email lowercase conversion, and form submission.
*/

// ===== ERROR TRACKING OBJECT =====
// Each field has a true/false flag for errors
// true = has error, false = no error
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
    ssn: false,  // optional field, so starts as false (no error)
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
            break;
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

// ===== DATE RANGE CALCULATION =====

function setDateRange() {
    let today = new Date();
    
    // Set max date to today
    let maxDate = today.toISOString().split('T')[0];
    
    // Set min date to 120 years ago
    let minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 120);
    let minDateStr = minDate.toISOString().split('T')[0];
    
    let dobField = document.getElementById('dob');
    if (dobField) {
        dobField.setAttribute('max', maxDate);
        dobField.setAttribute('min', minDateStr);
    }
}

// ===== SLIDER VALUE UPDATE =====

function updateSliderValue(sliderId, displayId) {
    let slider = document.getElementById(sliderId);
    let display = document.getElementById(displayId);
    if (slider && display) {
        display.textContent = slider.value;
    }
}

// ===== SSN AUTO-FORMATTING (NEW FOR HW3) =====

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
        showError(errorId, 'Format must be XXX-XX-XXXX (9 digits with dashes)');
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
    } else if (firstName.length > 30) {
        showError(errorId, 'First name is too long (max 30 characters)');
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
    } else if (lastName.length > 30) {
        showError(errorId, 'Last name is too long (max 30 characters)');
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
        showError(errorId, 'Cannot be born in the future!');
        fieldErrors.dob = true;
    } else if (birthDate < minDate) {
        showError(errorId, 'Please verify age (must be under 120 years old)');
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
    
    // Convert to lowercase automatically
    let emailField = document.getElementById('email');
    if (emailField && email !== '') {
        emailField.value = email.toLowerCase();
        email = email.toLowerCase();
    }
    
    if (email === '') {
        showError(errorId, 'Email address is required');
        fieldErrors.email = true;
    } else if (!email.includes('@')) {
        showError(errorId, 'Email must contain @ symbol');
        fieldErrors.email = true;
    } else if (!email.includes('.') || email.indexOf('.') < email.indexOf('@')) {
        showError(errorId, 'Email must have valid domain (e.g., domain.com)');
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
        showError(errorId, 'Use 5 digits only');
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
    } else if (address.length < 2) {
        showError(errorId, 'Address must be at least 2 characters');
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
    } else if (city.length < 2) {
        showError(errorId, 'City must be at least 2 characters');
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
        showError(errorId, 'Please select a state');
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
        showError(errorId, 'Username must be at least 5 characters');
        fieldErrors.username = true;
    } else if (username.length > 30) {
        showError(errorId, 'Username is too long (max 30 characters)');
        fieldErrors.username = true;
    } else if (!/^[A-Za-z]/.test(username)) {
        showError(errorId, 'Username must start with a letter');
        fieldErrors.username = true;
    } else if (/\s/.test(username)) {
        showError(errorId, 'Username cannot contain spaces');
        fieldErrors.username = true;
    } else if (!/^[A-Za-z][A-Za-z0-9_\-]+$/.test(username)) {
        showError(errorId, 'Use only letters, numbers, underscore or dash');
        fieldErrors.username = true;
    } else {
        clearError(errorId);
        fieldErrors.username = false;
