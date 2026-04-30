let currentHotel = null;
let hotels = [];

// Load hotels on page load
loadHotels();

async function loadHotels() {
    try {
        const response = await fetch('/api/hotels');
        hotels = await response.json();
        displayHotels(hotels);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayHotels(hotelsList) {
    const grid = document.getElementById('hotelsGrid');
    if (!hotelsList.length) {
        grid.innerHTML = '<p style="text-align:center">No hotels found</p>';
        return;
    }
    
    grid.innerHTML = hotelsList.map(hotel => `
        <div class="hotel-card" onclick="openBooking(${hotel.id})">
            <img src="${hotel.image}" alt="${hotel.name}">
            <div class="hotel-info">
                <h3>${hotel.name}</h3>
                <div class="hotel-location">
                    <i class="fas fa-map-marker-alt"></i> ${hotel.location}
                </div>
                <div class="rating">
                    ${'★'.repeat(Math.floor(hotel.rating))}${hotel.rating % 1 ? '½' : ''}
                    <span style="color:#666">(${hotel.rating})</span>
                </div>
                <div class="hotel-price">$${hotel.price} / night</div>
                <div>Available: ${hotel.available} rooms</div>
            </div>
        </div>
    `).join('');
}

async function openBooking(hotelId) {
    const response = await fetch(`/api/hotels/${hotelId}`);
    currentHotel = await response.json();
    
    document.getElementById('modalHotelInfo').innerHTML = `
        <h3>${currentHotel.name}</h3>
        <p>${currentHotel.location} | $${currentHotel.price}/night</p>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    document.getElementById('checkIn').value = today;
    document.getElementById('checkOut').value = tomorrow;
    
    // Calculate total
    calculateTotal();
}

function calculateTotal() {
    const checkIn = new Date(document.getElementById('checkIn').value);
    const checkOut = new Date(document.getElementById('checkOut').value);
    const guests = parseInt(document.getElementById('guests').value) || 1;
    
    if (checkOut > checkIn) {
        const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
        const total = nights * currentHotel.price;
        document.getElementById('totalPrice').innerHTML = `Total: $${total} (${nights} nights)`;
    } else {
        document.getElementById('totalPrice').innerHTML = 'Total: $0';
    }
}

// Calculate total when dates change
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', bookHotel);
        document.getElementById('checkIn')?.addEventListener('change', calculateTotal);
        document.getElementById('checkOut')?.addEventListener('change', calculateTotal);
        document.getElementById('guests')?.addEventListener('change', calculateTotal);
    }
});

async function bookHotel(e) {
    e.preventDefault();
    
    const booking = {
        hotelId: currentHotel.id,
        hotelName: currentHotel.name,
        checkIn: document.getElementById('checkIn').value,
        checkOut: document.getElementById('checkOut').value,
        guests: parseInt(document.getElementById('guests').value),
        total: calculateTotalAmount(),
        customerName: document.getElementById('customerName').value,
        customerEmail: document.getElementById('customerEmail').value
    };
    
    try {
        const response = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Booking confirmed! Your booking ID: ' + result.bookingId);
            closeModal();
            loadHotels(); // Refresh availability
        }
    } catch (error) {
        alert('Booking failed. Please try again.');
    }
}

function calculateTotalAmount() {
    const checkIn = new Date(document.getElementById('checkIn').value);
    const checkOut = new Date(document.getElementById('checkOut').value);
    const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
    return nights * currentHotel.price;
}

async function searchHotels() {
    const location = document.getElementById('searchLocation').value;
    const response = await fetch(`/api/hotels?location=${location}`);
    const filtered = await response.json();
    displayHotels(filtered);
}

async function viewBookings() {
    const email = document.getElementById('emailInput').value;
    if (!email) {
        alert('Please enter your email');
        return;
    }
    
    const response = await fetch(`/api/bookings/${email}`);
    const bookings = await response.json();
    
    const listDiv = document.getElementById('bookingsList');
    
    if (!bookings.length) {
        listDiv.innerHTML = '<p>No bookings found</p>';
        return;
    }
    
    listDiv.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <h3>${booking.hotelName}</h3>
            <p><strong>Check-in:</strong> ${booking.checkIn}</p>
            <p><strong>Check-out:</strong> ${booking.checkOut}</p>
            <p><strong>Guests:</strong> ${booking.guests}</p>
            <p><strong>Total:</strong> $${booking.total}</p>
            <p><strong>Booking ID:</strong> ${booking.id}</p>
        </div>
    `).join('');
}

function showPage(page) {
    if (page === 'home') {
        document.getElementById('homePage').style.display = 'block';
        document.getElementById('bookingsPage').style.display = 'none';
        loadHotels();
    } else {
        document.getElementById('homePage').style.display = 'none';
        document.getElementById('bookingsPage').style.display = 'block';
    }
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('bookingForm').reset();
}
