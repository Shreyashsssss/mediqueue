import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import db from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Helper to run DB queries as promises
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// --- Routes ---

// Register User
app.post('/api/register', async (req, res) => {
    const { id, username, name, email, role, password } = req.body;
    try {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        await run(
            `INSERT INTO users (id, username, name, email, role, password) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, username, name, email, role, hashedPassword]
        );
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login User
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await get(`SELECT * FROM users WHERE email = ?`, [email]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // For staff/doctor/patient
        if (user.password) {
            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Return user without password
        const { password: _, ...userWithoutPass } = user;
        res.json(userWithoutPass);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Appointments (or filter by patient)
app.get('/api/appointments', async (req, res) => {
    try {
        const rows = await all(`SELECT * FROM appointments`);
        // Convert integer boolean back to boolean if needed, though frontend might handle
        const apps = rows.map(r => ({
            ...r,
            isOffline: !!r.isOffline
        }));
        res.json(apps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Appointment
app.post('/api/appointments', async (req, res) => {
    const appData = req.body;
    try {
        await run(
            `INSERT INTO appointments (
                id, patientId, patientName, age, gender, phone, symptoms, 
                urgencyScale, triageLevel, triageScore, timeSlot, doctorId, 
                registeredAt, isOffline
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                appData.id, appData.patientId, appData.patientName, appData.age,
                appData.gender, appData.phone, appData.symptoms, appData.urgencyScale,
                appData.triageLevel, appData.triageScore, appData.timeSlot,
                appData.doctorId, appData.registeredAt, appData.isOffline ? 1 : 0
            ]
        );
        res.status(201).json(appData);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Remove Appointment
app.delete('/api/appointments/:id', async (req, res) => {
    try {
        await run(`DELETE FROM appointments WHERE id = ?`, [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve static files from the React app
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets from 'dist' (one level up from server directory)
app.use(express.static(path.join(__dirname, '../dist')));

// Handle all other routes by serving the index.html for React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
