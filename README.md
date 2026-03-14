# Mahallu Management System - Frontend

A modern, responsive frontend for the Kerala Muslim Mahallu Management System built with Next.js, React, and TypeScript.

## Features

- 🎨 **Modern UI Design** - Islamic-inspired design with geometric patterns and elegant typography
- 📱 **Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Fast Performance** - Built with Next.js for optimal performance
- 🔒 **Secure Authentication** - JWT-based authentication with CakePHP backend
- 📊 **Dashboard Analytics** - Real-time statistics and insights
- 👥 **Family Management** - Browse and manage family records
- 🔍 **Advanced Search** - Filter and search through records
- 📝 **Registration System** - Birth and marriage registration tracking

## Technology Stack

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Data Fetching**: SWR
- **Icons**: Lucide React
- **Charts**: Recharts

## Prerequisites

- Node.js 18+ 
- npm or yarn
- CakePHP backend running at `services.mahallu.com`

## Installation

1. **Clone or extract the project**
   ```bash
   cd mahallu-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=https://services.mahallu.com/api
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Backend Integration

### CakePHP API Requirements

Your CakePHP backend needs to provide the following API endpoints:

#### Authentication
```php
POST /api/users/login
Body: { "email": "user@example.com", "password": "password" }
Response: { "token": "jwt_token", "user": {...} }
```

#### Families
```php
GET /api/families?page=1&limit=20
GET /api/families/:id
POST /api/families
PUT /api/families/:id
DELETE /api/families/:id
```

#### Members
```php
GET /api/members?page=1&limit=20&family_id=123
GET /api/members/:id
POST /api/members
PUT /api/members/:id
```

#### Birth Registrations
```php
GET /api/birth-registrations?page=1&limit=20
POST /api/birth-registrations
```

#### Marriage Registrations
```php
GET /api/marriage-registrations?page=1&limit=20
POST /api/marriage-registrations
```

#### Dashboard Statistics
```php
GET /api/statistics/dashboard
Response: {
  "total_families": 1250,
  "total_members": 5480,
  "total_male": 2760,
  "total_female": 2720,
  "recent_births": 23,
  "recent_marriages": 12,
  "pending_subscriptions": 45,
  "ward_distribution": [...]
}
```

#### Master Data
```php
GET /api/wards
GET /api/panchayath-wards
GET /api/educations
```

### CakePHP CORS Configuration

Add CORS middleware to your CakePHP backend (`src/Application.php`):

```php
// In Application.php bootstrap() method
$this->addPlugin('Cors', [
    'routes' => true,
]);

// In config/cors.php
return [
    'AllowOrigin' => ['http://localhost:3000', 'https://yourdomain.com'],
    'AllowMethods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'AllowHeaders' => ['Content-Type', 'Authorization', 'X-Requested-With'],
    'AllowCredentials' => true,
    'ExposeHeaders' => ['Link'],
    'MaxAge' => 300,
];
```

### Sample CakePHP Controller

```php
<?php
namespace App\Controller\Api;

use Cake\Controller\Controller;

class FamiliesController extends Controller
{
    public function initialize(): void
    {
        parent::initialize();
        $this->loadComponent('RequestHandler');
        $this->loadComponent('Authentication.Authentication');
    }

    public function index()
    {
        $this->request->allowMethod(['get']);
        
        $page = $this->request->getQuery('page', 1);
        $limit = $this->request->getQuery('limit', 20);
        
        $families = $this->Families->find()
            ->contain(['Users', 'Wards'])
            ->limit($limit)
            ->page($page);
        
        $this->set([
            'data' => $families,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $families->count(),
                'totalPages' => ceil($families->count() / $limit)
            ]
        ]);
        $this->viewBuilder()->setOption('serialize', ['data', 'pagination']);
    }

    public function view($id)
    {
        $this->request->allowMethod(['get']);
        
        $family = $this->Families->get($id, [
            'contain' => ['Members', 'Wards', 'Users']
        ]);
        
        $this->set('data', $family);
        $this->viewBuilder()->setOption('serialize', ['data']);
    }
}
```

## Project Structure

```
mahallu-frontend/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── families/          # Families pages
│   ├── members/           # Members pages
│   ├── login/             # Login page
│   └── dashboard/         # Dashboard (admin)
├── components/            # Reusable components
│   ├── Navigation.tsx     # Main navigation
│   └── StatsOverview.tsx  # Statistics component
├── lib/                   # Utility libraries
│   └── api.ts            # API service layer
├── types/                 # TypeScript type definitions
│   └── index.ts
├── public/               # Static files
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── tailwind.config.js    # Tailwind CSS config
└── next.config.js        # Next.js config
```

## Customization

### Color Scheme
Edit `tailwind.config.js` to customize the color palette:

```javascript
colors: {
  primary: {
    // Your custom colors
  },
  islamic: {
    gold: '#D4AF37',
    green: '#006B3F',
    // ...
  }
}
```

### API URL
Change the backend URL in `.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

### Styling
Global styles are in `app/globals.css`. Component-specific styles use Tailwind utility classes.

## Building for Production

```bash
npm run build
npm start
```

Or build a static export:
```bash
npm run build
# Add to next.config.js: output: 'export'
```

## Deployment Options

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Traditional Hosting
1. Build the project: `npm run build`
2. Upload `.next`, `public`, `package.json`, `next.config.js`
3. Run `npm install --production`
4. Start with `npm start`

## Authentication Flow

1. User enters credentials on login page
2. Frontend sends POST to `/api/users/login`
3. Backend validates and returns JWT token
4. Frontend stores token in localStorage
5. Token included in all subsequent API requests
6. Token validated on backend for protected routes

## Features Roadmap

- [ ] Dashboard with advanced analytics
- [ ] Member profile pages
- [ ] Subscription payment tracking
- [ ] Report generation
- [ ] Export to PDF/Excel
- [ ] SMS/Email notifications
- [ ] Multi-language support (Malayalam)
- [ ] Mobile app (React Native)

## Troubleshooting

### CORS Issues
Ensure CakePHP backend has CORS properly configured for your frontend domain.

### API Connection Failed
1. Check if backend is running
2. Verify API URL in `.env.local`
3. Check browser console for errors
4. Test API endpoints with Postman

### Authentication Issues
1. Verify JWT token format
2. Check token expiration
3. Ensure Authorization header is sent
4. Verify backend authentication middleware

## Support

For issues or questions:
- Check the documentation
- Review CakePHP backend logs
- Inspect browser console for errors

## License

This project is part of the Mahallu Management System.

---

**Note**: This frontend is designed to work with the existing CakePHP backend. Ensure your backend API endpoints match the expected format and structure.
