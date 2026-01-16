"""
Mino API Integration Script
Extracts data from competitor websites and monitors pricing changes daily.
"""

import os
import json
import time
import requests
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path
import sqlite3
from contextlib import contextmanager

# Configure logging
# On Vercel, filesystem is read-only except /tmp, so we conditionally add FileHandler
handlers = [logging.StreamHandler()]

# Try to add file handler - use /tmp/ on Vercel (writable), or current dir locally
# Check if we're on Vercel (read-only filesystem) or can write to current directory
is_vercel = os.getenv('VERCEL') == '1' or not os.access('.', os.W_OK)
log_file_path = '/tmp/mino_monitor.log' if is_vercel else 'mino_monitor.log'

try:
    handlers.append(logging.FileHandler(log_file_path))
except (OSError, PermissionError):
    # If file handler fails (e.g., on Vercel /var/task), just use console logging
    pass

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=handlers
)
logger = logging.getLogger(__name__)

# Configuration
MINO_API_KEY = os.getenv('MINO_API_KEY', 'sk-mino-kyyCNJHechyq8fR9q22EQFxs5TE3IcXf')
MINO_API_URL = "https://mino.ai/v1/automation/run-sse"
DB_PATH = os.getenv('DB_PATH', 'price_monitor.db')
CONFIG_FILE = 'config.json'

# API Headers
HEADERS = {
    "X-API-Key": MINO_API_KEY,
    "Content-Type": "application/json"
}


class MinoAPIClient:
    """Client for interacting with Mino Automation API."""
    
    def __init__(self, api_key: str, api_url: str = MINO_API_URL):
        self.api_key = api_key
        self.api_url = api_url
        self.headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        }
    
    def extract_data(self, url: str, goal: str, max_retries: int = 3) -> Optional[Dict[str, Any]]:
        """
        Extract data from a URL using Mino API.
        
        Args:
            url: The URL to extract data from
            goal: Natural language description of what to extract
            max_retries: Maximum number of retry attempts
            
        Returns:
            Dictionary containing extracted data, or None if extraction failed
        """
        payload = {
            "url": url,
            "goal": goal
        }
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Extracting data from {url} (attempt {attempt + 1}/{max_retries})")
                response = requests.post(
                    self.api_url,
                    headers=self.headers,
                    json=payload,
                    stream=True,
                    timeout=120
                )
                
                if response.status_code != 200:
                    logger.error(f"Mino API error: {response.status_code} - {response.text}")
                    if attempt < max_retries - 1:
                        time.sleep(2 ** attempt)  # Exponential backoff
                        continue
                    return None
                
                # Parse SSE stream
                result_json = None
                for line in response.iter_lines(decode_unicode=True):
                    if not line:
                        continue
                    
                    # SSE format: "data: {...}"
                    if line.startswith("data: "):
                        line = line[6:]  # Remove "data: " prefix
                    
                    try:
                        data = json.loads(line)
                        if data.get("status") == "COMPLETED":
                            result_json = data.get("resultJson")
                            if result_json:
                                logger.info(f"Successfully extracted data from {url}")
                                return result_json
                        elif data.get("status") == "FAILED":
                            error_msg = data.get("error", "Unknown error")
                            logger.error(f"Extraction failed for {url}: {error_msg}")
                            return None
                    except (json.JSONDecodeError, KeyError) as e:
                        logger.debug(f"Parsing line: {line}, error: {e}")
                        continue
                
                if result_json is None:
                    logger.warning(f"No result found in SSE stream for {url}")
                    if attempt < max_retries - 1:
                        time.sleep(2 ** attempt)
                        continue
                
                return result_json
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Request error for {url}: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                return None
        
        return None


