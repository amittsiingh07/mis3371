/*
  Program name: validation.js
  Author: Amit Singh
  Date created: 02/19/2026
  Date last edited: 05/08/2026
  Version: 4.0
  Description: JavaScript validation for patientform.html (Homework 4).
               Includes: real-time field validation, SSN auto-format,
               Fetch API (states + illnesses), Cookies (48-hour expiry),
               Local Storage (save/load/clear), Remember Me logic,
               welcome-back message, and "Not you?" reset feature.
*/


/* ============================================================
   ERROR TRACKING OBJECT
   Each key maps to a required field.
   true  = field has an error (form cannot submit)
   false = field is valid
   The submit button stays disabled until ALL flags are false.
   ============================================================ */

var fieldErrors = {
    firstname:       true,
    lastname:        true,
    dob:             true,
    email:           true,
    phone:           true,
    zip:             true,
    address:         true,
    city:            true,
    state:           true,
    username:        true,
    password:        true,
    confirmpassword: true,
    ssn:             false,   // SSN is optional - starts as valid
    hipaa:           true
};


/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */

// Display a red error message under a field
function showError(fieldId, message) {
    var errorDiv = document.getElementById(fieldId);
    if (errorDiv) {
        errorDiv.innerHTML     = "&#10060; " + message;
        errorDiv.style.color   = "red";
        errorDiv.style.fontSize = "11px";
    }
}

// Display a green success message under a field
function clearError(fieldId) {
    var errorDiv = document.getElementById(fieldId);
    if (errorDiv) {
        errorDiv.innerHTML   = "&#10003; Looks good!";
        errorDiv.style.color = "green";
    }
}

// Check all error flags and enable or disable the submit button
function checkFormValidity() {
    var hasErrors = false;
    for (var field in fieldErrors) {
        if (fieldErrors[field] === true) {
            hasErrors = true;
            console.log("Field still has error:", field);
        }
    }

    var submitBtn = document.getElementById("btn-submit");
    if (submitBtn) {
        submitBtn.disabled = hasErrors;
        if (hasErrors) {
            submitBtn.style.backgroundColor = "#cccccc";
            submitBtn.style.cursor          = "not-allowed";
        } else {
            submitBtn.style.backgroundColor = "#003399";
            submitBtn.style.cursor          = "pointer";
        }
    }
    return !hasErrors;
}

// Return the trimmed value of an input field
function getFieldValue(fieldId) {
    var field = document.getElementById(fieldId);
    return field ? field.value.trim() : "";
}


/* ============================================================
   COOKIE FUNCTIONS  (HW4)
   Cookies store small pieces of data in the browser.
   We use a cookie to remember the user's first name for 48 hours.
   ============================================================ */

// Save a cookie that expires after a given number of hours
function setCookie(name, value, hours) {
    var date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    var expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
    console.log("Cookie saved:", name, "=", value, "(expires in", hours, "hours)");
}

// Read a cookie by name; returns "" if not found
function getCookie(name) {
    var cookieName  = name + "=";
    var allCookies  = document.cookie.split(";");
    for (var i = 0; i < allCookies.length; i++) {
        var c = allCookies[i].trim();
        if (c.indexOf(cookieName) === 0) {
            return c.substring(cookieName.length);
        }
    }
    return "";
}

// Delete a cookie by setting its expiry date in the past
function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    console.log("Cookie deleted:", name);
}


/* ============================================================
   WELCOME MESSAGE  (HW4)
   Runs on page load. Checks for a saved first-name cookie.
   - Cookie found    → "Welcome back, [Name]!" + show "Not you?" button
   - No cookie found → "Welcome New User!"
   ============================================================ */

function checkWelcomeCookie() {
    var firstName      = getCookie("patientFirstName");
    var welcomeMessage = document.getElementById("welcomeMessage");
    var notUserBtn     = document.getElementById("notUserBtn");

    if (firstName && firstName !== "") {
        // Returning user
        welcomeMessage.innerHTML = "Welcome back, " + firstName + "! &#128075;";
        if (notUserBtn) notUserBtn.style.display = "inline-block";
        console.log("Returning user:", firstName);
        // Load their saved form data
        loadAllFormData();
    } else {
        // New user
        welcomeMessage.innerHTML = "Welcome New User! &#128075; Please fill out the form below.";
        if (notUserBtn) notUserBtn.style.display = "none";
        console.log("New user - no cookie found");
    }
}

