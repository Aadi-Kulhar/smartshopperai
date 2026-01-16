# Smart Shopping - AI-Powered Price Comparison Platform

> Deployed on Vercel | Powered by Mino AI

This project integrates with the Mino Automation API to provide an intelligent shopping assistant platform. Users can search for products using natural language or image uploads, and the AI finds the best prices across multiple retailers.

## Features

### Backend (Price Monitoring)
- 🔍 Extract pricing data from multiple competitor websites
- 📊 Monitor and detect price changes automatically
- 💾 Store historical price data in SQLite database
- 📈 Track price change percentages
- 🔄 Reusable and configurable architecture
- 📝 Comprehensive logging

### Dashboard (MVP)
- 🔤 **Text Search**: Natural language product search
- 📷 **Image Search**: Upload product images to find similar items
- 🛍️ **Product Cards**: Display products with price, seller, availability, and ratings
- 🔄 **Sorting & Filtering**: Sort by price, rating, confidence; filter by stock, shipping, etc.
- 📊 **Comparison View**: Side-by-side comparison of up to 3 products
- 📱 **Responsive Design**: Mobile-first, works on all devices
- ⚡ **Real-time Search**: Live results from Mino API integration

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Dashboard

Start the Flask web application:

```bash
python app.py
```

The dashboard will be available at `http://localhost:8080`

**Dashboard Features:**
- **Text Search**: Enter a natural language description (e.g., "Wireless Bluetooth headphones with noise cancellation")
- **Image Search**: Upload a product image to find similar items
- **Product Results**: View products with prices, sellers, availability, and ratings
- **Sort & Filter**: Organize results by price, rating, or match confidence
- **Compare Products**: Select up to 3 products for side-by-side comparison

### 3. Configure Competitors

Edit `config.json` to add your competitor URLs:

```json
{
  "competitors": [
    {
      "name": "Competitor Name",
      "url": "https://competitor.com/product/123",
      "extraction_goal": "Extract the current price..."
    }
  ]
}
```

The `extraction_goal` field is optional. If not provided, a default goal will be used that extracts price, currency, and other product information.

### 4. Set API Key (Optional)

The script uses the API key provided, but you can also set it as an environment variable:

```bash
export MINO_API_KEY="sk-mino-kyyCNJHechyq8fR9q22EQFxs5TE3IcXf"
```

## Usage

### Run Once

```bash
python mino_integration.py
```

This will:
1. Extract data from all competitors in `config.json`
2. Store the results in the database
3. Detect and log any price changes
4. Display a summary of recent changes

### Programmatic Usage

```python
from mino_integration import PriceMonitor

# Initialize monitor
monitor = PriceMonitor()

# Add a competitor
monitor.add_competitor(
    name="Amazon Product",
    url="https://amazon.com/product/xyz",
    extraction_goal="Extract the price and availability..."
)

# Run monitoring
monitor.monitor_all_competitors()

# Get price history
history = monitor.get_price_history(competitor_id=1, limit=30)

# Get recent changes
changes = monitor.get_recent_changes(days=7)
```

## Database Schema

The script creates three tables:

1. **competitors**: Stores competitor information
   - id, name, url, extraction_goal, is_active, created_at, updated_at

2. **price_data**: Stores extracted price data
   - id, competitor_id, url, price, currency, extracted_data (JSON), extracted_at

3. **price_changes**: Logs detected price changes
   - id, competitor_id, url, old_price, new_price, change_percentage, detected_at

## Daily Monitoring

### Using Cron (Linux/Mac)

Add to your crontab (`crontab -e`):

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/TinyFish && /usr/bin/python3 mino_integration.py >> /var/log/mino_monitor.log 2>&1
```

### Using Task Scheduler (Windows)

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to "Daily" at your desired time
4. Set action to run: `python C:\path\to\TinyFish\mino_integration.py`

### Using Python Schedule (Alternative)

Create a scheduler script:

```python
import schedule
import time
from mino_integration import main

# Schedule daily at 2 AM
schedule.every().day.at("02:00").do(main)

while True:
    schedule.run_pending()
    time.sleep(60)
```

## Customization

### Custom Extraction Goals

You can customize what data to extract by modifying the `extraction_goal` field:

```json
{
  "extraction_goal": "Extract the product title, current price, original price (if on sale), availability status, and customer rating. Return as JSON."
}
```

### Database Location

Change the database path:

```python
monitor = PriceMonitor(db_path="custom/path/price_data.db")
```

Or set environment variable:

```bash
export DB_PATH="custom/path/price_data.db"
```

### Rate Limiting

Adjust the delay between requests in `config.json`:

```json
{
  "delay_between_requests": 3.0
}
```

## Logging

Logs are written to:
- Console output
- `mino_monitor.log` file

Log levels include INFO, WARNING, and ERROR messages for monitoring and debugging.

## Error Handling

The script includes:
- Automatic retries with exponential backoff
- Graceful error handling for individual competitors
- Database transaction rollback on errors
- Comprehensive error logging

## API Documentation

For more details about the Mino API, visit: https://docs.mino.ai

## Notes

- The script uses SQLite by default for simplicity. For production, consider PostgreSQL or MySQL.
- Rate limiting is built-in to avoid overwhelming the API or target websites.
- The extraction goal uses natural language - be specific about what data you want extracted.
- Price comparison normalizes numeric values but falls back to string comparison if needed.

## Troubleshooting

**No data extracted:**
- Check that the URL is accessible
- Verify the extraction goal is clear
- Check API key is valid
- Review logs for specific error messages

**Database errors:**
- Ensure write permissions in the directory
- Check disk space
- Verify SQLite is available

**API errors:**
- Verify API key is correct
- Check network connectivity
- Review Mino API status
- Check rate limits

