# Backend Integration Guide for CakePHP

This guide will help you integrate this Next.js frontend with your existing CakePHP backend.

## Table of Contents
1. [API Endpoint Setup](#api-endpoint-setup)
2. [CORS Configuration](#cors-configuration)
3. [Authentication Setup](#authentication-setup)
4. [Sample Controllers](#sample-controllers)
5. [Response Formats](#response-formats)

---

## 1. API Endpoint Setup

### Required Routes

Add these routes to your CakePHP `config/routes.php`:

```php
<?php
// API routes with prefix
$routes->prefix('Api', function ($routes) {
    // Enable JSON extension
    $routes->setExtensions(['json']);
    
    // Authentication
    $routes->connect('/users/login', ['controller' => 'Users', 'action' => 'login']);
    $routes->connect('/users/logout', ['controller' => 'Users', 'action' => 'logout']);
    
    // Families
    $routes->resources('Families');
    
    // Members
    $routes->resources('Members');
    
    // Birth Registrations
    $routes->resources('BirthRegistrations', [
        'path' => 'birth-registrations'
    ]);
    
    // Marriage Registrations  
    $routes->resources('MarriageRegistrations', [
        'path' => 'marriage-registrations'
    ]);
    
    // Master data
    $routes->resources('Wards');
    $routes->resources('PanchayathWards', [
        'path' => 'panchayath-wards'
    ]);
    $routes->resources('Educations');
    
    // Statistics
    $routes->connect('/statistics/dashboard', [
        'controller' => 'Statistics',
        'action' => 'dashboard'
    ]);
    
    // Subscription Payments
    $routes->resources('SubscriptionPayments', [
        'path' => 'subscription-payments'
    ]);
});
```

---

## 2. CORS Configuration

### Install CORS Plugin

```bash
composer require ozee31/cakephp-cors
```

### Configure in Application.php

In `src/Application.php`, add the CORS middleware:

```php
<?php
namespace App;

use Cake\Http\BaseApplication;
use Cake\Http\MiddlewareQueue;

class Application extends BaseApplication
{
    public function middleware(MiddlewareQueue $middlewareQueue): MiddlewareQueue
    {
        $middlewareQueue
            // ... other middleware
            
            // Add CORS middleware BEFORE routing
            ->add(new \Cake\Http\Middleware\CorsMiddleware([
                'allowOrigin' => [
                    'http://localhost:3000',
                    'https://yourdomain.com'
                ],
                'allowMethods' => ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
                'allowHeaders' => [
                    'Content-Type',
                    'Authorization',
                    'X-Requested-With',
                    'Accept'
                ],
                'allowCredentials' => true,
                'exposeHeaders' => ['Link'],
                'maxAge' => 300,
            ]));
            
        return $middlewareQueue;
    }
}
```

---

## 3. Authentication Setup

### Install JWT Authentication

```bash
composer require firebase/php-jwt
```

### Create JWT Component

Create `src/Controller/Component/JwtComponent.php`:

```php
<?php
namespace App\Controller\Component;

use Cake\Controller\Component;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Cake\Core\Configure;

class JwtComponent extends Component
{
    private $key;
    private $algorithm = 'HS256';
    
    public function initialize(array $config): void
    {
        parent::initialize($config);
        $this->key = Configure::read('Security.salt');
    }
    
    public function generateToken($user)
    {
        $payload = [
            'iss' => 'mahallu-system',
            'sub' => $user['id'],
            'iat' => time(),
            'exp' => time() + (86400 * 30), // 30 days
            'data' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'group_id' => $user['group_id']
            ]
        ];
        
        return JWT::encode($payload, $this->key, $this->algorithm);
    }
    
    public function verifyToken($token)
    {
        try {
            $decoded = JWT::decode($token, new Key($this->key, $this->algorithm));
            return (array) $decoded->data;
        } catch (\Exception $e) {
            return false;
        }
    }
}
```

### Create Auth Middleware

Create `src/Middleware/AuthMiddleware.php`:

```php
<?php
namespace App\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Server\MiddlewareInterface;
use Cake\Http\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Cake\Core\Configure;

class AuthMiddleware implements MiddlewareInterface
{
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {
        // Skip auth for login endpoint
        if (strpos($request->getUri()->getPath(), '/api/users/login') !== false) {
            return $handler->handle($request);
        }
        
        // Get authorization header
        $authHeader = $request->getHeaderLine('Authorization');
        
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $response = new Response();
            return $response->withStatus(401)
                ->withType('application/json')
                ->withStringBody(json_encode(['message' => 'Unauthorized']));
        }
        
        $token = $matches[1];
        
        try {
            $key = Configure::read('Security.salt');
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            
            // Add user data to request
            $request = $request->withAttribute('user', (array) $decoded->data);
            
            return $handler->handle($request);
        } catch (\Exception $e) {
            $response = new Response();
            return $response->withStatus(401)
                ->withType('application/json')
                ->withStringBody(json_encode(['message' => 'Invalid token']));
        }
    }
}
```

Add to middleware queue in `Application.php`:

```php
// Add after CORS middleware for API routes only
->add(new \App\Middleware\AuthMiddleware());
```

---

## 4. Sample Controllers

### UsersController (Login)

Create `src/Controller/Api/UsersController.php`:

```php
<?php
namespace App\Controller\Api;

use App\Controller\AppController;

class UsersController extends AppController
{
    public function initialize(): void
    {
        parent::initialize();
        $this->loadComponent('Jwt');
    }

    public function login()
    {
        $this->request->allowMethod(['post']);
        
        $email = $this->request->getData('email');
        $password = $this->request->getData('password');
        
        $user = $this->Users->find()
            ->where(['email' => $email])
            ->first();
        
        if (!$user || !password_verify($password, $user->password)) {
            return $this->response
                ->withStatus(401)
                ->withType('application/json')
                ->withStringBody(json_encode([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ]));
        }
        
        $token = $this->Jwt->generateToken($user);
        
        $this->set([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'group_id' => $user->group_id
            ]
        ]);
        $this->viewBuilder()->setOption('serialize', ['success', 'token', 'user']);
    }
}
```

### FamiliesController

Create `src/Controller/Api/FamiliesController.php`:

```php
<?php
namespace App\Controller\Api;

use App\Controller\AppController;

class FamiliesController extends AppController
{
    public function index()
    {
        $this->request->allowMethod(['get']);
        
        $page = (int) $this->request->getQuery('page', 1);
        $limit = (int) $this->request->getQuery('limit', 20);
        
        $query = $this->Families->find()
            ->contain(['Wards', 'PanchayathWards', 'FamilyStatuses']);
        
        $total = $query->count();
        
        $families = $query
            ->limit($limit)
            ->page($page)
            ->toArray();
        
        $this->set([
            'success' => true,
            'data' => $families,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => ceil($total / $limit)
            ]
        ]);
        $this->viewBuilder()->setOption('serialize', ['success', 'data', 'pagination']);
    }
    
    public function view($id)
    {
        $this->request->allowMethod(['get']);
        
        $family = $this->Families->get($id, [
            'contain' => ['Members', 'Wards', 'PanchayathWards', 'FamilyStatuses']
        ]);
        
        $this->set([
            'success' => true,
            'data' => $family
        ]);
        $this->viewBuilder()->setOption('serialize', ['success', 'data']);
    }
    
    public function add()
    {
        $this->request->allowMethod(['post']);
        
        $family = $this->Families->newEntity($this->request->getData());
        
        if ($this->Families->save($family)) {
            $this->set([
                'success' => true,
                'message' => 'Family created successfully',
                'data' => $family
            ]);
        } else {
            $this->response = $this->response->withStatus(400);
            $this->set([
                'success' => false,
                'message' => 'Failed to create family',
                'errors' => $family->getErrors()
            ]);
        }
        $this->viewBuilder()->setOption('serialize', ['success', 'message', 'data', 'errors']);
    }
    
    public function edit($id)
    {
        $this->request->allowMethod(['put', 'patch']);
        
        $family = $this->Families->get($id);
        $family = $this->Families->patchEntity($family, $this->request->getData());
        
        if ($this->Families->save($family)) {
            $this->set([
                'success' => true,
                'message' => 'Family updated successfully',
                'data' => $family
            ]);
        } else {
            $this->response = $this->response->withStatus(400);
            $this->set([
                'success' => false,
                'message' => 'Failed to update family',
                'errors' => $family->getErrors()
            ]);
        }
        $this->viewBuilder()->setOption('serialize', ['success', 'message', 'data', 'errors']);
    }
    
    public function delete($id)
    {
        $this->request->allowMethod(['delete']);
        
        $family = $this->Families->get($id);
        
        if ($this->Families->delete($family)) {
            $this->set([
                'success' => true,
                'message' => 'Family deleted successfully'
            ]);
        } else {
            $this->response = $this->response->withStatus(400);
            $this->set([
                'success' => false,
                'message' => 'Failed to delete family'
            ]);
        }
        $this->viewBuilder()->setOption('serialize', ['success', 'message']);
    }
}
```

### StatisticsController

Create `src/Controller/Api/StatisticsController.php`:

```php
<?php
namespace App\Controller\Api;

use App\Controller\AppController;

class StatisticsController extends AppController
{
    public function dashboard()
    {
        $this->request->allowMethod(['get']);
        
        $this->loadModel('Families');
        $this->loadModel('Members');
        $this->loadModel('BirthRegistrations');
        $this->loadModel('MarriageRegistrations');
        $this->loadModel('SubscriptionPendingPayments');
        
        $stats = [
            'total_families' => $this->Families->find()->count(),
            'total_members' => $this->Members->find()->count(),
            'total_male' => $this->Members->find()->where(['gender' => 'M'])->count(),
            'total_female' => $this->Members->find()->where(['gender' => 'F'])->count(),
            'recent_births' => $this->BirthRegistrations->find()
                ->where(['created_at >=' => date('Y-m-01')])
                ->count(),
            'recent_marriages' => $this->MarriageRegistrations->find()
                ->where(['created_at >=' => date('Y-m-01')])
                ->count(),
            'pending_subscriptions' => $this->SubscriptionPendingPayments->find()->count(),
        ];
        
        // Ward distribution
        $wardStats = $this->Families->find()
            ->select([
                'ward_id',
                'Wards.name',
                'count' => $this->Families->find()->func()->count('Families.id')
            ])
            ->contain(['Wards'])
            ->group('ward_id')
            ->toArray();
        
        $stats['ward_distribution'] = array_map(function($item) {
            return [
                'ward_id' => $item->ward_id,
                'ward_name' => $item->ward->name ?? 'Unknown',
                'family_count' => $item->count
            ];
        }, $wardStats);
        
        $this->set([
            'success' => true,
            'data' => $stats
        ]);
        $this->viewBuilder()->setOption('serialize', ['success', 'data']);
    }
}
```

---

## 5. Response Formats

All API responses should follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### List with Pagination
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

---

## Testing the API

Use these curl commands to test your endpoints:

```bash
# Login
curl -X POST http://localhost:8765/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mahallu.com","password":"password"}'

# Get families (with token)
curl -X GET http://localhost:8765/api/families \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get dashboard stats
curl -X GET http://localhost:8765/api/statistics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Additional Notes

1. **Security**: Make sure to use HTTPS in production
2. **Rate Limiting**: Consider adding rate limiting for API endpoints
3. **Validation**: Add proper validation in your entities
4. **Error Logging**: Implement comprehensive error logging
5. **API Documentation**: Consider using Swagger/OpenAPI for API docs

---

## Support

If you encounter issues:
1. Check CakePHP error logs
2. Verify JWT token generation/validation
3. Test endpoints with Postman
4. Check CORS headers in browser console
