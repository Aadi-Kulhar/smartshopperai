"""
Vercel serverless function entry point for Flask app
Compatible with Vercel Python runtime (@vercel/python)
"""
import sys
import os
import json
from io import BytesIO

# Add parent directory to path so we can import app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import Flask app
from app import app

def handler(request):
    """
    Vercel serverless function handler for Flask app.
    Converts Vercel request format to WSGI and back.
    
    Args:
        request: Vercel request object (can be dict or object with attributes)
    
    Returns:
        dict: Response with statusCode, headers, and body
    """
    try:
        # Extract request data - handle both dict and object formats
        if isinstance(request, dict):
            method = request.get('method', 'GET')
            path = request.get('path', '/')
            headers = request.get('headers', {})
            body = request.get('body', b'')
            query_params = request.get('queryStringParameters', {}) or {}
        else:
            # Object format
            method = getattr(request, 'method', 'GET')
            path = getattr(request, 'path', '/')
            headers = getattr(request, 'headers', {})
            body = getattr(request, 'body', b'')
            query_params = getattr(request, 'queryStringParameters', {}) or {}
        
        # Convert query params to query string
        query_string = '&'.join([f"{k}={v}" for k, v in query_params.items()]) if query_params else ''
        
        # Ensure body is bytes
        if isinstance(body, str):
            body = body.encode('utf-8')
        elif body is None:
            body = b''
        
        # Parse host header
        host = headers.get('host', 'localhost')
        if ':' in host:
            server_name, server_port = host.split(':', 1)
        else:
            server_name = host
            server_port = '443'
        
        # Build WSGI environ dictionary
        environ = {
            'REQUEST_METHOD': method,
            'PATH_INFO': path,
            'QUERY_STRING': query_string,
            'SERVER_NAME': server_name,
            'SERVER_PORT': server_port,
            'wsgi.version': (1, 0),
            'wsgi.url_scheme': 'https',
            'wsgi.input': BytesIO(body),
            'wsgi.errors': sys.stderr,
            'wsgi.multithread': False,
            'wsgi.multiprocess': True,
            'wsgi.run_once': False,
            'CONTENT_LENGTH': str(len(body)),
        }
        
        # Add headers to environ (WSGI format)
        content_type = None
        for key, value in headers.items():
            key_upper = key.upper().replace('-', '_')
            if key_upper == 'CONTENT_TYPE':
                content_type = value
                environ['CONTENT_TYPE'] = value
            elif key_upper == 'CONTENT_LENGTH':
                environ['CONTENT_LENGTH'] = value
            else:
                # HTTP headers get HTTP_ prefix
                environ[f'HTTP_{key_upper}'] = value
        
        # Default content type if not set
        if not content_type and body:
            environ['CONTENT_TYPE'] = 'application/json'
        
        # Process request with Flask
        with app.request_context(environ):
            response = app.full_dispatch_request()
            
            # Convert Flask response to Vercel format
            return {
                'statusCode': response.status_code,
                'headers': dict(response.headers),
                'body': response.get_data(as_text=True)
            }
            
    except Exception as e:
        # Error handling
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': error_msg
            })
        }