// Save the first name to a cookie (called inside validateFirstName)
function saveNameCookie() {
    var rememberMe = document.getElementById("rememberMe");
    var firstName  = document.getElementById("firstname").value;

    if (rememberMe && rememberMe.checked && firstName !== "") {
        setCookie("patientFirstName", firstName, 48);

        // Update the welcome message right away
        var welcomeMessage = document.getElementById("welcomeMessage");
        if (welcomeMessage) {
            welcomeMessage.innerHTML = "Welcome back, " + firstName + "! &#128075;";
        }
        // Show the "Not you?" button
        var notUserBtn = document.getElementById("notUserBtn");
        if (notUserBtn) notUserBtn.style.display = "inline-block";
    }
}

// Called by the "Not you?" button - wipes all saved data and resets the form
function clearUserData() {
    console.log("clearUserData() - wiping cookie, local storage, and form");

    deleteCookie("patientFirstName");
    localStorage.clear();

    // Reset the HTML form
    document.getElementById("registrationForm").reset();

    // Reset all error flags
    for (var field in fieldErrors) {
        fieldErrors[field] = true;
    }
    fieldErrors.ssn = false;

    // Clear all error message divs
    document.querySelectorAll(".error-container").forEach(function(div) {
        div.innerHTML = "";
    });

    // Reset sliders
    updateSliderValue("painSlider",   "painValue");
    updateSliderValue("healthSlider", "healthValue");

    // Reset welcome message and hide "Not you?" button
    document.getElementById("welcomeMessage").innerHTML =
        "Welcome New User! &#128075; Please fill out the form below.";
    var notUserBtn = document.getElementById("notUserBtn");
    if (notUserBtn) notUserBtn.style.display = "none";

    checkFormValidity();
    alert("All your saved data has been cleared. You are starting fresh as a new user.");
}


/* ============================================================
   LOCAL STORAGE FUNCTIONS  (HW4)
   Local Storage keeps data in the browser with no expiry.
   Used to save and restore all form field values between visits.
   ============================================================ */

// Save all form data to local storage (only when Remember Me is checked)
function saveToLocalStorage() {
    var rememberMe = document.getElementById("rememberMe");
    if (!rememberMe || !rememberMe.checked) {
        return;   // Do nothing if Remember Me is off
    }

    // Text fields and textareas
    var textFields = [
        "firstname", "lastname", "mi", "dob", "email", "cellphone",
        "address1",  "address2", "city", "zip", "username",
        "homephone", "ecname",   "ecrelation", "ecphone",
        "inscompany","policynum","groupnum",    "pcp",
        "medications","allergies","chiefcomplaint","symptoms"
    ];
    for (var i = 0; i < textFields.length; i++) {
        var el = document.getElementById(textFields[i]);
        if (el) localStorage.setItem(textFields[i], el.value);
    }

    // State dropdown
    var stateSelect = document.getElementById("stateSelect");
    if (stateSelect) localStorage.setItem("state", stateSelect.value);

    // Radio buttons (store the value of the checked one)
    var genderR    = document.querySelector("input[name='gender']:checked");
    var contactR   = document.querySelector("input[name='contact']:checked");
    var smokeR     = document.querySelector("input[name='smoke']:checked");
    var insuranceR = document.querySelector("input[name='hasinsurance']:checked");
    if (genderR)    localStorage.setItem("gender",       genderR.value);
    if (contactR)   localStorage.setItem("contact",      contactR.value);
    if (smokeR)     localStorage.setItem("smoke",        smokeR.value);
    if (insuranceR) localStorage.setItem("hasinsurance", insuranceR.value);

    // Illness checkboxes - save as JSON array of checked values
    var illnessVals = [];
    document.querySelectorAll("#illnessesContainer input[type='checkbox']:checked")
        .forEach(function(cb) { illnessVals.push(cb.value); });
    localStorage.setItem("illnesses", JSON.stringify(illnessVals));

    // Vaccine checkboxes - save as JSON array of checked values
    var vaccineVals = [];
    document.querySelectorAll("input[name='vaccine']:checked")
        .forEach(function(cb) { vaccineVals.push(cb.value); });
    localStorage.setItem("vaccines", JSON.stringify(vaccineVals));

    // Sliders
    var painSlider   = document.getElementById("painSlider");
    var healthSlider = document.getElementById("healthSlider");
    if (painSlider)   localStorage.setItem("painlevel",    painSlider.value);
    if (healthSlider) localStorage.setItem("healthrating", healthSlider.value);

    // Checkboxes (HIPAA and email/SMS consent)
    var hipaaEl   = document.getElementById("hipaaCheckbox");
    var emailsmsEl = document.getElementById("emailsms");
    if (hipaaEl)    localStorage.setItem("hipaa",    hipaaEl.checked);
    if (emailsmsEl) localStorage.setItem("emailsms", emailsmsEl.checked);

    console.log("Form data saved to local storage");
}

