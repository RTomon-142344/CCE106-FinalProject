document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const employeeTableBody = document.getElementById("employeeTableBody");
    const totalEmployeesEl = document.getElementById("totalEmployees");
    const activeEmployeesEl = document.getElementById("activeEmployees");
    const collectorsCountEl = document.getElementById("collectorsCount");
    const officeCountEl = document.getElementById("officeCount");
    const searchInput = document.getElementById("searchInput");
    const lastUpdatedEl = document.getElementById("lastUpdated");
    const showingCountEl = document.getElementById("showingCount");
    const tabs = Array.from(document.querySelectorAll(".tab"));
    
    // Modal references
    const historyModal = document.getElementById("historyModal");
    const editModal = document.getElementById("editModal");
    const passwordEditModal = document.getElementById("passwordEditModal");
    const passwordDeleteModal = document.getElementById("passwordDeleteModal");
    
    // Edit form elements
    const editForm = document.getElementById("editEmployeeForm");
    const editEmpId = document.getElementById("editEmpId");
    const editFirstName = document.getElementById("editFirstName");
    const editLastName = document.getElementById("editLastName");
    const editEmail = document.getElementById("editEmail");
    const editDepartment = document.getElementById("editDepartment");
    const editPassword = document.getElementById("editPassword");
    const editFormMessage = document.getElementById("editFormMessage");
    
    // Password verification forms
    const passwordEditForm = document.getElementById("passwordEditForm");
    const editAdminPassword = document.getElementById("editAdminPassword");
    const editPasswordError = document.getElementById("editPasswordError");
    const editEmployeeId = document.getElementById("editEmployeeId");
    
    const passwordDeleteForm = document.getElementById("passwordDeleteForm");
    const deleteAdminPassword = document.getElementById("deleteAdminPassword");
    const deletePasswordError = document.getElementById("deletePasswordError");
    const deleteEmployeeId = document.getElementById("deleteEmployeeId");
    const deleteWarningMessage = document.getElementById("deleteWarningMessage");
    
    let employees = [];
    let filteredEmployees = [];
    let currentFilter = "all";
    let refreshInterval;
    let currentEditEmployee = null;
    let pendingAction = null;
    let pendingEmployeeId = null;

    // Helper functions
    const escapeHtml = (s) => String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // Format time to HH:MM
    const formatTime = (time) => {
        if (!time || time === "00:00:00" || time === "--" || time === null) {
            return "--";
        }
        return time.substring(0, 5); // Get HH:MM only
    };

    // Update last updated time
    const updateLastUpdated = () => {
        const now = new Date();
        lastUpdatedEl.textContent = `Last updated: ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    };

    // Show toast notification
    function showToast(message, type = 'success', duration = 3000) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast-notification`;
        toast.innerHTML = `
            <div class="toast ${type}">
                <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠️'}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        });
        
        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('hide');
                setTimeout(() => {
                    if (toast.parentNode) toast.remove();
                }, 300);
            }
        }, duration);
        
        return toast;
    }

    // Show loading overlay
    function showLoading() {
        let overlay = document.querySelector('.loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="loading-spinner"></div>';
            document.body.appendChild(overlay);
        }
        overlay.classList.add('show');
    }

    // Hide loading overlay
    function hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    // Show modal
    function showModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // Hide modal
    function hideModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Clear password fields
        if (modal === passwordEditModal) {
            editAdminPassword.value = '';
            editPasswordError.textContent = '';
        } else if (modal === passwordDeleteModal) {
            deleteAdminPassword.value = '';
            deletePasswordError.textContent = '';
        }
    }

    // Close modal when clicking outside
    function setupModalClose(modal) {
        const closeBtn = modal.querySelector('.modal-close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => hideModal(modal));
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    }

    // Verify admin password
    async function verifyAdminPassword(password) {
        try {
            const formData = new FormData();
            formData.append('password', password);
            
            const response = await fetch('../php/verify_admin_password.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Password verification error:', error);
            return { success: false, message: 'Network error' };
        }
    }

    // Show password verification modal for edit
    function showPasswordEditModal(empId) {
        const emp = employees.find(e => e.EmpID == empId);
        if (!emp) return;
        
        pendingAction = 'edit';
        pendingEmployeeId = empId;
        editEmployeeId.value = empId;
        
        editAdminPassword.value = '';
        editPasswordError.textContent = '';
        
        showModal(passwordEditModal);
        editAdminPassword.focus();
    }

    // Show password verification modal for delete
    function showPasswordDeleteModal(empId) {
        const emp = employees.find(e => e.EmpID == empId);
        if (!emp) return;
        
        pendingAction = 'delete';
        pendingEmployeeId = empId;
        deleteEmployeeId.value = empId;
        
        deleteWarningMessage.textContent = `Are you sure you want to delete ${emp.FullName}? This action cannot be undone.`;
        
        deleteAdminPassword.value = '';
        deletePasswordError.textContent = '';
        
        showModal(passwordDeleteModal);
        deleteAdminPassword.focus();
    }

    // Handle password verification for edit
    passwordEditForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = editAdminPassword.value.trim();
        if (!password) {
            editPasswordError.textContent = 'Please enter your password';
            return;
        }
        
        editPasswordError.textContent = '';
        showLoading();
        
        try {
            const result = await verifyAdminPassword(password);
            
            if (result.success) {
                hideModal(passwordEditModal);
                showEditModal(pendingEmployeeId);
            } else {
                editPasswordError.textContent = result.message || 'Incorrect password';
                editAdminPassword.focus();
                editAdminPassword.select();
            }
        } catch (error) {
            editPasswordError.textContent = 'Verification failed. Please try again.';
        } finally {
            hideLoading();
        }
    });

    // Handle password verification for delete
    passwordDeleteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = deleteAdminPassword.value.trim();
        if (!password) {
            deletePasswordError.textContent = 'Please enter your password';
            return;
        }
        
        deletePasswordError.textContent = '';
        showLoading();
        
        try {
            const result = await verifyAdminPassword(password);
            
            if (result.success) {
                hideModal(passwordDeleteModal);
                await performDelete(pendingEmployeeId, password);
            } else {
                deletePasswordError.textContent = result.message || 'Incorrect password';
                deleteAdminPassword.focus();
                deleteAdminPassword.select();
            }
        } catch (error) {
            deletePasswordError.textContent = 'Verification failed. Please try again.';
        } finally {
            hideLoading();
        }
    });

    // Perform delete after password verification
    async function performDelete(empId, adminPassword) {
        const emp = employees.find(e => e.EmpID == empId);
        if (!emp) return;
        
        showLoading();
        
        try {
            const formData = new FormData();
            formData.append('empid', empId);
            formData.append('admin_password', adminPassword);
            
            const res = await fetch("../php/delete_employee.php", {
                method: "POST",
                body: formData
            });
            
            const data = await res.json();
            
            if (data.success) {
                showToast('Employee deleted successfully!', 'success');
                await fetchEmployees();
            } else {
                showToast(data.message || 'Delete failed', 'error');
            }
        } catch (error) {
            console.error("Delete error:", error);
            showToast('Error deleting employee', 'error');
        } finally {
            hideLoading();
        }
    }

    // Fetch employees data
    async function fetchEmployees() {
        try {
            const res = await fetch("../php/fetch_employees.php?t=" + Date.now(), {
                cache: "no-store",
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await res.json();
            
            if (data.success) {
                employees = data.data || [];
                applyFilterAndSearch();
                updateStats();
                updateLastUpdated();
            } else {
                throw new Error(data.message || 'Failed to fetch employees');
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            employeeTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:40px;color:#f44336">
                        Failed to load employees. Please refresh the page.
                    </td>
                </tr>
            `;
        }
    }

    // Filter and search logic
    function applyFilterAndSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        filteredEmployees = employees.filter(emp => {
            // Apply department filter
            let deptMatch = true;
            if (currentFilter === "collectors") {
                deptMatch = emp.DeptID == 3;
            } else if (currentFilter === "office") {
                deptMatch = emp.DeptID == 1 || emp.DeptID == 2;
            }
            
            // Apply search filter
            let searchMatch = true;
            if (searchTerm) {
                searchMatch = 
                    (emp.FullName || "").toLowerCase().includes(searchTerm) ||
                    (emp.Email || "").toLowerCase().includes(searchTerm) ||
                    (emp.DeptName || "").toLowerCase().includes(searchTerm);
            }
            
            return deptMatch && searchMatch;
        });
        
        renderTable();
    }

    // Render employee table
    function renderTable() {
        if (filteredEmployees.length === 0) {
            employeeTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:40px;">
                        No employees found. Try changing your search or filter.
                    </td>
                </tr>
            `;
            showingCountEl.textContent = "Showing 0 of 0 employees";
            return;
        }
        
        employeeTableBody.innerHTML = filteredEmployees.map(emp => {
            const status = emp.CurrentStatus || 'Inactive';
            const statusClass = status.toLowerCase();
            
            return `
            <tr data-empid="${emp.EmpID}">
                <td>
                    <div class="employee-name">
                        <strong>${escapeHtml(emp.FullName)}</strong>
                    </div>
                </td>
                <td>${escapeHtml(emp.DeptName)}</td>
                <td>${escapeHtml(emp.Email)}</td>
                <td>${formatTime(emp.FirstTimeIn)}</td>
                <td>${formatTime(emp.LastTimeOut)}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${status}
                    </span>
                </td>
                <td class="ops">
                    <button class="btn-view-history" data-empid="${emp.EmpID}" title="View Login History">
                        📅
                    </button>
                    <button class="btn-edit" data-empid="${emp.EmpID}" title="Edit Employee">
                        ✏️
                    </button>
                    <button class="btn-delete" data-empid="${emp.EmpID}" title="Delete Employee">
                        🗑️
                    </button>
                </td>
            </tr>`;
        }).join("");
        
        showingCountEl.textContent = `Showing ${filteredEmployees.length} of ${employees.length} employees`;
    }

    // Update statistics
    function updateStats() {
        const total = employees.length;
        const active = employees.filter(emp => emp.CurrentStatus === 'Active').length;
        const collectors = employees.filter(emp => emp.DeptID == 3).length;
        const office = employees.filter(emp => emp.DeptID == 1 || emp.DeptID == 2).length;
        
        totalEmployeesEl.textContent = total;
        activeEmployeesEl.textContent = active;
        collectorsCountEl.textContent = collectors;
        officeCountEl.textContent = office;
    }

    // Tab click handlers
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentFilter = tab.dataset.tab;
            applyFilterAndSearch();
        });
    });

    // Search input handler
    searchInput.addEventListener("input", () => {
        applyFilterAndSearch();
    });

    // Event delegation for table buttons
    document.addEventListener("click", async (e) => {
        const target = e.target.closest("button");
        if (!target) return;

        // View History
        if (target.classList.contains("btn-view-history")) {
            const empId = target.dataset.empid;
            showHistoryModal(empId);
            return;
        }

        // Edit Employee
        if (target.classList.contains("btn-edit")) {
            const empId = target.dataset.empid;
            showPasswordEditModal(empId);
            return;
        }

        // Delete Employee
        if (target.classList.contains("btn-delete")) {
            const empId = target.dataset.empid;
            showPasswordDeleteModal(empId);
            return;
        }
    });

    // Show edit modal
    function showEditModal(empId) {
        const emp = employees.find(e => e.EmpID == empId);
        if (!emp) return;
        
        currentEditEmployee = emp;
        
        editEmpId.value = emp.EmpID;
        editFirstName.value = emp.FirstName || '';
        editLastName.value = emp.LastName || '';
        editEmail.value = emp.Email || '';
        editDepartment.value = emp.DeptID || '';
        editPassword.value = '';
        
        editFormMessage.style.display = 'none';
        editFormMessage.textContent = '';
        
        showModal(editModal);
        editFirstName.focus();
    }

    // Handle edit form submission
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        editFormMessage.style.display = 'none';
        editFormMessage.textContent = '';
        
        if (!validateEditForm()) {
            return;
        }
        
        showLoading();
        
        try {
            const formData = new FormData(editForm);
            
            // Get admin password again for the actual update
            const adminPassword = editAdminPassword.value;
            formData.append('admin_password', adminPassword);
            
            // If password is empty, don't send it
            if (!editPassword.value.trim()) {
                formData.delete('password');
            }
            
            const res = await fetch("../php/update_employee.php", {
                method: "POST",
                body: formData
            });
            
            const data = await res.json();
            
            if (data.success) {
                showToast('Employee updated successfully!', 'success');
                hideModal(editModal);
                await fetchEmployees();
            } else {
                editFormMessage.textContent = data.message || 'Update failed.';
                editFormMessage.className = 'form-message error';
                editFormMessage.style.display = 'block';
            }
        } catch (error) {
            console.error("Update error:", error);
            editFormMessage.textContent = 'Network error. Please try again.';
            editFormMessage.className = 'form-message error';
            editFormMessage.style.display = 'block';
        } finally {
            hideLoading();
        }
    });

    // Validate edit form
    function validateEditForm() {
        let isValid = true;
        
        const errorMessages = editForm.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.textContent = '');
        
        if (!editFirstName.value.trim()) {
            document.getElementById('firstNameError').textContent = 'First name is required';
            isValid = false;
        }
        
        if (!editLastName.value.trim()) {
            document.getElementById('lastNameError').textContent = 'Last name is required';
            isValid = false;
        }
        
        if (!editEmail.value.trim()) {
            document.getElementById('emailError').textContent = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.value)) {
            document.getElementById('emailError').textContent = 'Invalid email format';
            isValid = false;
        }
        
        if (!editDepartment.value) {
            document.getElementById('deptError').textContent = 'Department is required';
            isValid = false;
        }
        
        if (editPassword.value.trim()) {
            if (editPassword.value.length < 8) {
                document.getElementById('passwordError').textContent = 'Password must be at least 8 characters';
                isValid = false;
            }
        }
        
        return isValid;
    }

    // History modal functionality
    function showHistoryModal(empId) {
        const empSelect = document.getElementById("historyEmpSelect");
        const monthInput = document.getElementById("historyMonth");
        const loadBtn = document.getElementById("historyLoadBtn");
        
        // Populate employee dropdown
        empSelect.innerHTML = '<option value="">Select Employee</option>' +
            employees.map(emp => 
                `<option value="${emp.EmpID}" ${emp.EmpID == empId ? 'selected' : ''}>
                    ${escapeHtml(emp.FullName)} (${emp.DeptName})
                </option>`
            ).join("");
        
        // Set current month as default
        const now = new Date();
        monthInput.value = now.toISOString().slice(0, 7);
        
        // Show modal
        showModal(historyModal);
        
        // Load history when button clicked
        loadBtn.onclick = async () => {
            const selectedEmpId = empSelect.value;
            const month = monthInput.value;
            
            if (!selectedEmpId || !month) {
                showToast('Please select both employee and month', 'error');
                return;
            }
            
            await loadHistory(selectedEmpId, month);
        };
    }

    async function loadHistory(empId, month) {
        const tbody = document.getElementById("historyTableBody");
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;">Loading...</td></tr>';
        
        try {
            const res = await fetch(`../php/fetch_login_history.php?empid=${empId}&month=${month}`);
            const data = await res.json();
            
            if (data.success && data.data.length) {
                tbody.innerHTML = data.data.map(record => `
                    <tr>
                        <td>${record.LogDate}</td>
                        <td>${formatTime(record.TimeIn)}</td>
                        <td>${formatTime(record.TimeOut)}</td>
                    </tr>
                `).join("");
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="3" style="text-align:center;padding:20px;">
                            No login history found for selected month.
                        </td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error("Error loading history:", error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align:center;padding:20px;color:#f44336">
                        Failed to load history.
                    </td>
                </tr>
            `;
        }
    }

    // Initialize auto-refresh
    function startAutoRefresh() {
        refreshInterval = setInterval(() => {
            fetchEmployees();
        }, 30000); // Refresh every 30 seconds
    }

    // Setup modal close handlers
    setupModalClose(historyModal);
    setupModalClose(editModal);
    setupModalClose(passwordEditModal);
    setupModalClose(passwordDeleteModal);

    // Setup cancel buttons
    document.getElementById('editPasswordCancelBtn')?.addEventListener('click', () => {
        hideModal(passwordEditModal);
    });
    
    document.getElementById('deletePasswordCancelBtn')?.addEventListener('click', () => {
        hideModal(passwordDeleteModal);
    });

    // Initial load
    fetchEmployees();
    startAutoRefresh();

    // Stop auto-refresh when tab is not visible
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            clearInterval(refreshInterval);
        } else {
            startAutoRefresh();
            fetchEmployees(); // Refresh immediately
        }
    });
});