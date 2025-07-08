// JavaScript for address-form.html
// Handles country/state/city population and form validation

// Example API endpoints (replace with your real endpoints)
const API_COUNTRIES = 'https://restcountries.com/v3.1/all?fields=name';
const API_STATES = 'https://countriesnow.space/api/v0.1/countries/states';
const API_CITIES = 'https://countriesnow.space/api/v0.1/countries/state/cities';

function fetchCountries() {
  $.get(API_COUNTRIES, function(data) {
    const $country = $('#country');
    $country.empty().append('<option value="">Select Country</option>');
    data.sort((a, b) => a.name.common.localeCompare(b.name.common));
    data.forEach(country => {
      $country.append(`<option value="${country.name.common}">${country.name.common}</option>`);
    });
    $country.prop('disabled', false);
  });
}

function fetchStates(country) {
  const $state = $('#state');
  const $city = $('#city');
  $state.empty().append('<option value="">Loading...</option>').prop('disabled', true);
  $city.empty().append('<option value="">Select State First</option>').prop('disabled', true);
  $.ajax({
    url: API_STATES,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ country }),
    success: function(res) {
      $state.empty().append('<option value="">Select State</option>');
      if (res.data && res.data.states) {
        res.data.states.forEach(state => {
          $state.append(`<option value="${state.name}">${state.name}</option>`);
        });
        $state.prop('disabled', false);
      }
    }
  });
}

function fetchCities(country, state) {
  const $city = $('#city');
  $city.empty().append('<option value="">Loading...</option>').prop('disabled', true);
  $.ajax({
    url: API_CITIES,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ country, state }),
    success: function(res) {
      $city.empty().append('<option value="">Select City</option>');
      if (res.data) {
        res.data.forEach(city => {
          $city.append(`<option value="${city}">${city}</option>`);
        });
        $city.prop('disabled', false);
      }
    }
  });
}

$(document).ready(function () {
  fetchCountries();
  $('#country').on('change', function() {
    const country = $(this).val();
    if (country) {
      fetchStates(country);
    } else {
      $('#state').empty().append('<option value="">Select Country First</option>').prop('disabled', true);
      $('#city').empty().append('<option value="">Select State First</option>').prop('disabled', true);
    }
  });
  $('#state').on('change', function() {
    const country = $('#country').val();
    const state = $(this).val();
    if (country && state) {
      fetchCities(country, state);
    } else {
      $('#city').empty().append('<option value="">Select State First</option>').prop('disabled', true);
    }
  });
  // Initialize Select2 after dynamic population
  $('#country, #state, #city').select2({
    theme: 'bootstrap-5',
    width: '100%'
  });
});

function showError(input, message) {
  const $input = $(input);
  $input.addClass('is-invalid');
  if ($input.next('.invalid-feedback').length === 0) {
    $input.after(`<div class="invalid-feedback">${message}</div>`);
  } else {
    $input.next('.invalid-feedback').text(message);
  }
}
function clearError(input) {
  const $input = $(input);
  $input.removeClass('is-invalid');
  $input.next('.invalid-feedback').remove();
}

function submitForm() {
  let valid = true;
  // Clear previous errors
  clearError('#country');
  clearError('#state');
  clearError('#city');
  clearError('#zip');
  clearError('#address1');

  if (!$('#country').val()) {
    showError('#country', 'Country is required.');
    valid = false;
  }
  if (!$('#state').val()) {
    showError('#state', 'State is required.');
    valid = false;
  }
  if (!$('#city').val()) {
    showError('#city', 'City is required.');
    valid = false;
  }
  if (!$('#zip').val()) {
    showError('#zip', 'ZIP / Postal Code is required.');
    valid = false;
  }
  if (!$('#address1').val()) {
    showError('#address1', 'Address Line 1 is required.');
    valid = false;
  }
  if (!valid) return;
  const data = {
    country: $('#country').val(),
    state: $('#state').val(),
    city: $('#city').val(),
    postalCode: $('#zip').val(),
    addressLine1: $('#address1').val(),
    addressLine2: $('#address2').val(),
  };
  if (window.onAddressFormSubmitChannel) {
    window.onAddressFormSubmitChannel.postMessage(JSON.stringify(data));
  } else {
    alert('Sending to Flutter: ' + JSON.stringify(data));
  }
}
// Remove error on input/select change
$('#country, #state, #city, #zip, #address1').on('change input', function() {
  clearError(this);
});