/*
  loadAllFormData()
  Fills the form with values saved in local storage.
  Called on page load when a returning user cookie is found.
  NOTE: State and illness data are restored inside loadStatesFromFile()
        and loadIllnessesFromFile() AFTER fetch has populated those elements.
*/
function loadAllFormData() {
    var rememberMe = document.getElementById("rememberMe");
    if (!rememberMe || !rememberMe.checked) {
        console.log("Remember Me unchecked - skipping load");
        return;
    }

    console.log("Loading saved data from local storage...");

    // Restore text fields (only if the field is currently empty)
    var textFields = [
        "firstname", "lastname", "mi", "dob", "email", "cellphone",
        "address1",  "address2", "city", "zip", "username",
        "homephone", "ecname",   "ecrelation", "ecphone",
        "inscompany","policynum","groupnum",    "pcp",
        "medications","allergies","chiefcomplaint","symptoms"
    ];
    for (var i = 0; i < textFields.length; i++) {
        var saved = localStorage.getItem(textFields[i]);
        var el    = document.getElementById(textFields[i]);
        if (saved && el && el.value === "") {
            el.value = saved;
            // Re-run validation so green checkmarks appear
            if (textFields[i] === "firstname")  { validateFirstName(); }
            if (textFields[i] === "lastname")   { validateLastName();  }
            if (textFields[i] === "dob")        { validateBirthDate(); }
            if (textFields[i] === "email")      { validateEmail();     }
            if (textFields[i] === "cellphone")  { validatePhone();     }
            if (textFields[i] === "zip")        { validateZip();       }
            if (textFields[i] === "address1")   { validateAddress();   }
            if (textFields[i] === "city")       { validateCity();      }
            if (textFields[i] === "username")   { validateUsername();  }
        }
    }

    // Restore radio buttons
    var radios = {
        "gender":       localStorage.getItem("gender"),
        "contact":      localStorage.getItem("contact"),
        "smoke":        localStorage.getItem("smoke"),
        "hasinsurance": localStorage.getItem("hasinsurance")
    };
    for (var name in radios) {
        if (radios[name]) {
            var rb = document.querySelector("input[name='" + name + "'][value='" + radios[name] + "']");
            if (rb) rb.checked = true;
        }
    }

    // Restore vaccine checkboxes
    var savedVaccines = localStorage.getItem("vaccines");
    if (savedVaccines) {
        var vaccineVals = JSON.parse(savedVaccines);
        document.querySelectorAll("input[name='vaccine']").forEach(function(cb) {
            cb.checked = vaccineVals.includes(cb.value);
        });
    }

    // Restore sliders
    var savedPain = localStorage.getItem("painlevel");
    if (savedPain) {
        var painSlider = document.getElementById("painSlider");
        if (painSlider) { painSlider.value = savedPain; updateSliderValue("painSlider", "painValue"); }
    }
    var savedHealth = localStorage.getItem("healthrating");
    if (savedHealth) {
        var healthSlider = document.getElementById("healthSlider");
        if (healthSlider) { healthSlider.value = savedHealth; updateSliderValue("healthSlider", "healthValue"); }
    }

    // Restore HIPAA checkbox
    var savedHipaa = localStorage.getItem("hipaa");
    if (savedHipaa) {
        var hipaaEl = document.getElementById("hipaaCheckbox");
        if (hipaaEl) { hipaaEl.checked = (savedHipaa === "true"); validateHipaa(); }
    }

    // Restore email/SMS consent checkbox
    var savedEmailsms = localStorage.getItem("emailsms");
    if (savedEmailsms) {
        var emailsmsEl = document.getElementById("emailsms");
        if (emailsmsEl) emailsmsEl.checked = (savedEmailsms === "true");
    }

    // State and illness checkboxes are restored inside their own fetch functions
    checkFormValidity();
    console.log("Form data loaded from local storage");
}

// Clear all data from local storage
function clearLocalStorage() {
    localStorage.clear();
    console.log("Local storage cleared");
}


/* ============================================================
   REMEMBER ME HANDLER  (HW4)
   Fired when the user checks or unchecks the "Remember Me" box.
   ============================================================ */

