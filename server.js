const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Hotel data
let hotels = [
    {
        id: 1,
        name: "Grand Plaza Hotel",
        location: "New York",
        price: 199,
        rating: 4.8,
        available: 10,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945"
    },
    {
        id: 2,
        name: "Beachfront Resort",
        location: "Miami",
        price: 249,
        rating: 4.6,
        available: 5,
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"
    },
    {
        id: 3,
        name: "Mountain View Lodge",
        location: "Denver",
        price: 299,
        rating: 4.9,
        available: 3,
        image: "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a"
    },
    {
        id: 4,
        name: "City Center Inn",
        location: "Chicago",
        price: 149,
        rating: 4.4,
        available: 8,
        image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa"
    }
];

let bookings = [];

// API Routes
app.get('/api/hotels', (req, res) => {
    let result = hotels;
    if (req.query.location) {
        result = hotels.filter(h => h.location.toLowerCase().includes(req.query.location.toLowerCase()));
    }
    res.json(result);
});

app.get('/api/hotels/:id', (req, res) => {
    const hotel = hotels.find(h => h.id === parseInt(req.params.id));
    res.json(hotel);
});

app.post('/api/book', (req, res) => {
    const { hotelId, hotelName, checkIn, checkOut, guests, total, customerName, customerEmail } = req.body;
    
    const bookingId = Date.now().toString();
    const booking = {
        id: bookingId,
        hotelId,
        hotelName,
        checkIn,
        checkOut,
        guests,
        total,
        customerName,
        customerEmail,
        date: new Date().toISOString()
    };
    
    bookings.push(booking);
    
    // Update availability
    const hotel = hotels.find(h => h.id === hotelId);
    if (hotel) hotel.available--;
    
    res.json({ success: true, bookingId });
});

app.get('/api/bookings/:email', (req, res) => {
    const userBookings = bookings.filter(b => b.customerEmail === req.params.email);
    res.json(userBookings);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hotel app running on http://localhost:${PORT}`);
});
