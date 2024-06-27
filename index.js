const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const Sentiment = require('sentiment');
const path = require('path');

const app = express();
const sentiment = new Sentiment();
const db = new sqlite3.Database('./database.db');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        review TEXT,
        sentiment TEXT
    )`);
});

app.get('/get_reviews/:product_id', (req, res) => {
    const productId = req.params.product_id;
    db.all("SELECT review, sentiment FROM reviews WHERE product_id = ?", [productId], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(rows);
        }
    });
});

app.post('/add_review', (req, res) => {
    const { product_id, review } = req.body;
    const result = sentiment.analyze(review);
    const sentimentLabel = result.score >= 0 ? 'positive' : 'negative';

    db.run("INSERT INTO reviews (product_id, review, sentiment) VALUES (?, ?, ?)", [product_id, review, sentimentLabel], (err) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json({ status: 'success' });
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
