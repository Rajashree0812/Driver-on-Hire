/**
 * DriveEase - Dynamic Booking Engine & Price Calculator
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'driveease_bookings';

  // Base Category Rates
  const RATES = {
    hourly: { baseRate: 22, minHours: 2, name: 'Hourly Driver Service' },
    fullday: { baseRate: 135, flatHours: 8, extraRate: 18, minHours: 8, name: 'Full Day Driver Service' },
    chauffeur: { baseRate: 45, minHours: 3, name: 'Luxury Chauffeur Service' },
    corporate: { baseRate: 38, minHours: 4, name: 'Corporate Executive Driver' },
    airport: { baseRate: 49, flat: true, minHours: 1, name: 'Airport Pickup & Drop' },
    outstation: { baseRate: 36, allowance: 25, minHours: 6, name: 'Outstation Long Distance' },
    monthly: { baseRate: 1450, flat: true, minHours: 1, name: 'Monthly Dedicated Driver' },
    event: { baseRate: 32, minHours: 4, name: 'Event & Party Driver' }
  };

  const VEHICLE_EXTRAS = {
    sedan: 0,
    suv: 20,
    luxury: 45,
    van: 15
  };

  const DRIVER_AVATARS = {
    'Robert Vance': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=85',
    'Marcus Sterling': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=85',
    'David Chen': 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=400&q=85',
    'Liam O’Connor': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=85',
    "Liam O'Connor": 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=85',
    'Anthony Brooks': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=85',
    'Alexander Hayes': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=85',
    'Sebastian Drake': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=85'
  };

  // Seed sample initial bookings if none exist
  function seedInitialBookings() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const sampleBookings = [
        {
          id: 'DE-90412',
          customerName: 'Alex Morgan',
          driverName: 'Robert Vance',
          driverPhone: '+1 (555) 349-8812',
          driverAvatar: DRIVER_AVATARS['Robert Vance'],
          driverRating: 4.95,
          category: 'chauffeur',
          categoryName: 'Luxury Chauffeur Service',
          pickupLocation: 'The Ritz-Carlton, Downtown Central',
          dropLocation: 'Metropolitan Financial District',
          date: '2026-11-10',
          time: '09:00 AM',
          hours: 5,
          vehicleType: 'luxury',
          vehicleName: 'Mercedes-Benz S-Class',
          addons: ['Uniformed Chauffeur', 'Luggage Assistance'],
          subtotal: 250,
          tax: 20,
          totalAmount: 270,
          status: 'Upcoming',
          paymentStatus: 'Paid',
          specialInstructions: 'VIP executive guest pickup. Dress in formal dark uniform.'
        },
        {
          id: 'DE-88341',
          customerName: 'Alex Morgan',
          driverName: 'Marcus Sterling',
          driverPhone: '+1 (555) 774-2190',
          driverAvatar: DRIVER_AVATARS['Marcus Sterling'],
          driverRating: 4.88,
          category: 'airport',
          categoryName: 'Airport Pickup & Drop',
          pickupLocation: 'Terminal 3, International Airport',
          dropLocation: 'Grand Horizon Heights, Apt 14B',
          date: '2026-11-14',
          time: '03:30 PM',
          hours: 2,
          vehicleType: 'suv',
          vehicleName: 'Cadillac Escalade SUV',
          addons: ['Luggage Assistance'],
          subtotal: 69,
          tax: 5.52,
          totalAmount: 74.52,
          status: 'Upcoming',
          paymentStatus: 'Paid',
          specialInstructions: 'Flight AA1492 arrival. Holding name signboard at gate.'
        },
        {
          id: 'DE-81092',
          customerName: 'Alex Morgan',
          driverName: 'David Chen',
          driverPhone: '+1 (555) 441-9982',
          driverAvatar: DRIVER_AVATARS['David Chen'],
          driverRating: 4.92,
          category: 'hourly',
          categoryName: 'Hourly Driver Service',
          pickupLocation: 'Westside Business Park',
          dropLocation: 'Grand Hyatt Convention Center',
          date: '2026-10-28',
          time: '11:00 AM',
          hours: 4,
          vehicleType: 'sedan',
          vehicleName: 'BMW 5 Series',
          addons: [],
          subtotal: 88,
          tax: 7.04,
          totalAmount: 95.04,
          status: 'Completed',
          paymentStatus: 'Paid',
          specialInstructions: 'Punctual client meeting trip.'
        },
        {
          id: 'DE-77120',
          customerName: 'Alex Morgan',
          driverName: 'Liam O’Connor',
          driverPhone: '+1 (555) 662-3109',
          driverAvatar: DRIVER_AVATARS['Liam O’Connor'],
          driverRating: 4.75,
          category: 'outstation',
          categoryName: 'Outstation Long Distance',
          pickupLocation: 'South Valley Residence',
          dropLocation: 'Pinecrest Mountain Resort',
          date: '2026-10-14',
          time: '07:00 AM',
          hours: 8,
          vehicleType: 'suv',
          vehicleName: 'Audi Q7',
          addons: ['Route GPS & Toll Pass'],
          subtotal: 313,
          tax: 25.04,
          totalAmount: 338.04,
          status: 'Completed',
          paymentStatus: 'Paid',
          specialInstructions: 'Weekend family getaway drive.'
        },
        {
          id: 'DE-72019',
          customerName: 'Alex Morgan',
          driverName: 'Anthony Brooks',
          driverPhone: '+1 (555) 882-9901',
          driverAvatar: DRIVER_AVATARS['Anthony Brooks'],
          driverRating: 4.82,
          category: 'event',
          categoryName: 'Event & Party Driver',
          pickupLocation: 'Skyline Terrace Ballroom',
          dropLocation: 'Multiple Drop-offs, City Center',
          date: '2026-09-30',
          time: '08:00 PM',
          hours: 4,
          vehicleType: 'sedan',
          vehicleName: 'Customer Personal Vehicle',
          addons: [],
          subtotal: 128,
          tax: 10.24,
          totalAmount: 138.24,
          status: 'Cancelled',
          paymentStatus: 'Refunded',
          specialInstructions: 'Cancelled by customer due to event rescheduling.'
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleBookings));
    } else {
      // Gracefully update existing localStorage entries to guarantee unique 4K face avatars
      try {
        const bookings = JSON.parse(raw);
        let changed = false;
        bookings.forEach(b => {
          if (b.driverName && DRIVER_AVATARS[b.driverName] && b.driverAvatar !== DRIVER_AVATARS[b.driverName]) {
            b.driverAvatar = DRIVER_AVATARS[b.driverName];
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
        }
      } catch (e) {
        // ignore parse error
      }
    }
  }

  seedInitialBookings();

  // Price Calculation Engine
  window.calculateBookingQuote = function (params) {
    const categoryKey = params.category || 'hourly';
    const rateInfo = RATES[categoryKey] || RATES.hourly;
    const hours = Math.max(parseInt(params.hours, 10) || 1, rateInfo.minHours || 1);
    const vehicleKey = params.vehicleType || 'sedan';
    const vehicleExtra = VEHICLE_EXTRAS[vehicleKey] || 0;

    let subtotal = 0;
    if (rateInfo.flat) {
      subtotal = rateInfo.baseRate;
    } else if (categoryKey === 'fullday') {
      subtotal = rateInfo.baseRate;
      if (hours > rateInfo.flatHours) {
        subtotal += (hours - rateInfo.flatHours) * rateInfo.extraRate;
      }
    } else {
      subtotal = (rateInfo.baseRate * hours);
      if (rateInfo.allowance) {
        subtotal += rateInfo.allowance;
      }
    }

    // Vehicle extra charge
    subtotal += vehicleExtra;

    // Addons ($10-$15 each)
    let addonsTotal = 0;
    if (params.addons && Array.isArray(params.addons)) {
      addonsTotal = params.addons.length * 12;
      subtotal += addonsTotal;
    }

    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    return {
      categoryName: rateInfo.name,
      hours: hours,
      baseRate: rateInfo.baseRate,
      vehicleExtra: vehicleExtra,
      addonsTotal: addonsTotal,
      subtotal: subtotal,
      tax: tax,
      total: total
    };
  };

  // Get all bookings from storage
  window.DriveEaseBookings = {
    getAll: function () {
      seedInitialBookings();
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch (e) {
        return [];
      }
    },
    getById: function (id) {
      const list = this.getAll();
      return list.find(b => b.id === id) || null;
    },
    add: function (bookingData) {
      const list = this.getAll();
      const randomId = 'DE-' + Math.floor(10000 + Math.random() * 90000);
      const newBooking = {
        id: randomId,
        status: 'Upcoming',
        paymentStatus: 'Paid',
        driverName: bookingData.driverName || 'Alexander Hayes',
        driverPhone: bookingData.driverPhone || '+1 (555) 782-9921',
        driverAvatar: bookingData.driverAvatar || DRIVER_AVATARS[bookingData.driverName] || DRIVER_AVATARS['Alexander Hayes'],
        driverRating: 4.96,
        ...bookingData
      };
      list.unshift(newBooking);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('bookingsUpdated', { detail: { booking: newBooking } }));
      return newBooking;
    },
    updateStatus: function (id, newStatus) {
      const list = this.getAll();
      const item = list.find(b => b.id === id);
      if (item) {
        item.status = newStatus;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('bookingsUpdated'));
        return true;
      }
      return false;
    }
  };

  // Live Binding for Booking Forms
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Dashboard Booking Wizard Calculator
    const wizardForm = document.getElementById('driverBookingForm');
    if (wizardForm) {
      const categorySelect = document.getElementById('bookingCategory');
      const hoursSelect = document.getElementById('bookingHours');
      const vehicleSelect = document.getElementById('bookingVehicle');
      const addonCheckboxes = wizardForm.querySelectorAll('.addon-checkbox');

      // Pre-populate fields from query params (e.g. from Quick Driver Reservation on Home)
      const urlParams = new URLSearchParams(window.location.search);
      const currentUser = window.DriveEaseAuth ? window.DriveEaseAuth.getCurrentUser() : null;
      const pInput = document.getElementById('pickupLocation');

      if (urlParams.has('pickup')) {
        if (pInput) pInput.value = decodeURIComponent(urlParams.get('pickup'));
      } else if (pInput && !pInput.value && currentUser && currentUser.address) {
        pInput.value = currentUser.address;
      }
      if (urlParams.has('drop')) {
        const dInput = document.getElementById('dropLocation');
        if (dInput) dInput.value = decodeURIComponent(urlParams.get('drop'));
      }
      if (urlParams.has('date')) {
        const dateInput = document.getElementById('bookingDate');
        if (dateInput) dateInput.value = urlParams.get('date');
      }
      if (urlParams.has('time')) {
        const timeInput = document.getElementById('bookingTime');
        if (timeInput) timeInput.value = urlParams.get('time');
      }
      if (urlParams.has('category') && categorySelect) {
        categorySelect.value = urlParams.get('category');
      }
      if (urlParams.has('hours') && hoursSelect) {
        hoursSelect.value = urlParams.get('hours');
      }

      function updateWizardPrice() {
        const selectedAddons = [];
        addonCheckboxes.forEach(cb => {
          if (cb.checked) selectedAddons.push(cb.value);
        });

        const quote = window.calculateBookingQuote({
          category: categorySelect ? categorySelect.value : 'hourly',
          hours: hoursSelect ? hoursSelect.value : 4,
          vehicleType: vehicleSelect ? vehicleSelect.value : 'sedan',
          addons: selectedAddons
        });

        const elSubtotal = document.getElementById('priceSubtotal');
        const elTax = document.getElementById('priceTax');
        const elTotal = document.getElementById('priceTotal');
        const elEstNotice = document.getElementById('estimatedHoursNotice');

        if (elSubtotal) elSubtotal.textContent = '$' + quote.subtotal.toFixed(2);
        if (elTax) elTax.textContent = '$' + quote.tax.toFixed(2);
        if (elTotal) elTotal.textContent = '$' + quote.total.toFixed(2);
        if (elEstNotice) elEstNotice.textContent = `${quote.hours} hrs @ ${quote.categoryName.replace(/ Service$/i, '')}`;
      }

      if (categorySelect) categorySelect.addEventListener('change', updateWizardPrice);
      if (hoursSelect) hoursSelect.addEventListener('change', updateWizardPrice);
      if (vehicleSelect) vehicleSelect.addEventListener('change', updateWizardPrice);
      addonCheckboxes.forEach(cb => cb.addEventListener('change', updateWizardPrice));

      // Trigger initial calculation
      updateWizardPrice();

      // Submit Booking Wizard
      wizardForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const pickup = document.getElementById('pickupLocation')?.value.trim();
        const drop = document.getElementById('dropLocation')?.value.trim();
        const date = document.getElementById('bookingDate')?.value;
        const time = document.getElementById('bookingTime')?.value;
        const category = categorySelect?.value || 'hourly';
        const hours = hoursSelect?.value || 4;
        const vehicle = vehicleSelect?.value || 'sedan';
        const notes = document.getElementById('specialNotes')?.value.trim();

        if (!pickup || !drop || !date || !time) {
          window.showToast('Missing Details', 'Please complete pickup, drop location, date, and start time.', 'error');
          return;
        }

        const selectedAddons = [];
        addonCheckboxes.forEach(cb => {
          if (cb.checked) selectedAddons.push(cb.value);
        });

        const quote = window.calculateBookingQuote({
          category, hours, vehicleType: vehicle, addons: selectedAddons
        });

        const currentUser = window.DriveEaseAuth ? window.DriveEaseAuth.getCurrentUser() : null;

        const newBooking = window.DriveEaseBookings.add({
          customerName: currentUser ? currentUser.fullName : 'Alex Morgan',
          category: category,
          categoryName: quote.categoryName,
          pickupLocation: pickup,
          dropLocation: drop,
          date: date,
          time: time,
          hours: parseInt(hours, 10),
          vehicleType: vehicle,
          vehicleName: vehicle === 'luxury' ? 'Mercedes S-Class' : (vehicle === 'suv' ? 'Cadillac Escalade' : 'Premium Sedan'),
          addons: selectedAddons,
          subtotal: quote.subtotal,
          tax: quote.tax,
          totalAmount: quote.total,
          specialInstructions: notes || 'Standard professional driver assignment.'
        });

        window.showToast('Booking Confirmed!', `Driver booking #${newBooking.id} has been reserved. Redirecting to Track Driver...`, 'success', 4000);
        setTimeout(() => {
          window.location.href = `driver-tracking.html?id=${newBooking.id}`;
        }, 1200);
      });
    }

    // 2. Quick Booking Form (on Home 1 & Home 2)
    const quickBookingForm = document.getElementById('quickBookingForm');
    if (quickBookingForm) {
      quickBookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pickup = document.getElementById('quickPickup')?.value.trim();
        const drop = document.getElementById('quickDrop')?.value.trim();
        const date = document.getElementById('quickDate')?.value;
        const time = document.getElementById('quickTime')?.value;
        const category = document.getElementById('quickCategory')?.value || 'hourly';
        const hours = document.getElementById('quickHours')?.value || 4;

        if (!pickup || !drop || !date) {
          window.showToast('Required Fields', 'Please enter pickup location, destination, and preferred date.', 'warning');
          return;
        }

        // Redirect to booking dashboard with query params
        const params = new URLSearchParams({
          pickup: encodeURIComponent(pickup),
          drop: encodeURIComponent(drop),
          date: date,
          time: time || '10:00',
          category: category,
          hours: hours
        });

        window.location.href = `dashboard/book-driver.html?${params.toString()}`;
      });
    }
  });
})();
