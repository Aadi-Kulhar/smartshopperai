"""
Vercel Python runtime compatibility
This file provides compatibility for Vercel's Python runtime
"""
from typing import Dict, Any, Tuple

class Request:
    """Request object compatible with Vercel"""
    def __init__(self, method: str, path: str, headers: Dict[str, str], 
                 body: bytes = b'', query_string: str = ''):
        self.method = method
        self.path = path
        self.headers = headers
        self.body = body
        self.query_string = query_string

class Response:
    """Response object compatible with Vercel"""
    def __init__(self, body: bytes, status: int = 200, 
                 headers: Dict[str, str] = None):
        self.body = body
        self.status = status
        self.headers = headers or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary format expected by Vercel"""
        return {
            'statusCode': self.status,
            'headers': self.headers,
            'body': self.body.decode('utf-8') if isinstance(self.body, bytes) else self.body
        }


