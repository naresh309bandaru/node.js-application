const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Hotel data
const hotels = [
    {
        id: 1,
        name: "Grand Plaza Hotel",
        location: "New York, NY",
        price: 199,
        rating: 4.8,
        available: 10,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        amenities: ["Free WiFi", "Pool", "Gym"]
    },
    {
        id: 2,
        name: "Beachfront Resort",
        location: "Miami, FL",
        price: 249,
        rating: 4.6,
        available: 5,
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
        amenities: ["Beach Access", "Pool", "Spa"]
    },
    {
        id: 3,
        name: "Mountain View Lodge",
        location: "Denver, CO",
        price: 299,
        rating: 4.9,
        available: 3,
        image: "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a",
        amenities: ["Mountain View", "Hot Tub", "Fireplace"]
    },
    {
        id: 4,
        name: "City Center Inn",
        location: "Chicago, IL",
        price: 149,
        rating: 4.4,
        available: 8,
        image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa",
        amenities: ["Free WiFi", "Business Center", "Restaurant"]
    }
];

// Store bookings in memory
let bookings = [];
let bookingId = 1;

// API Routes
app.get('/api/hotels', (req, res) => {
    let result = hotels;
    if (req.query.location) {
        result = hotels.filter(h => 
            h.location.toLowerCase().includes(req.query.location.toLowerCase())
        );
    }
    res.json(result);
});

app.get('/api/hotels/:id', (req, res) => {
    const hotel = hotels.find(h => h.id === parseInt(req.params.id));
    if (hotel) {
        res.json(hotel);
    } else {
        res.status(404).json({ error: "Hotel not found" });
    }
});

app.post('/api/book', (req, res) => {
    const { hotelId, hotelName, checkIn, checkOut, guests, total, customerName, customerEmail, customerPhone } = req.body;
    
    const newBooking = {
        id: bookingId++,
        hotelId,
        hotelName,
        checkIn,
        checkOut,
        guests,
        total,
        customerName,
        customerEmail,
        customerPhone,
        status: "confirmed",
        bookingDate: new Date().toISOString()
    };
    
    bookings.push(newBooking);
    
    // Update hotel availability
    const hotel = hotels.find(h => h.id === hotelId);
    if (hotel && hotel.available > 0) {
        hotel.available--;
    }
    
    res.json({ 
        success: true, 
        bookingId: newBooking.id,
        message: "Booking confirmed successfully!"
    });
});

app.get('/api/bookings/:email', (req, res) => {
    const userBookings = bookings.filter(b => b.customerEmail === req.params.email);
    res.json(userBookings);
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve HTML for all routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏨 Hotel Booking App is running!`);
    console.log(`📱 Access at: http://localhost:${PORT}`);
    console.log(`🌍 Health check: http://localhost:${PORT}/api/health`);
});
