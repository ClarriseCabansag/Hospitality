$(document).ready(function() {
  // Initialize DataTable with custom buttons
  let usersTable = $('#manage_users_table').DataTable({
    dom: '<"row mb-3"<"col-sm-6"l><"col-sm-6 text-end"f>>Brtip', // Place buttons above the table
    buttons: [
      {
        extend: 'copy',
        className: 'custom_button',
        text: 'Copy',
      },
      {
        extend: 'csv',
        className: 'custom_button',
        text: 'CSV',
      },
      {
        extend: 'excel',
        className: 'custom_button',
        text: 'Excel',
      },
      {
        extend: 'pdf',
        className: 'custom_button',
        text: 'PDF',
      },
      {
        extend: 'print',
        className: 'custom_button',
        text: 'Print',
      },
      {
        text: '<i class="fa-solid fa-plus add_icon"></i> Add User',
        className: 'add_user_button custom_button add_button',
        action: function (e, dt, node, config) {
          // Trigger the modal to add a new user when clicked
          $('#add_user_modal').modal('show');
        }
      }
    ],
    language: {
      lengthMenu: "Show _MENU_ entries per page",
      search: "Search:",
    },
  });

  // Fetch and display users when the page loads
  fetchUsers();

  // Handle Add User
  $("#saveUserButton").on("click", function() {
    const userData = {
      full_name: $("#full_name").val(),
      email_address: $("#email_address").val(),
      username: $("#username").val(),
      password: $("#password").val(),
      user_title: $("#user_title").val(),
      user_level: $("#user_level").val(),
    };

    $.ajax({
      url: '/add_user',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(userData),
      success: function(response) {
        if (response.success) {
          alert('User added successfully!');
          fetchUsers(); // Refresh the user list after adding the new user
        } else {
          alert(response.message);
        }
      },
      error: function(error) {
        alert('Error adding user!');
      },
    });
  });

  // Handle Edit User
  $(document).on("click", ".editBtn", function() {
    const userId = $(this).data("id");

    // Fetch the user data using GET request
    $.get(`/get_user/${userId}`, function(data) {
      if (data.success) {
        // Populate edit modal fields with user data
        $("#edit_full_name").val(data.user.full_name);
        $("#edit_email_address").val(data.user.email_address);
        $("#edit_username").val(data.user.username);
        $("#edit_password").val(data.user.password); // Populate password field
        $("#edit_user_title").val(data.user.user_title);
        $("#edit_user_level").val(data.user.user_level);

        // Store the user ID in the modal save button
        $("#saveEditUserButton").data("id", userId);
        $('#edit_user_modal').modal('show');
      } else {
        alert(data.message);
      }
    });
  });

  // Handle Save Edit User (Save button click)
  $("#saveEditUserButton").on("click", function() {
    const userId = $(this).data("id");

    // Collect updated data from modal input fields
    const userData = {
      full_name: $("#edit_full_name").val(),
      email_address: $("#edit_email_address").val(),
      username: $("#edit_username").val(),
      password: $("#edit_password").val(), // Include password in the update
      user_title: $("#edit_user_title").val(),
      user_level: $("#edit_user_level").val(),
    };

    // Send PUT request with the updated user data
    $.ajax({
      url: `/edit_user/${userId}`,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(userData),
      success: function(response) {
        if (response.success) {
          alert('User updated successfully!');
          fetchUsers(); // Refresh the user list after updating the user
          $('#edit_user_modal').modal('hide'); // Close modal
        } else {
          alert(response.message); // Display error message
        }
      },
      error: function(error) {
        alert('Error updating user!');
      },
    });
  });

  // Handle Delete User
  $(document).on("click", ".deleteBtn", function() {
    const userId = $(this).data("id");
    if (confirm("Are you sure you want to delete this user?")) {
      $.ajax({
        url: `/delete_user/${userId}`,
        type: 'DELETE',
        success: function(response) {
          if (response.success) {
            alert('User deleted successfully!');
            fetchUsers(); // Refresh the user list after deletion
          } else {
            alert(response.message);
          }
        },
        error: function(error) {
          alert('Error deleting user!');
        },
      });
    }
  });

  // Fetch all users and update the table
  function fetchUsers() {
    $.get('/get_users', function(data) {
      // Clear existing table rows before appending new ones
      usersTable.clear().draw();

      // Add users to the table
      data.users.forEach(user => {
        const row = `
          <tr>
            <td>${user.full_name}</td>
            <td>${user.email_address}</td>
            <td>${user.username}</td>
            <td>${user.user_title}</td>
            <td>${user.user_level}</td>
            <td>
              <button class="editBtn" data-id="${user.id}"
                style="background-color: #4CAF50;
                color: white;
                border: none;
                padding: 5px 5px;
                cursor: pointer;
                font-size: 16px;
                border-radius: 4px;
                margin-right: 2px;">
                <i class="fa-solid fa-user-pen"></i>
              </button>

              <!-- Delete Button -->
              <button class="deleteBtn" data-id="${user.id}"
                style="background-color: #f44336;
                color: white;
                border: none;
                padding: 5px 5px;
                cursor: pointer;
                font-size: 16px;
                border-radius: 4px;">
                <i class="fa-solid fa-user-minus"></i>
              </button>
            </td>
          </tr>
        `;
        usersTable.row.add($(row)).draw(); // Add the new row to DataTable
      });
    });
  }
});
