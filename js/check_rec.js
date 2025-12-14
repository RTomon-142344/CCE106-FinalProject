document.addEventListener("DOMContentLoaded", () => {
  const recordsDiv = document.getElementById("records");
  const searchInput = document.getElementById("search");
  const deleteBtn = document.getElementById("deleteBtn");
  const addFormMsg = document.getElementById("formMessage");
  let currentCustomerID = null;
  let currentCustomerName = null;

  // Create modal
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";
  modalOverlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Confirm Deletion</h3>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <p id="modalMessage">Are you sure you want to delete the customer record for <strong id="customerToDelete"></strong>? This action cannot be undone.</p>
        <div class="form-group">
          <label for="passwordInput">Enter your password to confirm:</label>
          <input type="password" id="passwordInput" class="modal-input" placeholder="Enter your admin password" autocomplete="current-password">
          <p id="passwordError" style="color: var(--error-color); margin-top: 5px; font-size: 0.9rem; display: none;"></p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
        <button class="btn btn-danger" id="confirmDeleteBtn">Delete Customer</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modalOverlay);
  const modal = modalOverlay.querySelector(".modal");
  const passwordInput = document.getElementById("passwordInput");
  const passwordError = document.getElementById("passwordError");
  const cancelBtn = document.getElementById("cancelBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const customerToDeleteSpan = document.getElementById("customerToDelete");
  const modalMessage = document.getElementById("modalMessage");

  // Create notification container
  const notificationContainer = document.createElement("div");
  notificationContainer.className = "notification-container";
  document.body.appendChild(notificationContainer);

  // Helper: Show notification
  function showNotification(title, message, type = "info", duration = 5000) {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    
    // Icons for different notification types
    const icons = {
      success: "✓",
      error: "✗",
      warning: "⚠",
      info: "ℹ"
    };
    
    notification.innerHTML = `
      <div class="notification-icon">${icons[type] || icons.info}</div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close">&times;</button>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Close button functionality
    notification.querySelector(".notification-close").addEventListener("click", () => {
      hideNotification(notification);
    });
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        hideNotification(notification);
      }, duration);
    }
    
    return notification;
  }

  function hideNotification(notification) {
    notification.classList.add("hiding");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  // Helper: display message in form
  function showMessage(message, color = "var(--text-color)") {
    addFormMsg.style.color = color;
    addFormMsg.textContent = message;
  }

  // Modal functions
  function showModal() {
    modalOverlay.style.display = "flex";
    passwordInput.value = "";
    passwordError.style.display = "none";
    passwordError.textContent = "";
    customerToDeleteSpan.textContent = currentCustomerName || "the selected customer";
    passwordInput.focus();
  }

  function hideModal() {
    modalOverlay.style.display = "none";
  }

  // Modal event listeners
  modalOverlay.querySelector(".close-btn").addEventListener("click", hideModal);
  cancelBtn.addEventListener("click", hideModal);
  
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      hideModal();
    }
  });

  // Handle Enter key in password input
  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      confirmDeleteBtn.click();
    }
  });

  // Delete confirmation handler
  confirmDeleteBtn.addEventListener("click", async () => {
    const password = passwordInput.value.trim();
    
    if (!password) {
      passwordError.textContent = "Password is required";
      passwordError.style.display = "block";
      passwordInput.focus();
      return;
    }
    
    // Disable buttons during processing
    confirmDeleteBtn.disabled = true;
    cancelBtn.disabled = true;
    confirmDeleteBtn.textContent = "Deleting...";
    
    try {
      // Use FormData for better compatibility
      const formData = new FormData();
      formData.append('id', currentCustomerID);
      formData.append('password', password);
      
      const res = await fetch("delete_customer.php", {
        method: "POST",
        body: formData
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        // Show success notification
        showNotification(
          "Customer Deleted",
          data.message,
          "success",
          4000
        );
        
        // Clear the displayed customer info
        clearCustomerInfo();
        
        // Reload records
        await loadRecords();
        
        // Hide modal
        hideModal();
        
        // Show success message in form
        showMessage(data.message, "var(--success-color)");
      } else {
        // Show error in modal
        passwordError.textContent = data.message;
        passwordError.style.display = "block";
        passwordInput.focus();
        passwordInput.select();
        
        // Show error notification
        showNotification(
          "Deletion Failed",
          data.message,
          "error",
          5000
        );
      }
    } catch (err) {
      console.error("Delete error:", err);
      
      // Show appropriate error message
      let errorMessage = "Unable to connect to server. Please check your internet connection and try again.";
      if (err.message.includes("HTTP error")) {
        errorMessage = "Server error occurred. Please try again later.";
      }
      
      passwordError.textContent = errorMessage;
      passwordError.style.display = "block";
      
      showNotification(
        "Network Error",
        errorMessage,
        "error",
        5000
      );
    } finally {
      // Re-enable buttons
      confirmDeleteBtn.disabled = false;
      cancelBtn.disabled = false;
      confirmDeleteBtn.textContent = "Delete Customer";
    }
  });

  // Clear customer info function
  function clearCustomerInfo() {
    document.getElementById("cust-name").textContent = "Select a customer";
    document.getElementById("cust-business").textContent = "---";
    document.getElementById("cust-phone").textContent = "---";
    document.getElementById("cust-address").textContent = "---";
    document.getElementById("cust-duedate").textContent = "---";
    document.getElementById("cust-amount").textContent = "0";
    document.getElementById("cust-total").textContent = "0";
    document.getElementById("cust-balance").textContent = "0";
    document.getElementById("cust-payment").textContent = "0";
    currentCustomerID = null;
    currentCustomerName = null;
  }

  // Fetch and display all records
  async function loadRecords() {
    try {
      showNotification(
        "Loading",
        "Fetching customer records...",
        "info",
        2000
      );
      
      const res = await fetch("../php/fetch_records.php");
      
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      const data = await res.json();

      recordsDiv.innerHTML = "";
      const noRecordsMsg = document.getElementById("noRecordsMessage");

      if (!Array.isArray(data) || data.length === 0) {
        noRecordsMsg.style.display = "block";
        return;
      }

      noRecordsMsg.style.display = "none";

      data.forEach(cust => {
        const card = document.createElement("div");
        card.className = "record-card";
        card.innerHTML = `
          <div class="record-header">
            <p class="Name">${cust.FirstName} ${cust.LastName}</p>
            <button class="display" data-id="${cust.CustomerID}">Display</button>
          </div>
          <div class="details">
            <div class="record-detail">
              <p class="desc">Amount</p>
              <p class="info">₱${cust.LoanAmount}</p>
            </div>
            <div class="record-detail">
              <p class="desc">Balance</p>
              <p class="info">₱${cust.Balance}</p>
            </div>
          </div>
        `;
        recordsDiv.appendChild(card);
      });

      attachDisplayEvents();
      showMessage(""); // clear messages after load
      
      showNotification(
        "Records Loaded",
        `${data.length} customer records loaded successfully`,
        "success",
        3000
      );
    } catch (err) {
      console.error("Load records error:", err);
      showMessage(`Error loading records: ${err.message}`, "var(--error-color)");
      
      let errorMsg = "Failed to load customer records";
      if (err.message.includes("HTTP error")) {
        errorMsg = "Server error occurred while loading records";
      } else if (err.message.includes("NetworkError") || err.message.includes("Failed to fetch")) {
        errorMsg = "Unable to connect to server. Please check your internet connection.";
      }
      
      showNotification(
        "Load Error",
        errorMsg,
        "error",
        5000
      );
    }
  }

  // Attach display button events
  function attachDisplayEvents() {
    document.querySelectorAll(".display").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        currentCustomerID = id;
        
        try {
          const res = await fetch(`../php/fetch_customer.php?id=${id}`);
          
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          
          const cust = await res.json();

          if (!cust.error) {
            currentCustomerName = `${cust.FirstName} ${cust.LastName}`;
            document.getElementById("cust-name").textContent = currentCustomerName;
            document.getElementById("cust-business").textContent = cust.BusinessName;
            document.getElementById("cust-phone").textContent = cust.PhoneNum;
            document.getElementById("cust-address").textContent = cust.Address;
            document.getElementById("cust-amount").textContent ="₱" + cust.LoanAmount;
            document.getElementById("cust-total").textContent = "₱" + cust.TotalAmount;
            document.getElementById("cust-balance").textContent = "₱" + cust.Balance;
            document.getElementById("cust-duedate").textContent = cust.DueDate;
            document.getElementById("cust-payment").textContent = "₱" + cust.AmountPaid;
            
            showMessage("Customer loaded successfully.", "var(--success-color)");
            
            showNotification(
              "Customer Loaded",
              `${currentCustomerName}'s details loaded`,
              "success",
              3000
            );
          } else {
            showMessage("Error loading customer.", "var(--error-color)");
            
            showNotification(
              "Load Error",
              "Failed to load customer details",
              "error",
              4000
            );
          }
        } catch (err) {
          console.error("Fetch customer error:", err);
          showMessage("Network error loading customer.", "var(--error-color)");
          
          let errorMsg = "Unable to fetch customer details";
          if (err.message.includes("HTTP error")) {
            errorMsg = "Server error occurred";
          }
          
          showNotification(
            "Network Error",
            errorMsg,
            "error",
            4000
          );
        }
      });
    });
  }

  // Admin-only delete button
  if (typeof isAdmin !== "undefined" && isAdmin) {
    deleteBtn.style.display = "inline-block";
    deleteBtn.addEventListener("click", () => {
      if (!currentCustomerID) {
        showMessage("Please select a customer first.", "var(--error-color)");
        
        showNotification(
          "No Customer Selected",
          "Please select a customer to delete",
          "warning",
          3000
        );
        return;
      }

      showModal();
    });
  }

  // Search filter
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const noRecordsMsg = document.getElementById("noRecordsMessage");
    let visibleCount = 0;

    document.querySelectorAll(".record-card").forEach(card => {
      const name = card.querySelector(".Name").textContent.toLowerCase();
      const isVisible = name.includes(term);
      card.style.display = isVisible ? "block" : "none";
      if (isVisible) visibleCount++;
    });

    // Show "No customer records found" message if no results match
    noRecordsMsg.style.display = visibleCount === 0 ? "block" : "none";
  });

  // Initial load
  loadRecords();
});