function handleRememberMe() {
    var rememberMe = document.getElementById("rememberMe");

    if (rememberMe && rememberMe.checked) {
        saveNameCookie();
        saveToLocalStorage();
        alert("Your information will be saved for 48 hours and filled in automatically next time you visit.");
        console.log("Remember Me checked - data saved");
    } else {
        deleteCookie("patientFirstName");
        clearLocalStorage();
        var welcomeMessage = document.getElementById("welcomeMessage");
        if (welcomeMessage) {
            welcomeMessage.innerHTML = "Welcome New User! &#128075; Please fill out the form below.";
        }
        var notUserBtn = document.getElementById("notUserBtn");
        if (notUserBtn) notUserBtn.style.display = "none";
        alert("Your saved information has been cleared.");
        console.log("Remember Me unchecked - data cleared");
    }
}


/* ============================================================
   FETCH API FUNCTIONS  (HW4)
   fetch() loads content from a file without reloading the page.
   We load state options and illness checkboxes from separate HTML files.
   After loading, we also restore any saved values from local storage.
   ============================================================ */

async function loadStatesFromFile() {
    try {
        var response = await fetch("states.html");
        if (!response.ok) throw new Error("states.html not found - status: " + response.status);

        var data        = await response.text();
        var stateSelect = document.getElementById("stateSelect");
        if (stateSelect) {
            stateSelect.innerHTML = "<option value=''>Select State</option>" + data;
            console.log("States loaded via Fetch API");

            // Restore saved state NOW that the options exist in the dropdown
            var savedState = localStorage.getItem("state");
            if (savedState && savedState !== "") {
                stateSelect.value = savedState;
                if (stateSelect.value === savedState) {
                    validateState();
                    console.log("Saved state restored:", savedState);
                }
            }
        }
    } catch (error) {
        console.error("Fetch error - falling back to hardcoded states:", error);
        // Fallback list if states.html cannot be loaded
        var stateSelect = document.getElementById("stateSelect");
        if (stateSelect) {
            stateSelect.innerHTML =
                "<option value=''>Select State</option>" +
                "<option value='AL'>Alabama</option>"    +
                "<option value='AK'>Alaska</option>"     +
                "<option value='AZ'>Arizona</option>"    +
                "<option value='AR'>Arkansas</option>"   +
                "<option value='CA'>California</option>" +
                "<option value='CO'>Colorado</option>"   +
                "<option value='CT'>Connecticut</option>"+
                "<option value='DE'>Delaware</option>"   +
                "<option value='FL'>Florida</option>"    +
                "<option value='GA'>Georgia</option>"    +
                "<option value='HI'>Hawaii</option>"     +
                "<option value='ID'>Idaho</option>"      +
                "<option value='IL'>Illinois</option>"   +
                "<option value='IN'>Indiana</option>"    +
                "<option value='IA'>Iowa</option>"       +
                "<option value='KS'>Kansas</option>"     +
                "<option value='KY'>Kentucky</option>"   +
                "<option value='LA'>Louisiana</option>"  +
                "<option value='ME'>Maine</option>"      +
                "<option value='MD'>Maryland</option>"   +
                "<option value='MA'>Massachusetts</option>" +
                "<option value='MI'>Michigan</option>"   +
                "<option value='MN'>Minnesota</option>"  +
                "<option value='MS'>Mississippi</option>"+
                "<option value='MO'>Missouri</option>"   +
                "<option value='MT'>Montana</option>"    +
                "<option value='NE'>Nebraska</option>"   +
                "<option value='NV'>Nevada</option>"     +
                "<option value='NH'>New Hampshire</option>" +
                "<option value='NJ'>New Jersey</option>" +
                "<option value='NM'>New Mexico</option>" +
                "<option value='NY'>New York</option>"   +
                "<option value='NC'>North Carolina</option>" +
                "<option value='ND'>North Dakota</option>" +
                "<option value='OH'>Ohio</option>"       +
                "<option value='OK'>Oklahoma</option>"   +
                "<option value='OR'>Oregon</option>"     +
                "<option value='PA'>Pennsylvania</option>" +
                "<option value='RI'>Rhode Island</option>" +
                "<option value='SC'>South Carolina</option>" +
                "<option value='SD'>South Dakota</option>" +
                "<option value='TN'>Tennessee</option>"  +
                "<option value='TX'>Texas</option>"      +
                "<option value='UT'>Utah</option>"       +
                "<option value='VT'>Vermont</option>"    +
                "<option value='VA'>Virginia</option>"   +
                "<option value='WA'>Washington</option>" +
                "<option value='WV'>West Virginia</option>" +
                "<option value='WI'>Wisconsin</option>"  +
                "<option value='WY'>Wyoming</option>";

            // Still try to restore saved state from the fallback list
            var savedState = localStorage.getItem("state");
            if (savedState && savedState !== "") {
                stateSelect.value = savedState;
                if (stateSelect.value === savedState) validateState();
            }
        }
    }
}

