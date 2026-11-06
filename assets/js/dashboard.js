/**
 * DriveEase - Customer Dashboard Operations & Interactive Controls
 */

(function () {
  'use strict';

  // Helper: Status badge generator
  function getStatusBadge(status) {
    switch (status) {
      case 'Upcoming':
        return '<span class="badge badge-soft-primary"><i class="bi bi-clock-history me-1"></i>Upcoming</span>';
      case 'Completed':
        return '<span class="badge badge-soft-success"><i class="bi bi-check-circle-fill me-1"></i>Completed</span>';
      case 'Cancelled':
        return '<span class="badge badge-soft-danger"><i class="bi bi-x-circle-fill me-1"></i>Cancelled</span>';
      case 'In Progress':
        return '<span class="badge badge-soft-warning"><i class="bi bi-arrow-repeat me-1"></i>In Progress</span>';
      default:
        return `<span class="badge badge-soft-secondary">${status}</span>`;
    }
  }

  // 1. Dashboard Overview Init
  function initDashboardOverview() {
    const bookings = window.DriveEaseBookings ? window.DriveEaseBookings.getAll() : [];

    // KPI Counters
    const elTotal = document.getElementById('kpiTotalBookings');
    const elUpcoming = document.getElementById('kpiUpcomingBookings');
    const elCompleted = document.getElementById('kpiCompletedBookings');
    const elCancelled = document.getElementById('kpiCancelledBookings');

    if (elTotal) {
      const upcomingCount = bookings.filter(b => b.status === 'Upcoming' || b.status === 'In Progress').length;
      const completedCount = bookings.filter(b => b.status === 'Completed').length;
      const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;

      elTotal.textContent = bookings.length;
      if (elUpcoming) elUpcoming.textContent = upcomingCount;
      if (elCompleted) elCompleted.textContent = completedCount;
      if (elCancelled) elCancelled.textContent = cancelledCount;
    }

    // Recent Bookings Table
    const recentTableBody = document.getElementById('recentBookingsTableBody');
    if (recentTableBody) {
      recentTableBody.innerHTML = '';
      const top5 = bookings.slice(0, 5);

      if (top5.length === 0) {
        recentTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No bookings found yet. Book your first driver today!</td></tr>`;
      } else {
        top5.forEach(b => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong class="text-primary font-monospace">${b.id}</strong></td>
            <td>
              <div class="d-flex align-items-center gap-2">
                <img src="${b.driverAvatar}" alt="${b.driverName}" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">
                <span class="fw-semibold">${b.driverName}</span>
              </div>
            </td>
            <td>
              <div class="small fw-semibold text-truncate" style="max-width: 180px;" title="${b.pickupLocation}">
                <i class="bi bi-geo-alt-fill text-danger me-1"></i>${b.pickupLocation}
              </div>
            </td>
            <td>
              <div class="small text-muted"><i class="bi bi-calendar3 me-1"></i>${b.date}</div>
              <div class="small text-muted"><i class="bi bi-clock me-1"></i>${b.time} (${b.hours} hrs)</div>
            </td>
            <td><strong class="text-dark">$${Number(b.totalAmount).toFixed(2)}</strong></td>
            <td>${getStatusBadge(b.status)}</td>
            <td>
              <div class="d-flex gap-2">
                <a href="booking-details.html?id=${b.id}" class="btn btn-sm btn-outline-primary" title="View Details">
                  <i class="bi bi-eye"></i>
                </a>
                <a href="driver-tracking.html?id=${b.id}" class="btn btn-sm btn-outline-secondary" title="Track Driver">
                  <i class="bi bi-geo"></i>
                </a>
              </div>
            </td>
          `;
          recentTableBody.appendChild(tr);
        });
      }
    }

    // Render Canvas Chart (Bookings Trend)
    const chartCanvas = document.getElementById('bookingActivityChart');
    if (chartCanvas && chartCanvas.getContext) {
      renderActivityChart(chartCanvas);
    }
  }

  // Activity Chart Renderer (Vanilla Canvas for zero heavy dependencies)
  function renderActivityChart(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 600;
    const height = canvas.height = 240;

    const data = [12, 19, 15, 26, 22, 38, 45, 40, 52, 48, 62, 70];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const maxVal = 80;
    const padding = { top: 30, right: 30, bottom: 40, left: 45 };

    ctx.clearRect(0, 0, width, height);

    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#94A3B8' : '#64748B';

    // Grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.font = '11px sans-serif';
    ctx.fillStyle = textColor;

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (height - padding.top - padding.bottom) * (i / 4);
      const val = Math.round(maxVal - (maxVal * (i / 4)));
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(val, 15, y + 4);
    }

    // Plot Points
    const chartWidth = width - padding.left - padding.right;
    const stepX = chartWidth / (data.length - 1);
    const points = data.map((val, index) => {
      const x = padding.left + index * stepX;
      const y = height - padding.bottom - (val / maxVal) * (height - padding.top - padding.bottom);
      return { x, y, label: labels[index] };
    });

    // Draw Gradient Area
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(229, 169, 60, 0.35)');
    gradient.addColorStop(1, 'rgba(229, 169, 60, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding.bottom);
    points.forEach((p, i) => {
      if (i === 0) ctx.lineTo(p.x, p.y);
      else {
        const prev = points[i - 1];
        const cx = (prev.x + p.x) / 2;
        ctx.bezierCurveTo(cx, prev.y, cx, p.y, p.x, p.y);
      }
    });
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Line
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else {
        const prev = points[i - 1];
        const cx = (prev.x + p.x) / 2;
        ctx.bezierCurveTo(cx, prev.y, cx, p.y, p.x, p.y);
      }
    });
    ctx.strokeStyle = '#E5A93C';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Points & Labels
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.fillText(p.label, p.x, height - 15);
    });
  }

  // 2. My Bookings Table with Tab Filtering
  function initMyBookingsPage() {
    const tableBody = document.getElementById('allBookingsTableBody');
    if (!tableBody) return;

    let currentFilter = 'all';

    function renderBookings() {
      const all = window.DriveEaseBookings ? window.DriveEaseBookings.getAll() : [];
      let filtered = all;

      if (currentFilter === 'upcoming') {
        filtered = all.filter(b => b.status === 'Upcoming' || b.status === 'In Progress');
      } else if (currentFilter === 'completed') {
        filtered = all.filter(b => b.status === 'Completed');
      } else if (currentFilter === 'cancelled') {
        filtered = all.filter(b => b.status === 'Cancelled');
      }

      tableBody.innerHTML = '';

      if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-muted"><i class="bi bi-folder2-open display-4 d-block mb-2"></i>No ${currentFilter} bookings found.</td></tr>`;
        return;
      }

      filtered.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong class="text-primary font-monospace">${b.id}</strong></td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <img src="${b.driverAvatar}" alt="${b.driverName}" class="rounded-circle" style="width: 36px; height: 36px; object-fit: cover;">
              <div>
                <div class="fw-semibold">${b.driverName}</div>
                <div class="small text-muted">${b.categoryName}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="small fw-semibold text-truncate" style="max-width: 170px;" title="${b.pickupLocation}">
              <i class="bi bi-record-circle text-primary me-1"></i>${b.pickupLocation}
            </div>
            <div class="small text-muted text-truncate" style="max-width: 170px;" title="${b.dropLocation}">
              <i class="bi bi-geo-alt-fill text-danger me-1"></i>${b.dropLocation}
            </div>
          </td>
          <td>
            <div class="small fw-semibold">${b.date}</div>
            <div class="small text-muted">${b.time}</div>
          </td>
          <td><span class="badge bg-light text-dark border">${b.hours} Hours</span></td>
          <td><strong class="text-primary">$${Number(b.totalAmount).toFixed(2)}</strong></td>
          <td>${getStatusBadge(b.status)}</td>
          <td>
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Action
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow">
                <li><a class="dropdown-item" href="booking-details.html?id=${b.id}"><i class="bi bi-eye me-2 text-primary"></i>View Details</a></li>
                <li><a class="dropdown-item" href="driver-tracking.html?id=${b.id}"><i class="bi bi-geo-alt me-2 text-info"></i>Track Assignment</a></li>
                <li><a class="dropdown-item" href="invoice-details.html?id=${b.id}"><i class="bi bi-receipt me-2 text-success"></i>View Invoice</a></li>
                ${b.status === 'Upcoming' ? `<li><hr class="dropdown-divider"></li><li><a class="dropdown-item text-danger btn-cancel-booking" href="#" data-id="${b.id}"><i class="bi bi-x-circle me-2"></i>Cancel Booking</a></li>` : ''}
              </ul>
            </div>
          </td>
        `;
        tableBody.appendChild(tr);
      });

      // Bind cancel booking actions
      tableBody.querySelectorAll('.btn-cancel-booking').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const id = btn.getAttribute('data-id');
          if (confirm(`Are you sure you want to cancel booking ${id}? A full refund will be processed to your card.`)) {
            window.DriveEaseBookings.updateStatus(id, 'Cancelled');
            window.showToast('Booking Cancelled', `Booking #${id} has been cancelled successfully.`, 'info');
            renderBookings();
          }
        });
      });
    }

    // Filter Tabs
    const filterTabs = document.querySelectorAll('.booking-filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        filterTabs.forEach(t => {
          t.classList.remove('active');
          t.blur();
        });
        tab.classList.add('active');
        currentFilter = tab.getAttribute('data-filter') || 'all';
        renderBookings();
      });
    });

    renderBookings();
  }

  // 3. Booking Details Page
  function initBookingDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('id');
    const bookings = window.DriveEaseBookings ? window.DriveEaseBookings.getAll() : [];
    const booking = (bookingId ? bookings.find(b => b.id === bookingId) : bookings[0]) || bookings[0];

    if (!booking) return;

    // Fill elements
    const setElemText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setElemText('detBookingId', booking.id);
    setElemText('detDriverName', booking.driverName);
    setElemText('detDriverPhone', booking.driverPhone);
    setElemText('detDriverRating', booking.driverRating + ' / 5.0 (214 Trips)');
    setElemText('detCategory', booking.categoryName);
    setElemText('detPickup', booking.pickupLocation);
    setElemText('detDrop', booking.dropLocation);
    setElemText('detDateTime', `${booking.date} at ${booking.time}`);
    setElemText('detHours', `${booking.hours} Hours`);
    setElemText('detVehicle', booking.vehicleName);
    setElemText('detInstructions', booking.specialInstructions || 'None provided');
    setElemText('detSubtotal', '$' + Number(booking.subtotal).toFixed(2));
    setElemText('detTax', '$' + Number(booking.tax).toFixed(2));
    setElemText('detTotal', '$' + Number(booking.totalAmount).toFixed(2));

    const statusBadgeEl = document.getElementById('detStatusBadge');
    if (statusBadgeEl) statusBadgeEl.innerHTML = getStatusBadge(booking.status);

    const driverAvatarEl = document.getElementById('detDriverAvatar');
    if (driverAvatarEl) driverAvatarEl.src = booking.driverAvatar;

    const btnTrack = document.getElementById('btnTrackThisBooking');
    if (btnTrack) btnTrack.href = `driver-tracking.html?id=${booking.id}`;

    const btnInvoice = document.getElementById('btnInvoiceThisBooking');
    if (btnInvoice) btnInvoice.href = `invoice-details.html?id=${booking.id}`;
  }

  // 4. Driver Assignment Tracking Simulation
  function initDriverTrackingPage() {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('id');
    const bookings = window.DriveEaseBookings ? window.DriveEaseBookings.getAll() : [];
    const booking = (bookingId ? bookings.find(b => b.id === bookingId) : bookings[0]) || bookings[0];

    if (!booking) return;

    const setElemText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setElemText('trackBookingId', booking.id);
    setElemText('trackDriverName', booking.driverName);
    setElemText('trackDriverPhone', booking.driverPhone);
    setElemText('trackDriverRating', booking.driverRating + ' ★');
    setElemText('trackPickup', booking.pickupLocation);
    setElemText('trackDrop', booking.dropLocation);
    setElemText('trackVehicle', booking.vehicleName);

    const avatarEl = document.getElementById('trackDriverAvatar');
    if (avatarEl) avatarEl.src = booking.driverAvatar;

    // Simulation Stages
    const stages = [
      { step: 1, name: 'Driver Assigned', desc: 'Driver confirmed and preparing your route.', eta: '18 mins away' },
      { step: 2, name: 'En Route to Pickup', desc: 'Driver is navigating towards your pickup point.', eta: '11 mins away' },
      { step: 3, name: 'Arrived at Pickup', desc: 'Driver has parked outside and awaits your arrival.', eta: 'Driver Arrived' },
      { step: 4, name: 'Trip in Progress', desc: 'Chauffeur is currently driving smoothly towards your destination.', eta: 'On Schedule' },
      { step: 5, name: 'Trip Completed', desc: 'Successfully reached destination. Thank you for riding with DriveEase!', eta: 'Trip Concluded' }
    ];

    let currentStageIndex = 1; // Default "En Route"

    function updateTrackingUI(index) {
      currentStageIndex = index;
      const stage = stages[index];

      const etaEl = document.getElementById('trackEta');
      if (etaEl) etaEl.textContent = stage.eta;

      const currentStageEl = document.getElementById('trackCurrentStageName');
      if (currentStageEl) currentStageEl.textContent = stage.name;

      const timelineItems = document.querySelectorAll('.tracking-timeline .tracking-step');
      timelineItems.forEach((item, i) => {
        item.classList.remove('completed', 'current');
        if (i < index) {
          item.classList.add('completed');
        } else if (i === index) {
          item.classList.add('current');
        }
      });
    }

    // Bind simulation buttons
    const simBtns = document.querySelectorAll('.sim-stage-btn');
    simBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const stageIdx = parseInt(btn.getAttribute('data-stage'), 10);
        updateTrackingUI(stageIdx);
        window.showToast('Tracking Updated', `Simulated Status: ${stages[stageIdx].name}`, 'info');
      });
    });

    updateTrackingUI(currentStageIndex);

    // Call Driver Demo Button
    const callBtn = document.getElementById('btnCallDriver');
    if (callBtn) {
      callBtn.addEventListener('click', () => {
        window.showToast('Calling Driver', `Dialing ${booking.driverName} at ${booking.driverPhone}... (Demo Interaction)`, 'info');
      });
    }

    // Message Driver Demo Button
    const msgBtn = document.getElementById('btnMessageDriver');
    if (msgBtn) {
      msgBtn.addEventListener('click', () => {
        const msg = prompt(`Send a quick SMS to ${booking.driverName}:`, "I'm waiting near the front lobby entrance.");
        if (msg) {
          window.showToast('Message Dispatched', `SMS sent to driver: "${msg}"`, 'success');
        }
      });
    }
  }

  // 5. Invoices Page
  function initInvoicesPage() {
    const tableBody = document.getElementById('invoicesTableBody');
    if (!tableBody) return;

    const bookings = window.DriveEaseBookings ? window.DriveEaseBookings.getAll() : [];
    tableBody.innerHTML = '';

    bookings.forEach((b, idx) => {
      const invNum = `INV-2026-${1000 + idx}`;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong class="font-monospace text-primary">${invNum}</strong></td>
        <td><span class="font-monospace">${b.id}</span></td>
        <td>${b.date}</td>
        <td>${b.categoryName}</td>
        <td><strong class="text-dark">$${Number(b.totalAmount).toFixed(2)}</strong></td>
        <td><span class="badge badge-soft-success"><i class="bi bi-check-circle me-1"></i>${b.paymentStatus || 'Paid'}</span></td>
        <td>
          <div class="d-flex gap-2">
            <a href="invoice-details.html?id=${b.id}&inv=${invNum}" class="btn btn-sm btn-outline-primary" title="View & Print">
              <i class="bi bi-printer me-1"></i>View / Print
            </a>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // 6. Invoice Details Page (Print Ready)
  function initInvoiceDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('id');
    const invNum = params.get('inv') || 'INV-2026-1049';
    const bookings = window.DriveEaseBookings ? window.DriveEaseBookings.getAll() : [];
    const booking = (bookingId ? bookings.find(b => b.id === bookingId) : bookings[0]) || bookings[0];

    if (!booking) return;

    const setElemText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setElemText('invNumber', invNum);
    setElemText('invDate', booking.date);
    setElemText('invBookingId', booking.id);
    setElemText('invCustomerName', booking.customerName || 'Alex Morgan');
    setElemText('invDriverName', booking.driverName);
    setElemText('invCategoryName', booking.categoryName);
    setElemText('invHours', booking.hours + ' Hours');
    setElemText('invSubtotal', '$' + Number(booking.subtotal).toFixed(2));
    setElemText('invTax', '$' + Number(booking.tax).toFixed(2));
    setElemText('invTotal', '$' + Number(booking.totalAmount).toFixed(2));

    const printBtn = document.getElementById('btnPrintInvoice');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // 7. Profile Page
  function initProfilePage() {
    const user = window.DriveEaseAuth ? window.DriveEaseAuth.getCurrentUser() : null;
    if (!user) return;

    const nameInput = document.getElementById('profileName');
    const emailInput = document.getElementById('profileEmail');
    const phoneInput = document.getElementById('profilePhone');
    const addressInput = document.getElementById('profileAddress');
    const avatarImg = document.getElementById('profileAvatarImg');
    const profileForm = document.getElementById('profileForm');

    if (nameInput) nameInput.value = user.fullName || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (addressInput) addressInput.value = user.address || '';
    if (avatarImg && user.avatar) avatarImg.src = user.avatar;

    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedUser = {
          ...user,
          fullName: nameInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput.value.trim(),
          address: addressInput.value.trim()
        };
        window.DriveEaseAuth.setCurrentUser(updatedUser);
        window.showToast('Profile Updated', 'Your customer profile changes have been saved successfully.', 'success');
      });
    }

    // Avatar Upload Simulation
    const avatarInput = document.getElementById('avatarFileInput');
    if (avatarInput) {
      avatarInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
          const reader = new FileReader();
          reader.onload = function (e) {
            if (avatarImg) avatarImg.src = e.target.result;
            const cur = window.DriveEaseAuth.getCurrentUser();
            cur.avatar = e.target.result;
            window.DriveEaseAuth.setCurrentUser(cur);
            window.showToast('Avatar Updated', 'Profile photo uploaded successfully.', 'info');
          };
          reader.readAsDataURL(this.files[0]);
        }
      });
    }
  }

  // 8. Settings Page
  function initSettingsPage() {
    const passwordForm = document.getElementById('changePasswordForm');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPass = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmNewPassword').value;

        if (!currentPass || !newPass || !confirmPass) {
          window.showToast('Missing Fields', 'Please complete all password fields.', 'error');
          return;
        }

        if (newPass !== confirmPass) {
          window.showToast('Mismatch', 'New passwords do not match.', 'warning');
          return;
        }

        window.showToast('Password Changed', 'Your account password has been updated securely.', 'success');
        passwordForm.reset();
      });
    }

    const notifForm = document.getElementById('notificationSettingsForm');
    if (notifForm) {
      notifForm.addEventListener('submit', (e) => {
        e.preventDefault();
        window.showToast('Preferences Saved', 'Your communication and notification preferences were updated.', 'success');
      });
    }
  }

  // Initialize matching page
  document.addEventListener('DOMContentLoaded', () => {
    initDashboardOverview();
    initMyBookingsPage();
    initBookingDetailsPage();
    initDriverTrackingPage();
    initInvoicesPage();
    initInvoiceDetailsPage();
    initProfilePage();
    initSettingsPage();
  });
})();
