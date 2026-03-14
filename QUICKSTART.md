# Quick Start Guide - Mahallu Frontend

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites Check
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

### 2. Setup
```bash
# Navigate to project
cd mahallu-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local and set your backend URL
# NEXT_PUBLIC_API_URL=https://services.mahallu.com/api
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. What You'll See

- **Homepage** - Modern landing page with statistics
- **Families** - Browse family directory (demo data if backend not connected)
- **Login** - Admin login page with link to CakePHP backend

### 5. Backend Connection

The frontend will work with mock/demo data if the backend is not available. To connect to your CakePHP backend:

1. Ensure backend is running at `services.mahallu.com`
2. Configure CORS in CakePHP (see BACKEND_INTEGRATION.md)
3. Set up API endpoints (see BACKEND_INTEGRATION.md)
4. The frontend will automatically connect

### 6. Key Files to Know

- `lib/api.ts` - All backend API calls
- `app/page.tsx` - Homepage
- `app/families/page.tsx` - Family listing
- `app/login/page.tsx` - Login page
- `components/Navigation.tsx` - Main navigation

### 7. Development Tips

**Hot Reload**: Changes to code will auto-refresh the browser

**API Testing**: Open browser DevTools → Network tab to see API calls

**Mock Data**: Most pages show demo data if backend isn't connected

**Styling**: Uses Tailwind CSS - modify classes in components

### 8. Build for Production
```bash
npm run build
npm start
```

### 9. Common Issues

**Port 3000 already in use?**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
npm run dev -- -p 3001
```

**API not connecting?**
- Check browser console for CORS errors
- Verify backend URL in .env.local
- Ensure backend CORS is configured

**Styling not working?**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### 10. Next Steps

1. ✅ Review the full README.md for detailed documentation
2. ✅ Check BACKEND_INTEGRATION.md for CakePHP setup
3. ✅ Customize colors in tailwind.config.js
4. ✅ Add your logo in public/ folder
5. ✅ Configure environment variables for production

## 📚 Documentation

- `README.md` - Full documentation
- `BACKEND_INTEGRATION.md` - CakePHP integration guide
- Next.js Docs: https://nextjs.org/docs

## 🎨 Customization

**Change Colors:**
Edit `tailwind.config.js` → `theme.extend.colors`

**Change Logo:**
Edit `components/Navigation.tsx`

**Add Pages:**
Create files in `app/` directory

## ⚡ Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Axios

---

**Ready to build something amazing!** 🚀
