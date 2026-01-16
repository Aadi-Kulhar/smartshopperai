"""
Vercel serverless function entry point for Flask app
"""
import sys
import os
import json

# Add parent directory to path to import app
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from app import app

def handler(request):
    """
    Vercel serverless function handler for Flask app
    This function is called by Vercel's Python runtime
    """
    # Vercel passes request as a dictionary-like object
    # Extract request information
    method = request.get('method', 'GET')
    path = request.get('path', '/')
    headers = request.get('headers', {})
    body = request.get('body', '')
    query_string = request.get('queryStringParameters', {})
    
    # Convert query string dict to string
    if query_string:
        qs = '&'.join([f"{k}={v}" for k, v in query_string.items()])
    else:
        qs = ''
    
    # Create WSGI environment
    environ = {
        'REQUEST_METHOD': method,
        'PATH_INFO': path,
        'QUERY_STRING': qs,
        'SERVER_NAME': headers.get('host', 'localhost'),
        'SERVER_PORT': headers.get('x-forwarded-port', '80'),
        'wsgi.version': (1, 0),
        'wsgi.url_scheme': headers.get('x-forwarded-proto', 'https'),
        'wsgi.input': body.encode() if isinstance(body, str) else body,
        'wsgi.errors': sys.stderr,
        'wsgi.multithread': False,
        'wsgi.multiprocess': True,
        'wsgi.run_once': False,
        'CONTENT_TYPE': headers.get('content-type', ''),
        'CONTENT_LENGTH': str(len(body.encode() if isinstance(body, str) else body)),
    }
    
    # Add HTTP headers to environ
    for key, value in headers.items():
        key = key.upper().replace('-', '_')
        if key not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
            key = 'HTTP_' + key
        environ[key] = value
    
    # Response data
    response_data = {'status': 200, 'headers': {}, 'body': b''}
    
    def start_response(status, response_headers):
        response_data['status'] = int(status.split()[0])
        # Convert headers list to dict
        for header in response_headers:
            response_data['headers'][header[0]] = header[1]
    
    # Call Flask app
    try:
        result = app(environ, start_response)
        
        # Collect response body
        body_parts = []
        for part in result:
            if part:
                body_parts.append(part)
        response_data['body'] = b''.join(body_parts)
        
        # Return response in Vercel format
        return {
            'statusCode': response_data['status'],
            'headers': response_data['headers'],
            'body': response_data['body'].decode('utf-8', errors='ignore')
        }
    except Exception as e:
        import traceback
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'error': str(e),
                'traceback': traceback.format_exc()
            })
        }

