"""
Flask web application for AI-Powered Price Comparison Platform
MVP Features: Multi-modal search, product results, seller information
"""

import os
import json
import base64
import logging
import time
import threading
from datetime import datetime
from urllib.parse import urljoin, urlparse
from flask import Flask, render_template, request, jsonify, send_from_directory, Response, stream_with_context
from flask_cors import CORS
from werkzeug.utils import secure_filename
from mino_integration import MinoAPIClient, PriceMonitor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Configuration
MINO_API_KEY = os.getenv('MINO_API_KEY', 'sk-mino-kyyCNJHechyq8fR9q22EQFxs5TE3IcXf')
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Initialize Mino client and price monitor
mino_client = MinoAPIClient(MINO_API_KEY)
price_monitor = PriceMonitor()

# Create upload directory
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('static', exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def create_extraction_goal(query_type, query_data):
    """
    Create extraction goal for Mino API based on query type.
    
    Args:
        query_type: 'text' or 'image'
        query_data: Text query or image description
    """
    if query_type == 'text':
        return (
            f"Search for products matching this description: {query_data}. "
            "On this search results page, extract information for the top 3-5 most relevant products. "
            "For each product, extract: product title, current price (as string with currency symbol), "
            "original price (if on sale/discount), discount percentage (if available), special offers or deals (if any), "
            "seller/retailer name, stock availability status (in stock/out of stock), shipping cost, "
            "seller rating (if available), product image URL, and the product's detail page URL. "
            "Return as a JSON array of objects, each with fields: title, price, original_price, discount_percentage, "
            "offers (array of special offers/deals), currency, seller, availability, shipping_cost, rating, "
            "image_url, product_url, confidence_score. "
            "If this is a search results page, extract multiple products. If it's a product detail page, extract that single product."
        )
    else:  # image
        return (
            f"Identify the product in this image and search for similar products. "
            "On this search results page, extract information for the top 3-5 most similar products. "
            "For each product, extract: product title, current price (as string with currency symbol), "
            "original price (if on sale/discount), discount percentage (if available), special offers or deals (if any), "
            "seller/retailer name, stock availability status, shipping cost, seller rating (if available), "
            "product image URL, and the product's detail page URL. "
            "Return as a JSON array of objects, each with fields: title, price, original_price, discount_percentage, "
            "offers (array of special offers/deals), currency, seller, availability, shipping_cost, rating, "
            "image_url, product_url, confidence_score."
        )


def get_retailer_search_urls(query, query_type='text'):
    """
    Generate search URLs for major retailers based on query.
    
    Args:
        query: Search query string
        query_type: 'text' or 'image'
    
    Returns:
        List of tuples (retailer_name, search_url)
    """
    # URL-encode the query
    encoded_query = query.replace(' ', '+')
    
    retailers = [
        ('Amazon', f"https://www.amazon.com/s?k={encoded_query}"),
        ('eBay', f"https://www.ebay.com/sch/i.html?_nkw={encoded_query}"),
        ('Walmart', f"https://www.walmart.com/search?q={encoded_query}"),
        ('Target', f"https://www.target.com/s?searchTerm={encoded_query}"),
        ('Best Buy', f"https://www.bestbuy.com/site/searchpage.jsp?st={encoded_query}"),
        ('Home Depot', f"https://www.homedepot.com/s/{encoded_query}"),
        ('Etsy', f"https://www.etsy.com/search?q={encoded_query}"),
    ]
    
    return retailers


def parsePrice(price_str):
    """Parse price string to float."""
    if not price_str or price_str == 'N/A':
        return 0
    if isinstance(price_str, (int, float)):
        return float(price_str)
    cleaned = str(price_str).replace(',', '').replace('$', '').replace('€', '').replace('£', '').strip()
    # Remove any non-numeric characters except decimal point
    cleaned = ''.join(c for c in cleaned if c.isdigit() or c == '.')
    try:
        return float(cleaned) if cleaned else 0
    except ValueError:
        return 0


def normalize_product_data(extracted_data, source_url=None):
    """
    Normalize and structure product data from Mino API response.
    Handles both single products and arrays of products.
    
    Args:
        extracted_data: Raw data from Mino API
        source_url: URL that was scraped (optional)
    
    Returns:
        List of normalized product dictionaries
    """
    if isinstance(extracted_data, str):
        try:
            extracted_data = json.loads(extracted_data)
        except json.JSONDecodeError:
            extracted_data = {"raw": extracted_data}
    
    products = []
    
    # Handle array/list of products (most common case for search results)
    if isinstance(extracted_data, list):
        for item in extracted_data:
            if isinstance(item, dict):
                products.append(create_product_dict(item, source_url))
        return products if products else [create_product_dict(extracted_data, source_url)]
    
    # Handle dictionary response
    if isinstance(extracted_data, dict):
        # If it's an array of products in a 'products' or 'results' key
        if 'products' in extracted_data and isinstance(extracted_data['products'], list):
            for item in extracted_data['products']:
                products.append(create_product_dict(item, source_url))
            return products if products else [create_product_dict(extracted_data, source_url)]
        
        if 'results' in extracted_data and isinstance(extracted_data['results'], list):
            for item in extracted_data['results']:
                products.append(create_product_dict(item, source_url))
            return products if products else [create_product_dict(extracted_data, source_url)]
        
        # If it's a single product object
        if 'title' in extracted_data or 'price' in extracted_data:
            return [create_product_dict(extracted_data, source_url)]
    
    # Fallback: try to create a product from available data
    return [create_product_dict(extracted_data, source_url)]


def normalize_image_url(image_url, source_url=None):
    """Normalize image URL to ensure it's absolute and valid."""
    if not image_url or image_url == 'N/A' or image_url.strip() == '':
        return None
    
    image_url = str(image_url).strip()
    
    # If already absolute URL, return as is
    if image_url.startswith('http://') or image_url.startswith('https://'):
        return image_url
    
    # If relative URL, try to make it absolute using source_url
    if source_url and not image_url.startswith('/'):
        # Relative path
        return urljoin(source_url, image_url)
    elif source_url and image_url.startswith('/'):
        # Absolute path from domain root
        parsed = urlparse(source_url)
        return f"{parsed.scheme}://{parsed.netloc}{image_url}"
    
    return None


def create_product_dict(data, source_url=None):
    """Create a normalized product dictionary from raw data."""
    # Calculate discount if original_price is available
    original_price = data.get('original_price', data.get('originalPrice', None))
    current_price = data.get('price', 'N/A')
    discount_percentage = data.get('discount_percentage', data.get('discountPercentage', None))
    
    # If we have original price but no discount percentage, calculate it
    if original_price and not discount_percentage:
        try:
            orig = parsePrice(original_price)
            curr = parsePrice(current_price)
            if orig > 0 and curr < orig:
                discount_percentage = round(((orig - curr) / orig) * 100, 1)
        except:
            pass
    
    # Handle offers - can be string, array, or dict
    offers = data.get('offers', data.get('deals', data.get('special_offers', [])))
    if isinstance(offers, str):
        offers = [offers] if offers else []
    elif not isinstance(offers, list):
        offers = []
    
    # Normalize image URL
    raw_image_url = data.get('image_url', data.get('image', data.get('imageUrl', '')))
    image_url = normalize_image_url(raw_image_url, source_url)
    
    return {
        'title': str(data.get('title', data.get('name', 'Product'))),
        'price': str(current_price),
        'original_price': str(original_price) if original_price else None,
        'discount_percentage': discount_percentage,
        'offers': offers,
        'currency': data.get('currency', '$'),
        'seller': data.get('seller', data.get('retailer', 'Unknown Seller')),
        'availability': data.get('availability', data.get('stock', 'Unknown')),
        'shipping_cost': data.get('shipping_cost', data.get('shipping', 'N/A')),
        'rating': data.get('rating', None),
        'image_url': image_url,
        'product_url': data.get('product_url', data.get('url', source_url or '')),
        'confidence_score': float(data.get('confidence_score', 0.7)),
        'condition': data.get('condition', 'new'),
        'return_policy': data.get('return_policy', 'Standard return policy'),
        'estimated_delivery': data.get('estimated_delivery', '5-7 business days')
    }


@app.route('/')
def index():
    """Render main dashboard page."""
    return render_template('index.html')


@app.route('/api/search/text', methods=['POST'])
def search_text():
    """Handle text-based product search with real-time progress via SSE."""
    data = request.get_json()
    query = data.get('query', '').strip()
    use_stream = data.get('stream', False)
    
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    if use_stream:
        return Response(
            stream_with_context(search_text_stream(query)),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no'
            }
        )
    else:
        # Fallback to non-streaming for compatibility
        return search_text_sync(query)


