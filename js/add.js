document.addEventListener("DOMContentLoaded", () => {
  const loanAmountInput = document.getElementById("loanamount");
  const dueDateInput = document.getElementById("duedate");
  const totalAmountInput = document.getElementById("totalamount");
  const perDayInput = document.getElementById("perday");
  const addForm = document.getElementById("addForm");
  const addFormMsg = document.getElementById("formMessage");

  // Set minimum date to today for due date
  const today = new Date().toISOString().split('T')[0];
  dueDateInput.min = today;

  // Populate form with customer data if available
  if (typeof window.customerData !== 'undefined' && window.customerData) {
    if (window.customerData.firstname) {
      document.getElementById("firstname").value = window.customerData.firstname;
    }
    if (window.customerData.lastname) {
      document.getElementById("lastname").value = window.customerData.lastname;
    }
    if (window.customerData.businessname) {
      document.getElementById("businessname").value = window.customerData.businessname;
    }
    if (window.customerData.phonenum) {
      document.getElementById("phonenum").value = window.customerData.phonenum;
    }
    if (window.customerData.address) {
      document.getElementById("address").value = window.customerData.address;
    }
  }

  // Calculate loan details
  function calculateLoan() {
    const loanAmount = parseFloat(loanAmountInput.value) || 0;
    const interestRate = 0.05; // 5%

    // Total with interest
    const totalAmount = loanAmount + (loanAmount * interestRate);
    totalAmountInput.value = totalAmount > 0 ? totalAmount.toFixed(2) : "";

    // Per Day (based on due date)
    const dueDate = new Date(dueDateInput.value);
    const today = new Date();

    if (dueDate > today && loanAmount > 0) {
      const diffTime = dueDate - today;
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const perDayValue = days > 0 ? (totalAmount / days) : totalAmount;
      perDayInput.value = perDayValue.toFixed(2);
    } else {
      perDayInput.value = "";
    }
  }

  loanAmountInput.addEventListener("input", calculateLoan);
  dueDateInput.addEventListener("change", calculateLoan);

  // Handle form submit with AJAX
  if (addForm) {
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Validate form
      const firstname = document.getElementById("firstname").value.trim();
      const lastname = document.getElementById("lastname").value.trim();
      const businessname = document.getElementById("businessname").value.trim();
      const phonenum = document.getElementById("phonenum").value.trim();
      const address = document.getElementById("address").value.trim();
      const loanamount = parseFloat(loanAmountInput.value);
      const duedate = dueDateInput.value;
      const totalamount = totalAmountInput.value;
      const perday = perDayInput.value;

      // Basic validation
      if (!firstname || !lastname || !businessname || !phonenum || !address) {
        showMessage("Please fill all customer information fields!", "error");
        return;
      }

      if (!loanamount || loanamount <= 0) {
        showMessage("Please enter a valid loan amount!", "error");
        return;
      }

      if (!duedate) {
        showMessage("Please select a due date!", "error");
        return;
      }

      // Check if due date is in the future
      const selectedDate = new Date(duedate);
      if (selectedDate <= new Date()) {
        showMessage("Due date must be in the future!", "error");
        return;
      }

      const formData = new FormData(addForm);

      // Show loading state
      const submitBtn = addForm.querySelector('.add-btn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Submitting...";
      submitBtn.disabled = true;
      
      fetch("../php/add.php", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            showMessage(data.message, "success");
            
            // Reset form on success after delay
            setTimeout(() => {
              addForm.reset();
              totalAmountInput.value = "";
              perDayInput.value = "";
              
              // Redirect to secretary home page after 2 seconds
              setTimeout(() => {
                window.location.href = "../php/secretary.php";
              }, 2000);
            }, 1000);
            
          } else {
            showMessage("Error: " + data.message, "error");
          }
        })
        .catch((err) => {
          showMessage("Request failed: " + err, "error");
        })
        .finally(() => {
          // Restore button state
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        });
    });
  }

  function showMessage(message, type) {
    addFormMsg.textContent = message;
    addFormMsg.style.color = type === "success" ? "lightgreen" : "#dc3545";
    addFormMsg.style.display = "block";
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      addFormMsg.style.display = "none";
    }, 5000);
  }

  // Initial calculation if values are pre-filled
  calculateLoan();
});