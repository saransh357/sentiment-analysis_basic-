function seeReview(product_id) {
    // Clear existing review content
    document.getElementById('review-list').innerHTML = '';

    fetch(`/get_reviews/${product_id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('review-section').style.display = 'block';

            let positiveCount = 0;
            let negativeCount = 0;
            let allReviews = data.map(review => review.review).join('\n\n');

            // Word frequency analysis
            let wordFrequency = getWordFrequency(allReviews);

            // Display word frequency graph
            displayWordFrequencyGraph(wordFrequency);

            // Calculate recommendation rating
            let recommendation = calculateRecommendation(data);

            // Display recommendation
            displayRecommendation(recommendation);

            // Book categorization
            let categorization = categorizeReviews(data);

            // Display book categorization
            displayCategorization(categorization);

            let moreDetailsButton = document.createElement('button');
            moreDetailsButton.textContent = 'More Details';
            moreDetailsButton.addEventListener('click', function() {
                let newTab = window.open();
                newTab.document.write(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>More Details</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 20px;
                            }
                            pre {
                                white-space: pre-wrap;
                                word-wrap: break-word;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>All Reviews</h1>
                        <pre>${allReviews}</pre>
                        <h2>Word Frequency Analysis</h2>
                        <canvas id="wordFrequencyChart" width="500" height="500"></canvas>
                        <h2>Recommendation</h2>
                        <p>${recommendation}</p>
                        <h2>Book Categorization</h2>
                        <p>${categorization}</p>
                    </body>
                    </html>
                `);
            });

            document.getElementById('review-list').appendChild(moreDetailsButton);
        });
}

function getWordFrequency(text) {
    // Perform word frequency analysis
    let words = text.toLowerCase().match(/\b\w+\b/g);
    let wordFrequency = {};
    if (words) {
        words.forEach(word => {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
    }
    return wordFrequency;
}

function displayWordFrequencyGraph(wordFrequency) {
    // Display word frequency graph using Chart.js
    let ctx = document.getElementById('wordFrequencyChart').getContext('2d');
    let sortedWords = Object.keys(wordFrequency).sort((a, b) => wordFrequency[b] - wordFrequency[a]);
    let topWords = sortedWords.slice(0, 10);
    let frequencies = topWords.map(word => wordFrequency[word]);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topWords,
            datasets: [{
                label: 'Word Frequency',
                data: frequencies,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

function calculateRecommendation(reviews) {
    // Calculate recommendation based on sentiment analysis
    let totalScore = reviews.reduce((acc, curr) => acc + (curr.sentiment === 'positive' ? 1 : -1), 0);
    if (totalScore > 0) {
        return 'Highly recommended!';
    } else if (totalScore < 0) {
        return 'Not recommended.';
    } else {
        return 'Neutral recommendation.';
    }
}

function categorizeReviews(reviews) {
    // Categorize reviews based on content
    let sadCount = 0;
    let mysteriousCount = 0;
    reviews.forEach(review => {
        if (review.review.toLowerCase().includes('sad')) {
            sadCount++;
        }
        if (review.review.toLowerCase().includes('mystery')) {
            mysteriousCount++;
        }
    });
    if (sadCount > mysteriousCount) {
        return 'This book is categorized as sad.';
    } else if (mysteriousCount > sadCount) {
        return 'This book is categorized as mysterious.';
    } else {
        return 'This book does not fall into a specific category.';
    }
}

function displayRecommendation(recommendation) {
    // Display recommendation
    let recommendationDiv = document.createElement('div');
    recommendationDiv.innerHTML = `<h2>Recommendation</h2><p>${recommendation}</p>`;
    document.getElementById('review-list').appendChild(recommendationDiv);
}

function displayCategorization(categorization) {
    // Display book categorization
    let categorizationDiv = document.createElement('div');
    categorizationDiv.innerHTML = `<h2>Book Categorization</h2><p>${categorization}</p>`;
    document.getElementById('review-list').appendChild(categorizationDiv);
}

function closeReview() {
    document.getElementById('review-section').style.display = 'none';
}

function giveReview(product_id) {
    document.getElementById('give-review-section').style.display = 'block';
    document.getElementById('give-review-section').dataset.productId = product_id;
}

function closeGiveReview() {
    document.getElementById('give-review-section').style.display = 'none';
}

function submitReview() {
    let product_id = document.getElementById('give-review-section').dataset.productId;
    let reviewText = document.getElementById('review-text').value;

    fetch('/add_review', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id, review: reviewText })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            closeGiveReview();
            alert('Review submitted successfully!');
        }
    });
}
