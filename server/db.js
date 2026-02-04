import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./clinic.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT,
      name TEXT,
      email TEXT UNIQUE,
      role TEXT,
      password TEXT
    )`);

        // Appointments Table
        db.run(`CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patientId TEXT,
      patientName TEXT,
      age INTEGER,
      gender TEXT,
      phone TEXT,
      symptoms TEXT,
      urgencyScale INTEGER,
      triageLevel TEXT,
      triageScore REAL,
      timeSlot TEXT,
      doctorId TEXT,
      registeredAt TEXT,
      isOffline INTEGER
    )`);
    });
}

export default db;