class PriceMonitor:
    """Monitor and store pricing data from competitor websites."""
    
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self.mino_client = MinoAPIClient(MINO_API_KEY)
        self._init_database()
    
    @contextmanager
    def _get_db_connection(self):
        """Context manager for database connections."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            conn.close()
    
    def _init_database(self):
        """Initialize database schema."""
        with self._get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Competitors table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS competitors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    url TEXT NOT NULL UNIQUE,
                    extraction_goal TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Price data table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS price_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    competitor_id INTEGER NOT NULL,
                    url TEXT NOT NULL,
                    price TEXT,
                    currency TEXT,
                    extracted_data TEXT,
                    extracted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (competitor_id) REFERENCES competitors(id)
                )
            ''')
            
            # Price changes log
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS price_changes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    competitor_id INTEGER NOT NULL,
                    url TEXT NOT NULL,
                    old_price TEXT,
                    new_price TEXT,
                    change_percentage REAL,
                    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (competitor_id) REFERENCES competitors(id)
                )
            ''')
            
            # Create indexes for better query performance
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_price_data_competitor 
                ON price_data(competitor_id, extracted_at DESC)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_price_changes_competitor 
                ON price_changes(competitor_id, detected_at DESC)
            ''')
            
            logger.info("Database initialized successfully")
    
    def add_competitor(self, name: str, url: str, extraction_goal: str = None):
        """
        Add a competitor to monitor.
        
        Args:
            name: Competitor name
            url: URL to monitor
            extraction_goal: Custom extraction goal (optional)
        """
        default_goal = (
            "Extract the current price of the product from this page. "
            "Return a JSON object with 'price' (as string), 'currency' (if available), "
            "and any other relevant product information like 'title', 'availability', etc."
        )
        
        goal = extraction_goal or default_goal
        
        with self._get_db_connection() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute('''
                    INSERT INTO competitors (name, url, extraction_goal)
                    VALUES (?, ?, ?)
                ''', (name, url, goal))
                logger.info(f"Added competitor: {name} ({url})")
            except sqlite3.IntegrityError:
                logger.warning(f"Competitor with URL {url} already exists")
    
    def get_competitors(self) -> List[Dict]:
        """Get all active competitors."""
        with self._get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, name, url, extraction_goal 
                FROM competitors 
                WHERE is_active = 1
            ''')
            return [dict(row) for row in cursor.fetchall()]
    
    def get_latest_price(self, competitor_id: int) -> Optional[Dict]:
        """Get the most recent price data for a competitor."""
        with self._get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT price, currency, extracted_data, extracted_at
                FROM price_data
                WHERE competitor_id = ?
                ORDER BY extracted_at DESC
                LIMIT 1
            ''', (competitor_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def store_price_data(self, competitor_id: int, url: str, extracted_data: Dict):
        """
        Store extracted price data.
        
        Args:
            competitor_id: ID of the competitor
            url: URL that was scraped
            extracted_data: Data extracted from Mino API
        """
        price = extracted_data.get('price', '')
        currency = extracted_data.get('currency', '')
        extracted_json = json.dumps(extracted_data)
        
        with self._get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO price_data (competitor_id, url, price, currency, extracted_data)
                VALUES (?, ?, ?, ?, ?)
            ''', (competitor_id, url, price, currency, extracted_json))
            
            logger.info(f"Stored price data for competitor_id {competitor_id}: {price} {currency}")
    
    def detect_price_change(self, competitor_id: int, new_price: str, old_price: str) -> bool:
        """
        Detect and log price changes.
        
        Returns:
            True if price changed, False otherwise
        """
        if old_price is None:
            return False
        
        # Normalize prices for comparison (remove currency symbols, whitespace)
        def normalize_price(price_str):
            if not price_str:
                return None
            # Remove common currency symbols and whitespace
            cleaned = ''.join(c for c in price_str if c.isdigit() or c in '.,-')
            try:
                # Try to extract numeric value
                return float(cleaned.replace(',', ''))
            except ValueError:
                return None
        
        old_norm = normalize_price(old_price)
        new_norm = normalize_price(new_price)
        
        if old_norm is None or new_norm is None:
            return old_price != new_price  # String comparison fallback
        
        if old_norm != new_norm:
            change_percentage = ((new_norm - old_norm) / old_norm) * 100 if old_norm > 0 else 0
            
            with self._get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT url FROM competitors WHERE id = ?
                ''', (competitor_id,))
                url = cursor.fetchone()[0]
                
                cursor.execute('''
                    INSERT INTO price_changes (competitor_id, url, old_price, new_price, change_percentage)
                    VALUES (?, ?, ?, ?, ?)
                ''', (competitor_id, url, old_price, new_price, change_percentage))
            
            logger.info(
                f"Price change detected for competitor_id {competitor_id}: "
                f"{old_price} → {new_price} ({change_percentage:+.2f}%)"
            )
            return True
        
        return False
    
    def monitor_all_competitors(self, delay_between_requests: float = 2.0):
        """
        Monitor all active competitors and extract pricing data.
        
        Args:
            delay_between_requests: Seconds to wait between API requests
        """
        competitors = self.get_competitors()
        
        if not competitors:
            logger.warning("No active competitors found. Add competitors first.")
            return
        
        logger.info(f"Starting monitoring for {len(competitors)} competitor(s)")
        
        for competitor in competitors:
            competitor_id = competitor['id']
            name = competitor['name']
            url = competitor['url']
            goal = competitor['extraction_goal']
            
            try:
                logger.info(f"Processing {name} ({url})")
                
                # Extract data using Mino API
                extracted_data = self.mino_client.extract_data(url, goal)
                
                if extracted_data is None:
                    logger.error(f"Failed to extract data from {url}")
                    continue
                
                # Get previous price for comparison
                latest = self.get_latest_price(competitor_id)
                old_price = latest['price'] if latest else None
                new_price = extracted_data.get('price', '')
                
                # Store new price data
                self.store_price_data(competitor_id, url, extracted_data)
                
                # Detect and log price changes
                if old_price:
                    self.detect_price_change(competitor_id, new_price, old_price)
                else:
                    logger.info(f"First price recorded for {name}: {new_price}")
                
                # Rate limiting
                if delay_between_requests > 0:
                    time.sleep(delay_between_requests)
                    
            except Exception as e:
                logger.error(f"Error processing {name} ({url}): {e}", exc_info=True)
                continue
        
        logger.info("Monitoring cycle completed")
    
    def get_price_history(self, competitor_id: int, limit: int = 30) -> List[Dict]:
        """Get price history for a competitor."""
        with self._get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT price, currency, extracted_at
                FROM price_data
                WHERE competitor_id = ?
                ORDER BY extracted_at DESC
                LIMIT ?
            ''', (competitor_id, limit))
            return [dict(row) for row in cursor.fetchall()]
    
    def get_recent_changes(self, days: int = 7) -> List[Dict]:
        """Get recent price changes."""
        with self._get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT 
                    c.name,
                    pc.url,
                    pc.old_price,
                    pc.new_price,
                    pc.change_percentage,
                    pc.detected_at
                FROM price_changes pc
                JOIN competitors c ON pc.competitor_id = c.id
                WHERE pc.detected_at >= datetime('now', '-' || ? || ' days')
                ORDER BY pc.detected_at DESC
            ''', (days,))
            return [dict(row) for row in cursor.fetchall()]


def load_config(config_file: str = CONFIG_FILE) -> Dict:
    """Load configuration from JSON file."""
    config_path = Path(config_file)
    if config_path.exists():
        with open(config_path, 'r') as f:
            return json.load(f)
    return {}


def main():
    """Main execution function."""
    # Load configuration
    config = load_config()
    
    # Initialize monitor
    monitor = PriceMonitor()
    
    # Add competitors from config if available
    competitors = config.get('competitors', [])
    for comp in competitors:
        monitor.add_competitor(
            name=comp.get('name', 'Unknown'),
            url=comp['url'],
            extraction_goal=comp.get('extraction_goal')
        )
    
    # Run monitoring
    delay = config.get('delay_between_requests', 2.0)
    monitor.monitor_all_competitors(delay_between_requests=delay)
    
    # Print summary
    recent_changes = monitor.get_recent_changes(days=1)
    if recent_changes:
        print("\n=== Recent Price Changes (Last 24 Hours) ===")
        for change in recent_changes:
            print(
                f"{change['name']}: {change['old_price']} → {change['new_price']} "
                f"({change['change_percentage']:+.2f}%)"
            )


if __name__ == "__main__":
    main()