async function loadIllnessesFromFile() {
    try {
        var response = await fetch("illnesses.html");
        if (!response.ok) throw new Error("illnesses.html not found - status: " + response.status);

        var data               = await response.text();
        var illnessesContainer = document.getElementById("illnessesContainer");
        if (illnessesContainer) {
            illnessesContainer.innerHTML = data;

            // Add onchange handler to every loaded checkbox so data gets saved
            illnessesContainer.querySelectorAll("input[type='checkbox']").forEach(function(cb) {
                cb.setAttribute("onchange", "saveToLocalStorage()");
            });
            console.log("Illnesses loaded via Fetch API");

            // Restore saved illness selections NOW that checkboxes exist
            var savedIllnesses = localStorage.getItem("illnesses");
            if (savedIllnesses) {
                var illnessVals = JSON.parse(savedIllnesses);
                illnessesContainer.querySelectorAll("input[type='checkbox']").forEach(function(cb) {
                    cb.checked = illnessVals.includes(cb.value);
                });
                console.log("Saved illnesses restored");
            }
        }
    } catch (error) {
        console.error("Fetch error - falling back to hardcoded illnesses:", error);
        var illnessesContainer = document.getElementById("illnessesContainer");
        if (illnessesContainer) {
            illnessesContainer.innerHTML =
                "<input type='checkbox' name='illness' value='diabetes'     onchange='saveToLocalStorage()'> Diabetes &nbsp;" +
                "<input type='checkbox' name='illness' value='heartdisease' onchange='saveToLocalStorage()'> Heart Disease &nbsp;" +
                "<input type='checkbox' name='illness' value='asthma'       onchange='saveToLocalStorage()'> Asthma &nbsp;" +
                "<input type='checkbox' name='illness' value='cancer'       onchange='saveToLocalStorage()'> Cancer &nbsp;" +
                "<input type='checkbox' name='illness' value='stroke'       onchange='saveToLocalStorage()'> Stroke &nbsp;" +
                "<input type='checkbox' name='illness' value='hypertension' onchange='saveToLocalStorage()'> Hypertension &nbsp;" +
                "<input type='checkbox' name='illness' value='arthritis'    onchange='saveToLocalStorage()'> Arthritis &nbsp;" +
                "<input type='checkbox' name='illness' value='depression'   onchange='saveToLocalStorage()'> Depression";

            // Restore saved illness selections from the fallback list too
            var savedIllnesses = localStorage.getItem("illnesses");
            if (savedIllnesses) {
                var illnessVals = JSON.parse(savedIllnesses);
                illnessesContainer.querySelectorAll("input[type='checkbox']").forEach(function(cb) {
                    cb.checked = illnessVals.includes(cb.value);
                });
            }
        }
    }
}


/* ============================================================
   DATE RANGE
   Sets the min and max allowed dates on the Date of Birth field.
   ============================================================ */

function setDateRange() {
    var today   = new Date();
    var maxDate = today.toISOString().split("T")[0];   // today = max
    var minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 120);
    var minDateStr = minDate.toISOString().split("T")[0];  // 120 years ago = min

    var dobField = document.getElementById("dob");
    if (dobField) {
        dobField.setAttribute("max", maxDate);
        dobField.setAttribute("min", minDateStr);
    }
}


/* ============================================================
   SLIDER HELPER
   Updates the number displayed next to each slider as it moves.
   ============================================================ */

function updateSliderValue(sliderId, displayId) {
    var slider  = document.getElementById(sliderId);
    var display = document.getElementById(displayId);
    if (slider && display) {
        display.textContent = slider.value;
    }
}


/* ============================================================
   SSN AUTO-FORMAT
   Formats the SSN field as XXX-XX-XXXX while the user types.
   ============================================================ */