def search_text_sync(query):
    """Synchronous text search (fallback)."""
    try:
        logger.info(f"Text search: {query}")
        goal = create_extraction_goal('text', query)
        retailers = get_retailer_search_urls(query, 'text')
        
        all_products = []
        for retailer_name, url in retailers[:6]:  # Search top 6 retailers
            try:
                extracted_data = mino_client.extract_data(url, goal)
                if extracted_data:
                    products = normalize_product_data(extracted_data, url)
                    for product in products:
                        product['seller'] = retailer_name
                        product['product_url'] = url if not product.get('product_url') else product['product_url']
                    all_products.extend(products)
            except Exception as e:
                logger.error(f"Error searching {retailer_name}: {e}")
                continue
        
        if all_products:
            return jsonify({
                'success': True,
                'products': all_products,
                'query': query,
                'total_results': len(all_products)
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No products found. Please try a different search query.',
                'products': []
            }), 404
            
    except Exception as e:
        logger.error(f"Error in text search: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


def search_text_stream(query):
    """Stream text search results with real-time progress updates."""
    try:
        logger.info(f"Text search (streaming): {query}")
        goal = create_extraction_goal('text', query)
        retailers = get_retailer_search_urls(query, 'text')[:6]  # Top 6 retailers
        
        # Send initial status
        yield f"data: {json.dumps({'type': 'status', 'message': 'Starting search...', 'retailer': None})}\n\n"
        
        all_products = []
        total_retailers = len(retailers)
        
        for idx, (retailer_name, url) in enumerate(retailers, 1):
            try:
                # Send progress update
                yield f"data: {json.dumps({'type': 'searching', 'retailer': retailer_name, 'url': url, 'progress': f'{idx}/{total_retailers}'})}\n\n"
                
                extracted_data = mino_client.extract_data(url, goal)
                
                if extracted_data:
                    products = normalize_product_data(extracted_data, url)
                    for product in products:
                        product['seller'] = retailer_name
                        product['product_url'] = url if not product.get('product_url') else product['product_url']
                    
                    all_products.extend(products)
                    
                    # Send products as they're found
                    yield f"data: {json.dumps({'type': 'products', 'retailer': retailer_name, 'products': products, 'count': len(products)})}\n\n"
                else:
                    yield f"data: {json.dumps({'type': 'no_results', 'retailer': retailer_name})}\n\n"
                    
            except Exception as e:
                logger.error(f"Error searching {retailer_name}: {e}")
                yield f"data: {json.dumps({'type': 'error', 'retailer': retailer_name, 'error': str(e)})}\n\n"
                continue
        
        # Send final summary
        yield f"data: {json.dumps({'type': 'complete', 'total_results': len(all_products), 'products': all_products})}\n\n"
        
    except Exception as e:
        logger.error(f"Error in streaming search: {e}", exc_info=True)
        yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"


@app.route('/api/search/image', methods=['POST'])
def search_image():
    """Handle image-based product search with real-time progress."""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        use_stream = request.form.get('stream', 'false').lower() == 'true'
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, WebP'}), 400
        
        # Save uploaded file
        filename = secure_filename(f"{datetime.now().timestamp()}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        logger.info(f"Image search: {filename}")
        
        goal = create_extraction_goal('image', 'product in uploaded image')
        
        if use_stream:
            # Clean up will happen in stream function
            return Response(
                stream_with_context(search_image_stream(goal, filepath)),
                mimetype='text/event-stream',
                headers={
                    'Cache-Control': 'no-cache',
                    'X-Accel-Buffering': 'no'
                }
            )
        else:
            # Synchronous search
            retailers = get_retailer_search_urls('similar product', 'image')
            all_products = []
            
            for retailer_name, url in retailers[:6]:
                try:
                    extracted_data = mino_client.extract_data(url, goal)
                    if extracted_data:
                        products = normalize_product_data(extracted_data, url)
                        for product in products:
                            product['seller'] = retailer_name
                        all_products.extend(products)
                except Exception as e:
                    logger.error(f"Error searching {retailer_name}: {e}")
                    continue
            
            # Clean up
            try:
                os.remove(filepath)
            except:
                pass
            
            if all_products:
                return jsonify({
                    'success': True,
                    'products': all_products,
                    'query': 'Image search',
                    'total_results': len(all_products)
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'No products found. Please try a different image.',
                    'products': []
                }), 404
            
    except Exception as e:
        logger.error(f"Error in image search: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


def search_image_stream(goal, filepath):
    """Stream image search results with real-time progress."""
    try:
        retailers = get_retailer_search_urls('similar product', 'image')[:6]
        
        yield f"data: {json.dumps({'type': 'status', 'message': 'Analyzing image and starting search...', 'retailer': None})}\n\n"
        
        all_products = []
        total_retailers = len(retailers)
        
        for idx, (retailer_name, url) in enumerate(retailers, 1):
            try:
                yield f"data: {json.dumps({'type': 'searching', 'retailer': retailer_name, 'url': url, 'progress': f'{idx}/{total_retailers}'})}\n\n"
                
                extracted_data = mino_client.extract_data(url, goal)
                
                if extracted_data:
                    products = normalize_product_data(extracted_data, url)
                    for product in products:
                        product['seller'] = retailer_name
                    all_products.extend(products)
                    
                    yield f"data: {json.dumps({'type': 'products', 'retailer': retailer_name, 'products': products, 'count': len(products)})}\n\n"
                else:
                    yield f"data: {json.dumps({'type': 'no_results', 'retailer': retailer_name})}\n\n"
                    
            except Exception as e:
                logger.error(f"Error searching {retailer_name}: {e}")
                yield f"data: {json.dumps({'type': 'error', 'retailer': retailer_name, 'error': str(e)})}\n\n"
                continue
        
        # Clean up uploaded file
        try:
            os.remove(filepath)
        except:
            pass
        
        yield f"data: {json.dumps({'type': 'complete', 'total_results': len(all_products), 'products': all_products})}\n\n"
        
    except Exception as e:
        logger.error(f"Error in streaming image search: {e}", exc_info=True)
        try:
            os.remove(filepath)
        except:
            pass
        yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"


@app.route('/api/products/compare', methods=['POST'])
def compare_products():
    """Compare selected products side-by-side."""
    try:
        data = request.get_json()
        product_ids = data.get('product_ids', [])
        
        if not product_ids:
            return jsonify({'error': 'No products selected for comparison'}), 400
        
        # In a real implementation, you'd fetch these from a database
        # For MVP, we'll return the product data that was sent
        return jsonify({
            'success': True,
            'products': product_ids  # These would be full product objects
        })
        
    except Exception as e:
        logger.error(f"Error comparing products: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@app.route('/api/example-prompts', methods=['GET'])
def get_example_prompts():
    """Get example search prompts for user guidance."""
    examples = [
        "Wireless Bluetooth headphones with noise cancellation",
        "Nike running shoes size 10, black",
        "iPhone 15 Pro Max 256GB, unlocked",
        "Standing desk adjustable height, white",
        "Coffee maker with programmable timer, 12 cups"
    ]
    return jsonify({'examples': examples})


# For Vercel deployment
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(debug=False, host='0.0.0.0', port=port)

