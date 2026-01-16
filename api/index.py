"""
Vercel serverless function entry point for Flask app
Simplified version for Vercel Python runtime
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import Flask app
from app import app

# Vercel serverless function handler
# Vercel will call this function with a request object
def handler(request):
    """
    Main handler function for Vercel serverless function
    """
    from werkzeug.wrappers import Request as WerkzeugRequest
    from werkzeug.wrappers import Response as WerkzeugResponse
    
    # Convert Vercel request to Werkzeug request
    # Vercel passes request as dict with method, path, headers, body, etc.
    if isinstance(request, dict):
        # Extract request data
        method = request.get('method', 'GET')
        path = request.get('path', '/')
        headers = request.get('headers', {})
        body = request.get('body', '')
        query = request.get('queryStringParameters', {})
        
        # Create Werkzeug request
        environ = {
            'REQUEST_METHOD': method,
            'PATH_INFO': path,
            'QUERY_STRING': '&'.join([f"{k}={v}" for k, v in query.items()]) if query else '',
            'SERVER_NAME': headers.get('host', 'localhost'),
            'SERVER_PORT': '443',
            'wsgi.version': (1, 0),
            'wsgi.url_scheme': 'https',
            'wsgi.input': body.encode() if isinstance(body, str) else body,
            'wsgi.errors': sys.stderr,
            'wsgi.multithread': False,
            'wsgi.multiprocess': True,
            'wsgi.run_once': False,
        }
        
        # Add headers
        for key, value in headers.items():
            key_upper = key.upper().replace('-', '_')
            if key_upper not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
                environ[f'HTTP_{key_upper}'] = value
            else:
                environ[key_upper] = value
        
        # Create Werkzeug request
        werkzeug_request = WerkzeugRequest(environ)
        
        # Process with Flask app
        with app.request_context(werkzeug_request.environ):
            response = app.full_dispatch_request()
            
            # Convert Flask response to dict
            return {
                'statusCode': response.status_code,
                'headers': dict(response.headers),
                'body': response.get_data(as_text=True)
            }
    else:
        # Fallback: try to use request directly
        return app(request.environ, request.start_response)