function formatSSN(input) {
    // Strip everything except digits
    var digits = input.value.replace(/\D/g, "");

    // Re-insert dashes in the right places
    if (digits.length > 5) {
        input.value = digits.slice(0, 3) + "-" + digits.slice(3, 5) + "-" + digits.slice(5, 9);
    } else if (digits.length > 3) {
        input.value = digits.slice(0, 3) + "-" + digits.slice(3);
    } else {
        input.value = digits;
    }

    validateSSN();
    saveToLocalStorage();
}

function validateSSN() {
    var ssn     = getFieldValue("ssn");
    var errorId = "ssnError";

    if (ssn === "") {
        // SSN is optional - blank is fine
        clearError(errorId);
        fieldErrors.ssn = false;
        return true;
    } else if (/^\d{3}-\d{2}-\d{4}$/.test(ssn)) {
        clearError(errorId);
        fieldErrors.ssn = false;
        return true;
    } else {
        showError(errorId, "Format must be XXX-XX-XXXX");
        fieldErrors.ssn = true;
        return false;
    }
}


/* ============================================================
   FIELD VALIDATION FUNCTIONS
   Each function validates one field, updates fieldErrors,
   saves to local storage, and rechecks the submit button.
   ============================================================ */

function validateFirstName() {
    var firstName = getFieldValue("firstname");
    var errorId   = "firstnameError";

    if (firstName === "") {
        showError(errorId, "First name is required");
        fieldErrors.firstname = true;
    } else if (!/^[A-Za-z'\-\s]+$/.test(firstName)) {
        showError(errorId, "Only letters, apostrophes, and dashes allowed");
        fieldErrors.firstname = true;
    } else {
        clearError(errorId);
        fieldErrors.firstname = false;
        saveNameCookie();    // Update cookie with the new first name
    }
    saveToLocalStorage();
    checkFormValidity();
    return !fieldErrors.firstname;
}

function validateLastName() {
    var lastName = getFieldValue("lastname");
    var errorId  = "lastnameError";

    if (lastName === "") {
        showError(errorId, "Last name is required");
        fieldErrors.lastname = true;
    } else if (!/^[A-Za-z'\-\s]+$/.test(lastName)) {
        showError(errorId, "Only letters, apostrophes, and dashes allowed");
        fieldErrors.lastname = true;
    } else {
        clearError(errorId);
        fieldErrors.lastname = false;
    }
    saveToLocalStorage();
    checkFormValidity();
    return !fieldErrors.lastname;
}

function validateBirthDate() {
    var dob     = getFieldValue("dob");
    var errorId = "dobError";

    if (dob === "") {
        showError(errorId, "Date of birth is required");
        fieldErrors.dob = true;
        checkFormValidity();
        return false;
    }

    var birthDate = new Date(dob);
    var today     = new Date();
    var minDate   = new Date();
    minDate.setFullYear(today.getFullYear() - 120);

    if (birthDate > today) {
        showError(errorId, "Date of birth cannot be in the future");
        fieldErrors.dob = true;
    } else if (birthDate < minDate) {
        showError(errorId, "Must be under 120 years old");
        fieldErrors.dob = true;
    } else {
        clearError(errorId);
        fieldErrors.dob = false;
    }
    saveToLocalStorage();
    checkFormValidity();
    return !fieldErrors.dob;
}

function validateEmail() {
    var email   = getFieldValue("email");
    var errorId = "emailError";

    // Auto-convert email to lowercase as the user types
    var emailField = document.getElementById("email");
    if (emailField && email !== "") {
        emailField.value = email.toLowerCase();
        email = email.toLowerCase();
    }

    if (email === "") {
        showError(errorId, "Email address is required");
        fieldErrors.email = true;
    } else if (!email.includes("@") || !email.includes(".")) {
        showError(errorId, "Enter a valid email (name@domain.com)");
        fieldErrors.email = true;
    } else {
        clearError(errorId);
        fieldErrors.email = false;
    }
    saveToLocalStorage();
    checkFormValidity();
    return !fieldErrors.email;
}

function validatePhone() {
    var phone   = getFieldValue("cellphone");
    var errorId = "phoneError";

    if (phone === "") {
        showError(errorId, "Cell phone number is required");
        fieldErrors.phone = true;
    } else if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(phone)) {
        showError(errorId, "Use format (XXX) XXX-XXXX");
        fieldErrors.phone = true;
    } else {
        clearError(errorId);
        fieldErrors.phone = false;
    }
    saveToLocalStorage();
    checkFormValidity();
    return !fieldErrors.phone;
}

function validateZip() {
    var zip     = getFieldValue("zip");
    var errorId = "zipError";

    if (zip === "") {
        showError(errorId, "Zip code is required");
        fieldErrors.zip = true;
    } else if (!/^\d{5}$/.test(zip)) {
        showError(errorId, "Enter a 5-digit zip code");
        fieldErrors.zip = true;
    } else {
        clearError(errorId);
        fieldErrors.zip = false;
    }
    saveToLocalStorage();
    checkFormValidity();
    return !fieldErrors.zip;
}

function validateAddress() {
    var address = getFieldValue("address1");
    var errorId = "addressError";

    if (address === "") {
        showError(errorId, "Address is required");
        fieldErrors.address = true;
    } else {
        clearError(errorId);
        fieldErrors.address = false;
    }
    saveToLocalStorage();
    checkFormValidity();
    return !fieldErrors.address;
}

function validateCity() {
    var city    = getFieldValue("city");
    var errorId = "cityError";

    if (city === "") {
        showError(errorId, "City is required");
        fieldErrors.city = true;
    } else {
        clearError(errorId);
        fieldErrors.city = false;
    }
    saveToLocalStorage();
    checkFormValidity();
    return !fieldErrors.city;
}

function validateState() {
    var stateSelect = document.getElementById("stateSelect");
    var errorId     = "stateError";

    if (!stateSelect || stateSelect.value === "") {
        showError(errorId, "Please select a state");
        fieldErrors.state = true;
    } else {
        clearError(errorId);
        fieldErrors.state = false;
    }
    checkFormValidity();
    return !fieldErrors.state;
}

function validateUsername() {
    var username = getFieldValue("username");
    var errorId  = "usernameError";

    if (username === "") {
        showError(errorId, "Username is required");
        fieldErrors.username = true;
    } else if (username.length < 5) {
        showError(errorId, "Must be at least 5 characters");
        fieldErrors.username = true;
    } else if (!/^[A-Za-z]/.test(username)) {
        showError(errorId, "Must start with a letter");
        fieldErrors.username = true;
    } else if (/\s/.test(username)) {
        showError(errorId, "No spaces allowed");
        fieldErrors.username = true;
    } else {
        clearError(errorId);
        fieldErrors.username = false;
    }
    saveToLocalStorage();
    checkFormValidity();
    return !fieldErrors.username;
}

function validatePassword() {
    var password = getFieldValue("password");
    var confirm  = getFieldValue("confirmpassword");
    var username = getFieldValue("username");
    var errorId  = "passwordError";
    var confirmId= "confirmError";

    // --- Password rules ---
    if (password === "") {
        showError(errorId, "Password is required");
        fieldErrors.password = true;
    } else if (password.length < 8) {
        showError(errorId, "Must be at least 8 characters");
        fieldErrors.password = true;
    } else if (!/[A-Z]/.test(password)) {
        showError(errorId, "Must include at least one uppercase letter");
        fieldErrors.password = true;
    } else if (!/[a-z]/.test(password)) {
        showError(errorId, "Must include at least one lowercase letter");
        fieldErrors.password = true;
    } else if (!/[0-9]/.test(password)) {
        showError(errorId, "Must include at least one number");
        fieldErrors.password = true;
    } else if (!/[!@#$%^&*()\-_+=]/.test(password)) {
        showError(errorId, "Must include a special character (!@#$%^&*)");
        fieldErrors.password = true;
    } else if (username !== "" && password === username) {
        showError(errorId, "Password cannot be the same as your username");
        fieldErrors.password = true;
    } else {
        clearError(errorId);
        fieldErrors.password = false;
    }

    // --- Confirm password ---
    if (confirm === "") {
        showError(confirmId, "Please confirm your password");
        fieldErrors.confirmpassword = true;
    } else if (password !== confirm) {
        showError(confirmId, "Passwords do not match");
        fieldErrors.confirmpassword = true;
    } else if (fieldErrors.password === false) {
        clearError(confirmId);
        fieldErrors.confirmpassword = false;
    }

    checkFormValidity();
    return !fieldErrors.password && !fieldErrors.confirmpassword;
}

function validateHipaa() {
    var hipaaChecked = document.getElementById("hipaaCheckbox").checked;
    var errorId      = "hipaaError";

    if (!hipaaChecked) {
        showError(errorId, "You must acknowledge the HIPAA privacy practices");
        fieldErrors.hipaa = true;
    } else {
        clearError(errorId);
        fieldErrors.hipaa = false;
    }
    checkFormValidity();
    return !fieldErrors.hipaa;
}


/* ============================================================
   VALIDATE ALL FIELDS  (called by the VALIDATE FORM button)
   ============================================================ */

function validateAllFields() {
    console.log("Running full form validation...");

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

    if (checkFormValidity()) {
        alert("All fields are valid! You may now submit the form.");
    } else {
        alert("Please fix the errors shown in red before submitting.");
    }
}


/* ============================================================
   REVIEW FUNCTION  (called by the REVIEW INFORMATION button)
   Builds a summary table of the entered data and shows it below the form.
   ============================================================ */

function displayReview() {
    var html = "<table style='width:100%; border-collapse:collapse;'>";

    html += "<tr style='background-color:#0066cc; color:white;'>" +
            "<td colspan='2' style='padding:10px;'><strong>PERSONAL INFORMATION</strong></td></tr>";
    html += "<tr><td style='padding:8px; width:40%;'><strong>First Name:</strong></td>" +
            "<td style='padding:8px;'>" + getFieldValue("firstname") + "</td></tr>";
    html += "<tr><td style='padding:8px;'><strong>Last Name:</strong></td>" +
            "<td style='padding:8px;'>" + getFieldValue("lastname") + "</td></tr>";
    html += "<tr><td style='padding:8px;'><strong>Date of Birth:</strong></td>" +
            "<td style='padding:8px;'>" + getFieldValue("dob") + "</td></tr>";

    html += "<tr style='background-color:#0066cc; color:white;'>" +
            "<td colspan='2' style='padding:10px;'><strong>CONTACT INFORMATION</strong></td></tr>";
    html += "<tr><td style='padding:8px;'><strong>Email:</strong></td>" +
            "<td style='padding:8px;'>" + getFieldValue("email") + "</td></tr>";
    html += "<tr><td style='padding:8px;'><strong>Cell Phone:</strong></td>" +
            "<td style='padding:8px;'>" + getFieldValue("cellphone") + "</td></tr>";
    html += "<tr><td style='padding:8px;'><strong>Address:</strong></td>" +
            "<td style='padding:8px;'>" + getFieldValue("address1") + "</td></tr>";
    html += "<tr><td style='padding:8px;'><strong>City:</strong></td>" +
            "<td style='padding:8px;'>" + getFieldValue("city") + "</td></tr>";

    html += "<tr style='background-color:#0066cc; color:white;'>" +
            "<td colspan='2' style='padding:10px;'><strong>ACCOUNT INFORMATION</strong></td></tr>";
    html += "<tr><td style='padding:8px;'><strong>Username:</strong></td>" +
            "<td style='padding:8px;'>" + getFieldValue("username") + "</td></tr>";
    html += "<tr><td style='padding:8px;'><strong>Password:</strong></td>" +
            "<td style='padding:8px;'>&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;</td></tr>";

    html += "</table>";

    var reviewContent = document.getElementById("review-content");
    if (reviewContent) reviewContent.innerHTML = html;

    var reviewArea = document.getElementById("review-area");
    if (reviewArea) {
        reviewArea.style.display = "block";
        reviewArea.scrollIntoView({ behavior: "smooth" });
    }
}


/* ============================================================
   FORM SUBMIT HANDLER
   Final check before the form is submitted.
   ============================================================ */

function handleFormSubmit(event) {
    if (!checkFormValidity()) {
        event.preventDefault();
        alert("Please fix all errors before submitting.");
        return false;
    }
    return true;
}


/* ============================================================
   PAGE LOAD  (runs automatically when the page finishes loading)
   ============================================================ */

window.onload = function() {
    console.log("HW4 page loaded - initializing...");

    // 1. Load states and illnesses via Fetch API
    //    These functions also restore saved state/illness values from local storage
    loadStatesFromFile();
    loadIllnessesFromFile();

    // 2. Set the min/max range on the date of birth field
    setDateRange();

    // 3. Initialize slider display values
    updateSliderValue("painSlider",   "painValue");
    updateSliderValue("healthSlider", "healthValue");

    // 4. Run all validations once so error messages appear immediately
    //    (This also marks all empty required fields as errors,
    //     ensuring the submit button starts as disabled)
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

    // 5. Check for a returning user cookie and load saved form data
    //    (State and illnesses are handled inside their fetch functions above)
    checkWelcomeCookie();

    // 6. Attach the submit handler to the form
    var form = document.getElementById("registrationForm");
    if (form) form.onsubmit = handleFormSubmit;

    console.log("HW4 initialization complete");
};
