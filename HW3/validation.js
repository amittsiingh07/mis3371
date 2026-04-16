/*
Program name: validation.js
Author: Amit Singh
Date created: 03/22/2026
Date last edited: 03/22/2026
Version: 2.0
Description: External JavaScript file for patient registration form validation.
             Handles real-time validation, review functionality, slider updates,
             password matching, and form submission for CarePoint Medical Center.
*/

// ===== GLOBAL VARIABLES =====
let formValid = true;
let validationResults = {};

// ===== HELPER FUNCTIONS =====

function showError(fieldId, message) {
    let errorSpan = document.getElementById(fieldId);
    if (errorSpan) {
        errorSpan.innerHTML = '❌ ' + message;
        errorSpan.style.color = 'red';
        errorSpan.style.fontSize = '11px';
        errorSpan.style.display = 'inline-block';
        errorSpan.style.marginLeft = '5px';
    }
    formValid = false;
}

function clearError(fieldId) {
    let errorSpan = document.getElementById(fieldId);
    if (errorSpan) {
        errorSpan.innerHTML = '';
        errorSpan.style.display = 'none';
    }
}

function getFieldValue(fieldName) {
    let field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        return field.value || '';
    }
    return '';
}

function getSelectedRadio(groupName) {
    let radios = document.querySelectorAll(`[name="${groupName}"]`);
    for (let radio of radios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return 'Not selected';
}

function getSelectedState() {
    let stateSelect = document.querySelector('[name="state"]');
    if (stateSelect && stateSelect.selectedIndex > 0) {
        return stateSelect.options[stateSelect.selectedIndex].text;
    }
    return 'Not selected';
}

function getCheckboxValues(groupName) {
    let checkboxes = document.querySelectorAll(`[name="${groupName}"]:checked`);
    let values = [];
    for (let cb of checkboxes) {
        values.push(cb.value);
    }
    return values.length > 0 ? values.join(', ') : 'None selected';
}

// ===== SLIDER VALUE UPDATE =====

function updateSliderValue(sliderId, displayId) {
    let slider = document.getElementById(sliderId);
    let display = document.getElementById(displayId);
    if (slider && display) {
        display.textContent = slider.value;
    }
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

// ===== VALIDATION FUNCTIONS =====

function validateFirstName() {
    let firstName = getFieldValue('firstname');
    let errorId = 'firstnameError';
    
    if (firstName === '') {
        showError(errorId, 'First name is required');
        return false;
    } else if (firstName.length > 30) {
        showError(errorId, 'First name is too long (max 30 characters)');
        return false;
    } else if (!/^[A-Za-z'\-\s]+$/.test(firstName)) {
        showError(errorId, 'Only letters, apostrophes and dashes allowed');
        return false;
    } else {
        clearError(errorId);
        return true;
    }
}

function validateLastName() {
    let lastName = getFieldValue('lastname');
    let errorId = 'lastnameError';
    
    if (lastName === '') {
        showError(errorId, 'Last name is required');
        return false;
    } else if (lastName.length > 30) {
        showError(errorId, 'Last name is too long (max 30 characters)');
        return false;
    } else if (!/^[A-Za-z0-9'\-\s]+$/.test(lastName)) {
        showError(errorId, 'Only letters, numbers, apostrophes and dashes allowed');
        return false;
    } else {
        clearError(errorId);
        return true;
    }
}

function validateBirthDate() {
    let dob = getFieldValue('dob');
    let errorId = 'dobError';
    
    if (dob === '') {
        showError(errorId, 'Date of birth is required');
        return false;
    }
    
    let birthDate = new Date(dob);
    let today = new Date();
    let minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 120);
    
    if (birthDate > today) {
        showError(errorId, 'Cannot be born in the future!');
        return false;
    } else if (birthDate < minDate) {
        showError(errorId, 'Please verify age (must be under 120 years old)');
        return false;
    } else {
        clearError(errorId);
        return true;
    }
}

function validateEmail() {
    let email = getFieldValue('email');
    let errorId = 'emailError';
    
    if (email === '') {
        showError(errorId, 'Email address is required');
        return false;
    } else if (!email.includes('@')) {
        showError(errorId, 'Email must contain @ symbol');
        return false;
    } else if (!email.includes('.') || email.indexOf('.') < email.indexOf('@')) {
        showError(errorId, 'Email must have valid domain (e.g., domain.com)');
        return false;
    } else {
        clearError(errorId);
        return true;
    }
}

function validatePhone() {
    let phone = getFieldValue('cellphone');
    let errorId = 'phoneError';
    
    if (phone === '') {
        showError(errorId, 'Cell phone is required');
        return false;
    } else if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(phone)) {
        showError(errorId, 'Use format (XXX) XXX-XXXX');
        return false;
    } else {
        clearError(errorId);
        return true;
    }
}

function validateZip() {
    let zip = getFieldValue('zip');
    let errorId = 'zipError';
    
    if (zip === '') {
        showError(errorId, 'Zip code is required');
        return false;
    } else if (!/^\d{5}(-\d{4})?$/.test(zip)) {
        showError(errorId, 'Use 5 digits or ZIP+4 format (12345 or 12345-6789)');
        return false;
    } else {
        clearError(errorId);
        
        // Truncate ZIP+4 to just first 5 digits if needed
        if (zip.includes('-')) {
            let truncatedZip = zip.split('-')[0];
            document.querySelector('[name="zip"]').value = truncatedZip;
        }
        return true;
    }
}

function validateUsername() {
    let username = getFieldValue('username');
    let errorId = 'usernameError';
    
    if (username === '') {
        showError(errorId, 'Username is required');
        return false;
    } else if (username.length < 5) {
        showError(errorId, 'Username must be at least 5 characters');
        return false;
    } else if (username.length > 30) {
        showError(errorId, 'Username is too long (max 30 characters)');
        return false;
    } else if (!/^[A-Za-z]/.test(username)) {
        showError(errorId, 'Username must start with a letter');
        return false;
    } else if (/\s/.test(username)) {
        showError(errorId, 'Username cannot contain spaces');
        return false;
    } else if (!/^[A-Za-z][A-Za-z0-9_\-]+$/.test(username)) {
        showError(errorId, 'Use only letters, numbers, underscore or dash');
        return false;
    } else {
        clearError(errorId);
        
        // Convert to lowercase and redisplay
        let lowercaseUsername = username.toLowerCase();
        if (lowercaseUsername !== username) {
            document.querySelector('[name="username"]').value = lowercaseUsername;
        }
        return true;
    }
}

function validatePassword() {
    let password = getFieldValue('password');
    let confirm = getFieldValue('confirmpassword');
    let username = getFieldValue('username');
    let errorId = 'passwordError';
    
    if (password === '') {
        showError(errorId, 'Password is required');
        return false;
    } else if (password.length < 8) {
        showError(errorId, 'Password must be at least 8 characters');
        return false;
    } else if (password.length > 30) {
        showError(errorId, 'Password is too long (max 30 characters)');
        return false;
    } else if (!/[A-Z]/.test(password)) {
        showError(errorId, 'Need at least one uppercase letter');
        return false;
    } else if (!/[a-z]/.test(password)) {
        showError(errorId, 'Need at least one lowercase letter');
        return false;
    } else if (!/[0-9]/.test(password)) {
        showError(errorId, 'Need at least one number');
        return false;
    } else if (!/[!@#$%^&*()\-_+=]/.test(password)) {
        showError(errorId, 'Need at least one special character (!@#$%^&*)');
        return false;
    } else if (password.includes('"') || password.includes("'")) {
        showError(errorId, 'Quotes are not allowed in password');
        return false;
    } else if (password === username && username !== '') {
        showError(errorId, 'Password cannot be the same as username');
        return false;
    } else {
        clearError(errorId);
        
        // Check if passwords match
        if (password !== confirm && confirm !== '') {
            let confirmError = document.getElementById('confirmError');
            if (confirmError) {
                confirmError.innerHTML = '❌ Passwords do not match';
                confirmError.style.color = 'red';
                confirmError.style.fontSize = '11px';
            }
            return false;
        } else {
            let confirmError = document.getElementById('confirmError');
            if (confirmError) {
                confirmError.innerHTML = '✓ Passwords match';
                confirmError.style.color = 'green';
            }
            return true;
        }
    }
}

// ===== REVIEW FUNCTION =====

function displayReview() {
    let reviewHtml = '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">';
    
    // Personal Information Section
    reviewHtml += '<tr style="background-color: #e6f2ff;"><td colspan="2" style="padding: 10px; font-weight: bold;">PERSONAL INFORMATION</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px; width: 40%;"><strong>First Name:</strong></td><td style="padding: 5px;">' + getFieldValue('firstname') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Middle Initial:</strong></td><td style="padding: 5px;">' + (getFieldValue('mi') || 'N/A') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Last Name:</strong></td><td style="padding: 5px;">' + getFieldValue('lastname') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Date of Birth:</strong></td><td style="padding: 5px;">' + getFieldValue('dob') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Gender:</strong></td><td style="padding: 5px;">' + getSelectedRadio('gender') + '</td></tr>';
    
    // Contact Information Section
    reviewHtml += '<tr style="background-color: #e6f2ff;"><td colspan="2" style="padding: 10px; font-weight: bold;">CONTACT INFORMATION</td></tr>';
    let address = getFieldValue('address1');
    let address2 = getFieldValue('address2');
    if (address2) address += ', ' + address2;
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Address:</strong></td><td style="padding: 5px;">' + address + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>City, State, ZIP:</strong></td><td style="padding: 5px;">' + getFieldValue('city') + ', ' + getSelectedState() + ' ' + getFieldValue('zip') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Cell Phone:</strong></td><td style="padding: 5px;">' + getFieldValue('cellphone') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Email:</strong></td><td style="padding: 5px;">' + getFieldValue('email') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Preferred Contact:</strong></td><td style="padding: 5px;">' + getSelectedRadio('contact') + '</td></tr>';
    
    // Emergency Contact Section
    reviewHtml += '<tr style="background-color: #e6f2ff;"><td colspan="2" style="padding: 10px; font-weight: bold;">EMERGENCY CONTACT</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Contact Name:</strong></td><td style="padding: 5px;">' + getFieldValue('ecname') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Relationship:</strong></td><td style="padding: 5px;">' + getFieldValue('ecrelation') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Phone:</strong></td><td style="padding: 5px;">' + getFieldValue('ecphone') + '</td></tr>';
    
    // Insurance Section
    reviewHtml += '<tr style="background-color: #e6f2ff;"><td colspan="2" style="padding: 10px; font-weight: bold;">INSURANCE INFORMATION</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Has Insurance:</strong></td><td style="padding: 5px;">' + getSelectedRadio('hasinsurance') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Insurance Company:</strong></td><td style="padding: 5px;">' + (getFieldValue('inscompany') || 'Not provided') + '</td></tr>';
    
    // Medical History Section
    reviewHtml += '<tr style="background-color: #e6f2ff;"><td colspan="2" style="padding: 10px; font-weight: bold;">MEDICAL HISTORY</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Current Medications:</strong></td><td style="padding: 5px;">' + (getFieldValue('medications') || 'None listed') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Allergies:</strong></td><td style="padding: 5px;">' + (getFieldValue('allergies') || 'None listed') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Previous Illnesses:</strong></td><td style="padding: 5px;">' + getCheckboxValues('illness') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Immunizations:</strong></td><td style="padding: 5px;">' + getCheckboxValues('vaccine') + '</td></tr>';
    
    // Health Status Section
    reviewHtml += '<tr style="background-color: #e6f2ff;"><td colspan="2" style="padding: 10px; font-weight: bold;">CURRENT HEALTH STATUS</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Reason for Visit:</strong></td><td style="padding: 5px;">' + (getFieldValue('chiefcomplaint') || 'Not provided') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Current Symptoms:</strong></td><td style="padding: 5px;">' + (getFieldValue('symptoms') || 'Not provided') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Pain Level:</strong></td><td style="padding: 5px;">' + getFieldValue('painlevel') + '/10</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Health Rating:</strong></td><td style="padding: 5px;">' + getFieldValue('healthrating') + '/10</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Smoking Status:</strong></td><td style="padding: 5px;">' + getSelectedRadio('smoke') + '</td></tr>';
    
    // Account Section
    reviewHtml += '<tr style="background-color: #e6f2ff;"><td colspan="2" style="padding: 10px; font-weight: bold;">ACCOUNT INFORMATION</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Username:</strong></td><td style="padding: 5px;">' + getFieldValue('username') + '</td></tr>';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>Password:</strong></td><td style="padding: 5px;">••••••••</td></tr>';
    
    // Validation Status
    reviewHtml += '<tr style="background-color: #e6f2ff;"><td colspan="2" style="padding: 10px; font-weight: bold;">VALIDATION STATUS</td></tr>';
    
    // Run validations and show status
    let validations = [
        { name: 'First Name', valid: validateFirstName() },
        { name: 'Last Name', valid: validateLastName() },
        { name: 'Date of Birth', valid: validateBirthDate() },
        { name: 'Email', valid: validateEmail() },
        { name: 'Cell Phone', valid: validatePhone() },
        { name: 'Zip Code', valid: validateZip() },
        { name: 'Username', valid: validateUsername() },
        { name: 'Password', valid: validatePassword() }
    ];
    
    for (let v of validations) {
        let status = v.valid ? '✓ Valid' : '❌ Invalid';
        let statusColor = v.valid ? 'green' : 'red';
        reviewHtml += '<tr><td style="padding: 5px;"><strong>' + v.name + ':</strong></td><td style="padding: 5px; color: ' + statusColor + ';">' + status + '</td></tr>';
    }
    
    // HIPAA checkbox check
    let hipaaChecked = document.getElementById('hipaaCheckbox') ? document.getElementById('hipaaCheckbox').checked : false;
    let hipaaStatus = hipaaChecked ? '✓ Accepted' : '❌ Required';
    let hipaaColor = hipaaChecked ? 'green' : 'red';
    reviewHtml += '<tr><td style="padding: 5px;"><strong>HIPAA Consent:</strong></td><td style="padding: 5px; color: ' + hipaaColor + ';">' + hipaaStatus + '</td></tr>';
    
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

// ===== FORM SUBMISSION VALIDATION =====

function validateForm() {
    formValid = true;
    
    // Call all validation functions
    validateFirstName();
    validateLastName();
    validateBirthDate();
    validateEmail();
    validatePhone();
    validateZip();
    validateUsername();
    validatePassword();
    
    // Check HIPAA checkbox
    let hipaaCheckbox = document.getElementById('hipaaCheckbox');
    if (!hipaaCheckbox.checked) {
        showError('firstnameError', 'Please acknowledge HIPAA privacy practices');
        formValid = false;
    }
    
    if (formValid) {
        displayReview();
        alert('All fields validated successfully! Your registration will now be submitted.');
        return true;
    } else {
        alert('Please fix the errors above before submitting.\nLook for fields marked with ❌');
        return false;
    }
}

// ===== EVENT LISTENERS SETUP =====

function attachValidationEvents() {
    // Add submit event to form
    let form = document.getElementById('registrationForm');
    if (form) {
        form.onsubmit = function(e) {
            if (!validateForm()) {
                e.preventDefault();
                return false;
            }
            return true;
        };
    }
    
    // Set date range for DOB
    setDateRange();
}

// Initialize when page loads
window.onload = function() {
    console.log("Validation script loaded - HW2 Version");
    attachValidationEvents();
    
    // Initialize slider displays
    updateSliderValue('painSlider', 'painValue');
    updateSliderValue('healthSlider', 'healthValue');
    
    // Small reminder for me
    console.log("TODO: Test all validation functions before submitting");
};
