/* ==========================================================================
   contact.js - Contact form validation
   The form checks three things before it accepts a message:
   1. No field is empty
   2. The email address has a valid format
   3. The phone number contains only digits
   There is no server behind this site, so once the form is valid the visitor
   chooses how to send it: WhatsApp or their email app.
   ========================================================================== */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '2349025489850';
  var EMAIL = 'betterdayseducation.impact@gmail.com';

  var form = document.getElementById('contact-form');
  if (!form) return; // not on the contact page

  var fields = {
    name: document.getElementById('contact-name'),
    email: document.getElementById('contact-email'),
    phone: document.getElementById('contact-phone'),
    message: document.getElementById('contact-message')
  };
  var summary = document.getElementById('form-summary');
  var success = document.getElementById('form-success');
  var successName = document.getElementById('success-name');
  var whatsappLink = document.getElementById('send-whatsapp');
  var emailLink = document.getElementById('send-email');

  // --- Validation rules (each returns an error message, or '' when the value is fine) ---
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var digitsOnly = /^\d+$/;

  var rules = {
    name: function (value) {
      return value === '' ? 'Enter your name.' : '';
    },
    email: function (value) {
      if (value === '') return 'Enter your email address.';
      return emailPattern.test(value) ? '' : 'Enter a valid email address, for example name@example.com.';
    },
    phone: function (value) {
      if (value === '') return 'Enter your phone number.';
      return digitsOnly.test(value) ? '' : 'Use digits only. Remove spaces, dashes and the + sign.';
    },
    message: function (value) {
      return value === '' ? 'Write a short message.' : '';
    }
  };

  function errorEl(key) {
    return document.getElementById('contact-' + key + '-error');
  }

  // Checks one field, shows or clears its error, and returns true when valid.
  function validateField(key) {
    var input = fields[key];
    var message = rules[key](input.value.trim());
    errorEl(key).textContent = message;
    if (message) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
    return message === '';
  }

  function validateAll() {
    var firstInvalid = null;
    Object.keys(fields).forEach(function (key) {
      if (!validateField(key) && !firstInvalid) firstInvalid = fields[key];
    });
    return firstInvalid; // null means everything is valid
  }

  // --- Building the "send it" links -------------------------------------------------
  function composeMessage() {
    return 'Hello Better Days Education,\n\n' + fields.message.value.trim() +
      '\n\nName: ' + fields.name.value.trim() +
      '\nEmail: ' + fields.email.value.trim() +
      '\nPhone: ' + fields.phone.value.trim();
  }

  function showSuccess() {
    var text = composeMessage();
    successName.textContent = fields.name.value.trim();
    whatsappLink.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
    emailLink.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Enquiry from ' + fields.name.value.trim()) +
      '&body=' + encodeURIComponent(text);
    success.hidden = false;
    success.focus();
  }

  // --- Events --------------------------------------------------------------------------
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    success.hidden = true;

    var firstInvalid = validateAll();
    if (firstInvalid) {
      summary.hidden = false;
      firstInvalid.focus();
      return;
    }
    summary.hidden = true;
    showSuccess();
  });

  // Instant feedback: check a field when the visitor leaves it,
  // then keep checking as they type to fix a mistake.
  Object.keys(fields).forEach(function (key) {
    fields[key].addEventListener('blur', function () {
      if (fields[key].value !== '' || fields[key].hasAttribute('aria-invalid')) validateField(key);
    });
    fields[key].addEventListener('input', function () {
      if (fields[key].hasAttribute('aria-invalid')) validateField(key);
      success.hidden = true;
    });
  });

  form.addEventListener('reset', function () {
    Object.keys(fields).forEach(function (key) {
      errorEl(key).textContent = '';
      fields[key].removeAttribute('aria-invalid');
    });
    summary.hidden = true;
    success.hidden = true;
  });
})();
