$(document).ready(function() {
    // Function to load the Personal Details form
    function loadPersonalDetails() {
        // Clear the content area
        $('.content-block').empty();
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email');
        // Create the form
        const personalDetailsForm = `
      <h2>Edit Personal Details</h2>
      <form id="personal-details-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" class="form-control" id="username" value="${storedUsername}">
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" class="form-control" id="email" value="${storedEmail}">
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" class="form-control" id="password" placeholder="New Password">
        </div>
        <button type="submit" class="btn btn-primary">Save</button>
      </form>
    `;

        // Append the form to the content area
        $('.content-block').append(personalDetailsForm);
    }

    // Click event for the "Personal Details" tab
    $('#personal-details-tab').click(function() {
        loadPersonalDetails();
    });

    // Click event for other tabs (replace with actual tab IDs)
    $('#purchase-history-tab').click(function() {
        // Clear the content area or load other content
        $('.content-block').empty();
    });

    $('#bonuses-tab').click(function() {
        // Clear the content area or load other content
        $('.content-block').empty();
    });

    $('#payment-methods-tab').click(function() {
        // Clear the content area or load other content
        $('.content-block').empty();
    });

    // Initially load Personal Details when the page loads
    loadPersonalDetails();
});
