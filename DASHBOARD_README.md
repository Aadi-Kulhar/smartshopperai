# Smart Shopping Dashboard - Quick Start Guide

## Overview

The Smart Shopping Dashboard is a web-based interface for the AI-Powered Price Comparison Platform. It provides an intuitive way to search for products using text descriptions or images, and compare prices across multiple retailers.

## Running the Dashboard

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the Server

```bash
python app.py
```

The dashboard will be available at: **http://localhost:8080**

### 3. Open in Browser

Navigate to `http://localhost:8080` in your web browser (Chrome, Firefox, Safari, or Edge).

## Using the Dashboard

### Text Search

1. Click on the **"Text Search"** tab (default)
2. Enter a product description in natural language, for example:
   - "Wireless Bluetooth headphones with noise cancellation"
   - "Nike running shoes size 10, black"
   - "iPhone 15 Pro Max 256GB, unlocked"
3. Click **"Search"** or press Enter
4. Wait for results (typically 5-10 seconds)
5. Browse products, sort, filter, and compare

### Image Search

1. Click on the **"Image Search"** tab
2. Either:
   - **Drag and drop** an image onto the upload area, or
   - **Click** "click to upload" to select an image from your device
3. Supported formats: JPG, PNG, WebP (max 10MB)
4. Preview your image, then click **"Search with Image"**
5. View results of similar products found

### Product Results

Each product card displays:
- **Product Image**: Thumbnail of the product
- **Title**: Product name
- **Price**: Current price with currency
- **Seller**: Retailer/merchant name
- **Availability**: Stock status
- **Rating**: Seller/product rating (if available)
- **Match Confidence**: How well the product matches your search
- **Shipping Cost**: Delivery fees
- **View on Seller Site**: Link to purchase

### Sorting Results

Use the **"Sort by"** dropdown to organize products:
- **Price: Low to High** - Best deals first
- **Price: High to Low** - Premium options first
- **Seller Rating** - Highest rated sellers first
- **Match Confidence** - Best matches first

### Filtering Results

Use the **"Filter"** dropdown to narrow results:
- **All Products** - Show everything
- **In Stock Only** - Available products
- **Free Shipping** - Products with free delivery
- **High Rating** - 4+ star rated sellers

### Comparing Products

1. Check the checkbox on up to 3 product cards
2. A comparison section will appear at the bottom
3. View side-by-side comparison of selected products
4. Click **"Clear Comparison"** to reset

## API Endpoints

The dashboard uses these backend endpoints:

- `POST /api/search/text` - Text-based product search
- `POST /api/search/image` - Image-based product search
- `GET /api/example-prompts` - Get example search queries
- `POST /api/products/compare` - Compare selected products

## Technical Details

### Frontend
- **Framework**: Vanilla JavaScript (no dependencies)
- **Styling**: Modern CSS with CSS Grid and Flexbox
- **Responsive**: Mobile-first design
- **Browser Support**: Chrome, Firefox, Safari, Edge (latest 2 versions)

### Backend
- **Framework**: Flask
- **API Integration**: Mino Automation API
- **Database**: SQLite (via mino_integration.py)
- **File Upload**: Temporary storage in `uploads/` directory

### File Structure

```
TinyFish/
├── app.py                 # Flask application
├── mino_integration.py    # Mino API client & database
├── templates/
│   └── index.html         # Main dashboard page
├── static/
│   ├── styles.css         # Dashboard styling
│   └── app.js             # Frontend JavaScript
├── uploads/               # Temporary image storage
└── config.json            # Configuration file
```

## Customization

### Changing the API Key

Set the environment variable:

```bash
export MINO_API_KEY="your-api-key-here"
```

Or edit `app.py` directly (line 18).

### Modifying Search Behavior

Edit the `create_extraction_goal()` function in `app.py` to customize what data is extracted from product pages.

### Styling

Modify `static/styles.css` to change colors, fonts, layout, etc. The CSS uses CSS variables for easy theming.

## Troubleshooting

### Dashboard won't start

- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check if port 8080 is available
- Verify Python 3.7+ is installed

### No search results

- Check your Mino API key is valid
- Verify network connectivity
- Check browser console for errors
- Review server logs for API errors

### Image upload not working

- Verify file is under 10MB
- Check file format (JPG, PNG, WebP only)
- Ensure `uploads/` directory exists and is writable

### Products not displaying correctly

- Check browser console for JavaScript errors
- Verify API responses in Network tab
- Ensure product data structure matches expected format

## Next Steps

For production deployment:

1. **Use a production WSGI server** (e.g., Gunicorn, uWSGI)
2. **Set up HTTPS** with SSL certificates
3. **Configure environment variables** for sensitive data
4. **Add rate limiting** to prevent abuse
5. **Implement caching** for frequently searched products
6. **Set up monitoring** and error tracking
7. **Add user authentication** (for post-MVP features)

## Support

For issues or questions:
- Check the main README.md for backend documentation
- Review Mino API docs: https://docs.mino.ai
- Check server logs in console output

