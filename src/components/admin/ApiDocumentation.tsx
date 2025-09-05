import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, ExternalLink, Key, Database, BarChart } from 'lucide-react';
import { ENV } from '@/config/environment';

export const ApiDocumentation: React.FC = () => {
  const baseUrl = ENV.API_BASE_URL;

  const endpoints = {
    products: [
      {
        method: 'GET',
        path: '/api/external/products',
        description: 'List all products with pagination and filtering',
        params: [
          { name: 'page', type: 'integer', description: 'Page number (default: 1)' },
          { name: 'limit', type: 'integer', description: 'Items per page (default: 20, max: 100)' },
          { name: 'category', type: 'string', description: 'Filter by category' },
          { name: 'status', type: 'string', description: 'Filter by status (active, inactive, discontinued)' },
          { name: 'search', type: 'string', description: 'Search in name, SKU, or description' }
        ]
      },
      {
        method: 'GET',
        path: '/api/external/products/:id',
        description: 'Get a single product by ID',
        params: [
          { name: 'id', type: 'string', description: 'Product ID' }
        ]
      },
      {
        method: 'GET',
        path: '/api/external/products/meta/categories',
        description: 'Get all available product categories',
        params: []
      },
      {
        method: 'GET',
        path: '/api/external/products/alerts/low-stock',
        description: 'Get products with low stock levels',
        params: []
      }
    ],
    analytics: [
      {
        method: 'GET',
        path: '/api/external/analytics/overview',
        description: 'Get analytics overview with key metrics',
        params: []
      },
      {
        method: 'GET',
        path: '/api/external/analytics/categories',
        description: 'Get category analysis and statistics',
        params: []
      },
      {
        method: 'GET',
        path: '/api/external/analytics/stock-velocity',
        description: 'Get stock velocity analysis',
        params: [
          { name: 'period', type: 'string', description: 'Time period (7d, 30d, 90d)' },
          { name: 'category', type: 'string', description: 'Filter by category' },
          { name: 'limit', type: 'integer', description: 'Number of results (max: 100)' }
        ]
      }
    ]
  };

  const exampleResponses = {
    product: {
      success: true,
      data: {
        _id: "507f1f77bcf86cd799439011",
        name: "Example Product",
        sku: "EX001",
        description: "Product description",
        category: "Electronics",
        price: 99.99,
        stock: {
          current: 50,
          minimum: 10
        },
        status: "active"
      },
      metadata: {
        timestamp: "2024-01-01T00:00:00.000Z",
        apiVersion: "1.0",
        requestId: "req_123"
      }
    },
    analytics: {
      success: true,
      data: {
        products: {
          total: 1500,
          active: 1450,
          lowStock: 25
        },
        assets: {
          total: 300
        },
        stock: {
          totalValue: 250000
        }
      },
      metadata: {
        timestamp: "2024-01-01T00:00:00.000Z",
        apiVersion: "1.0",
        requestId: "req_456"
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">External API Documentation</h2>
        <p className="text-muted-foreground">
          Complete guide for external applications to access your inventory data via REST API
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>External API Overview</CardTitle>
              <CardDescription>
                Your inventory system provides a secure RESTful API for external applications to access data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Base URL</h4>
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  {baseUrl}/api/external
                </code>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Read-only access</strong> - External APIs can only view data, not modify it</li>
                  <li><strong>API key authentication</strong> - Secure access control</li>
                  <li><strong>Rate limiting per API key</strong> - Configurable request limits</li>
                  <li><strong>Pagination support</strong> - Efficient handling of large datasets</li>
                  <li><strong>Filtering and search</strong> - Find specific data easily</li>
                  <li><strong>Consistent JSON responses</strong> - Standardized format with metadata</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Security Features</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>API keys with 'read' permission only</li>
                  <li>Rate limiting to prevent abuse</li>
                  <li>Usage monitoring and logging</li>
                  <li>No sensitive data in responses (user info, internal IDs)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Rate Limits</h4>
                <p className="text-sm text-muted-foreground">
                  Each API key has its own configurable rate limit (default: 1000 requests/hour).
                  Rate limit information is included in response headers.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Authentication
              </CardTitle>
              <CardDescription>
                How to authenticate your requests to the External API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">API Key Authentication</h4>
                <p className="text-sm mb-2">
                  Include your API key in the request header:
                </p>
                <code className="block bg-muted p-3 rounded text-sm">
                  x-api-key: sk_live_your_api_key_here
                </code>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Required Permissions</h4>
                <Badge variant="secondary">read</Badge>
                <p className="text-sm mt-2 text-muted-foreground">
                  External API access requires the 'read' permission. This ensures external applications
                  can only view data and cannot modify your inventory.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Getting an API Key</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Only Super Admin users can create API keys</li>
                  <li>Go to API Management → API Keys</li>
                  <li>Click "Create API Key"</li>
                  <li>Enter a descriptive name</li>
                  <li>Select 'read' permission</li>
                  <li>Set rate limit and expiration (optional)</li>
                  <li>Copy the generated key immediately (it won't be shown again)</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Example Request</h4>
                <code className="block bg-muted p-3 rounded text-sm">
                  {`curl -H "x-api-key: sk_live_your_api_key" \\
     -H "Content-Type: application/json" \\
     ${baseUrl}/api/external/products`}
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Products API
                </CardTitle>
                <CardDescription>
                  Access product information and inventory data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpoints.products.map((endpoint, index) => (
                    <div key={index} className="border rounded p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <code className="text-sm">{endpoint.path}</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {endpoint.description}
                      </p>
                      
                      {endpoint.params.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold mb-2">Parameters:</h5>
                          <div className="space-y-1">
                            {endpoint.params.map((param, paramIndex) => (
                              <div key={paramIndex} className="text-xs">
                                <code className="bg-muted px-1 rounded">{param.name}</code>
                                <span className="mx-1">({param.type})</span>
                                <span className="text-muted-foreground ml-2">- {param.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  Analytics API
                </CardTitle>
                <CardDescription>
                  Access analytics and reporting data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpoints.analytics.map((endpoint, index) => (
                    <div key={index} className="border rounded p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <code className="text-sm">{endpoint.path}</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {endpoint.description}
                      </p>
                      
                      {endpoint.params.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold mb-2">Parameters:</h5>
                          <div className="space-y-1">
                            {endpoint.params.map((param, paramIndex) => (
                              <div key={paramIndex} className="text-xs">
                                <code className="bg-muted px-1 rounded">{param.name}</code>
                                <span className="mx-1">({param.type})</span>
                                <span className="text-muted-foreground ml-2">- {param.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Examples</CardTitle>
                <CardDescription>
                  Sample API responses showing the expected data format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Product Response</h4>
                  <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                    {JSON.stringify(exampleResponses.product, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Analytics Overview Response</h4>
                  <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                    {JSON.stringify(exampleResponses.analytics, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Error Response</h4>
                  <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                    {JSON.stringify({
                      success: false,
                      error: "Invalid API key",
                      message: "The provided API key is invalid or expired"
                    }, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>
                  Sample code for different programming languages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">JavaScript (fetch)</h4>
                  <pre className="bg-muted p-4 rounded text-xs overflow-auto">
{`const response = await fetch('${baseUrl}/api/external/products', {
  headers: {
    'x-api-key': 'sk_live_your_api_key',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
if (data.success) {
  console.log('Products:', data.data);
  console.log('Total:', data.pagination.total);
} else {
  console.error('Error:', data.error);
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Python (requests)</h4>
                  <pre className="bg-muted p-4 rounded text-xs overflow-auto">
{`import requests

headers = {
    'x-api-key': 'sk_live_your_api_key',
    'Content-Type': 'application/json'
}

response = requests.get('${baseUrl}/api/external/products', headers=headers)
data = response.json()

if data['success']:
    print(f"Found {data['pagination']['total']} products")
    for product in data['data']:
        print(f"- {product['name']} ({product['sku']})")
else:
    print(f"Error: {data['error']}")`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">cURL with filtering</h4>
                  <pre className="bg-muted p-4 rounded text-xs overflow-auto">
{`# Get products with low stock
curl -H "x-api-key: sk_live_your_api_key" \\
     "${baseUrl}/api/external/products/alerts/low-stock"

# Search for products
curl -H "x-api-key: sk_live_your_api_key" \\
     "${baseUrl}/api/external/products?search=laptop&category=Electronics"

# Get analytics overview
curl -H "x-api-key: sk_live_your_api_key" \\
     "${baseUrl}/api/external/analytics/overview"`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};