# Most Common HTTP Status Codes

Use these codes to communicate outcome to clients (browsers, APIs, SDKs).

## <span style="color:#2b6cb0;font-weight:800;">1xx</span> Informational

### <span style="color:#2b6cb0;font-weight:800;">100</span> Continue

Server can accept the request body.
Example (conceptual):

- Client sends headers, server responds `100` to signal it should send the body.

## <span style="color:#2f855a;font-weight:800;">2xx</span> Success

### <span style="color:#2f855a;font-weight:800;">200</span> OK

Standard success for GET/PUT/PATCH responses.
Example:

```http
GET /api/products/123

HTTP/1.1 200 OK
Content-Type: application/json

{ "id": "123", "name": "Keyboard", "price": 49.99 }
```

### <span style="color:#2f855a;font-weight:800;">201</span> Created

Created a resource (usually after POST).
Example:

```http
POST /api/orders

HTTP/1.1 201 Created
Location: /api/orders/abc123

{ "id": "abc123", "status": "pending" }
```

### <span style="color:#2f855a;font-weight:800;">202</span> Accepted

Request accepted for asynchronous processing (not complete yet).
Example:

```http
POST /api/invoices

HTTP/1.1 202 Accepted

{ "jobId": "job-42", "status": "processing" }
```

### <span style="color:#2f855a;font-weight:800;">204</span> No Content

Success but no response body (common for DELETE).
Example:

```http
DELETE /api/cart/items/9

HTTP/1.1 204 No Content
```

## <span style="color:#b7791f;font-weight:800;">3xx</span> Redirection

### <span style="color:#b7791f;font-weight:800;">301</span> Moved Permanently

Resource moved permanently; clients should use the new URL.
Example:

```http
GET /shop

HTTP/1.1 301 Moved Permanently
Location: /store
```

### <span style="color:#b7791f;font-weight:800;">302</span> Found

Temporary redirect.
Example:

```http
GET /login

HTTP/1.1 302 Found
Location: /auth/login
```

### <span style="color:#b7791f;font-weight:800;">304</span> Not Modified

Conditional GET: the resource has not changed; client can use cached data.
Example:

```http
GET /api/products/123
If-None-Match: "etag-abc"

HTTP/1.1 304 Not Modified
```

## <span style="color:#dd6b20;font-weight:800;">4xx</span> Client Errors

### <span style="color:#dd6b20;font-weight:800;">400</span> Bad Request

Request is malformed (invalid JSON, missing required fields, invalid query params).
Example:

```http
POST /api/products
Content-Type: application/json

{ "name": "" }

HTTP/1.1 400 Bad Request

{ "error": "price is required" }
```

### <span style="color:#dd6b20;font-weight:800;">401</span> Unauthorized

Authentication required or failed (missing/invalid token).
Example:

```http
GET /api/admin/products

HTTP/1.1 401 Unauthorized

{ "error": "Unauthorized" }
```

### <span style="color:#dd6b20;font-weight:800;">403</span> Forbidden

Authenticated, but not allowed (insufficient role/permissions).
Example:

```http
DELETE /api/products/123

HTTP/1.1 403 Forbidden

{ "error": "You do not have permission to delete this product" }
```

### <span style="color:#dd6b20;font-weight:800;">404</span> Not Found

Resource does not exist.
Example:

```http
GET /api/products/does-not-exist

HTTP/1.1 404 Not Found

{ "error": "Product not found" }
```

### <span style="color:#dd6b20;font-weight:800;">405</span> Method Not Allowed

Endpoint exists, but method is not supported.
Example:

```http
POST /api/products/123

HTTP/1.1 405 Method Not Allowed

{ "error": "Use PATCH to update a product" }
```

### <span style="color:#dd6b20;font-weight:800;">406</span> Not Acceptable

Server can't produce a response matching the `Accept` headers.
Example:

```http
GET /api/products
Accept: application/xml

HTTP/1.1 406 Not Acceptable
```

### <span style="color:#dd6b20;font-weight:800;">409</span> Conflict

Request conflicts with current state (duplicate key, version mismatch).
Example:

```http
POST /api/users

{ "email": "already-used@example.com" }

HTTP/1.1 409 Conflict

{ "error": "Email already exists" }
```

### <span style="color:#dd6b20;font-weight:800;">410</span> Gone

Resource used to exist but has been permanently removed.
Example:

```http
GET /api/v1/old-route

HTTP/1.1 410 Gone
```

### <span style="color:#dd6b20;font-weight:800;">412</span> Precondition Failed

Preconditions (e.g. `If-Match`) failed.
Example:

```http
PATCH /api/products/123
If-Match: "etag-old"

HTTP/1.1 412 Precondition Failed
```

### <span style="color:#dd6b20;font-weight:800;">415</span> Unsupported Media Type

Wrong `Content-Type`.
Example:

```http
POST /api/products
Content-Type: application/xml

HTTP/1.1 415 Unsupported Media Type

{ "error": "Content-Type must be application/json" }
```

### <span style="color:#dd6b20;font-weight:800;">422</span> Unprocessable Entity

Well-formed request, but validation failed (common for field-level errors).
Example:

```http
POST /api/products
Content-Type: application/json

{ "price": -10 }

HTTP/1.1 422 Unprocessable Entity

{ "errors": { "price": "must be >= 0" } }
```

### <span style="color:#dd6b20;font-weight:800;">429</span> Too Many Requests

Rate limit exceeded.
Example:

```http
GET /api/search?q=phone

HTTP/1.1 429 Too Many Requests

{ "error": "Rate limit exceeded", "retryAfterSeconds": 30 }
```

## <span style="color:#e53e3e;font-weight:800;">5xx</span> Server Errors

### <span style="color:#e53e3e;font-weight:800;">500</span> Internal Server Error

Unexpected server failure.
Example:

```http
GET /api/products

HTTP/1.1 500 Internal Server Error

{ "error": "Something went wrong" }
```

### <span style="color:#e53e3e;font-weight:800;">502</span> Bad Gateway

Proxy/gateway received an invalid response from upstream.
Example:

```http
HTTP/1.1 502 Bad Gateway
```

### <span style="color:#e53e3e;font-weight:800;">503</span> Service Unavailable

Server temporarily unavailable (maintenance, overloaded).
Example:

```http
HTTP/1.1 503 Service Unavailable

{ "error": "Service is temporarily unavailable" }
```

### <span style="color:#e53e3e;font-weight:800;">504</span> Gateway Timeout

Proxy/gateway timed out waiting for upstream.
Example:

```http
HTTP/1.1 504 Gateway Timeout
```

## Recommended usage (quick cheatsheet)

- <span style="color:#dd6b20;font-weight:800;">400</span> for malformed request / missing params
- <span style="color:#dd6b20;font-weight:800;">401</span> for missing/invalid auth
- <span style="color:#dd6b20;font-weight:800;">403</span> for authenticated but not allowed
- <span style="color:#dd6b20;font-weight:800;">404</span> for unknown resource/route
- <span style="color:#dd6b20;font-weight:800;">409</span> for conflicts (duplicates, state mismatches)
- <span style="color:#dd6b20;font-weight:800;">422</span> for validation errors
- <span style="color:#dd6b20;font-weight:800;">429</span> for rate limiting
- <span style="color:#e53e3e;font-weight:800;">500</span> for unexpected server errors
