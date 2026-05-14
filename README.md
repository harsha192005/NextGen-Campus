# NextGen Smart Campus - Event & Hackathon Management Platform

A comprehensive, full-stack AI-powered college event and hackathon management system built with modern web technologies.

## 🚀 Features

### Student Features
- 📊 **Interactive Dashboard** - View upcoming events, XP points, achievements, and activity
- 📅 **Event Management** - Browse, filter, and register for campus events
- 🤖 **AI Assistant** - Get personalized event recommendations powered by Google Gemini
- 🏆 **Gamification** - Earn XP points, level up, and unlock achievement badges
- 📜 **Digital Certificates** - Auto-generated certificates with QR verification
- 👥 **Team Formation** - Create and join teams for hackathons
- 📈 **Leaderboard** - Track your ranking among peers
- 🔔 **Real-time Notifications** - Stay updated with event reminders

### Admin Features
- 📊 **Analytics Dashboard** - Comprehensive event and student analytics
- 🎯 **Event Management** - Create, edit, and manage all campus events
- 👨‍🎓 **Student Management** - Track student participation and engagement
- 📱 **QR Attendance System** - Quick and secure attendance tracking
- 🎓 **Certificate Generation** - Bulk certificate generation and management
- 📈 **Advanced Analytics** - Department-wise participation, trends, and insights
- 💬 **Feedback Management** - Collect and analyze event feedback

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Recharts** - Beautiful analytics charts
- **Lucide React** - Modern icon library
- **Zustand** - State management
- **React Router** - Client-side routing

### Libraries & Tools
- **jsPDF** - PDF certificate generation
- **QRCode** - QR code generation
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client
- **date-fns** - Date utilities

### Planned Backend (Not included in frontend demo)
- **Node.js + Express.js** - REST API
- **MongoDB Atlas** - Database
- **JWT/Firebase** - Authentication
- **Cloudinary** - Image uploads
- **Google Gemini API** - AI features
- **EmailJS** - Email notifications

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextgen-campus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🎨 Design Features

### Modern UI/UX
- **Glassmorphism** - Frosted glass effects
- **Neon Gradients** - Vibrant color schemes
- **Dark Mode** - Full dark mode support
- **Smooth Animations** - Framer Motion powered
- **Responsive Design** - Mobile-first approach
- **Loading States** - Skeleton loaders
- **Toast Notifications** - User feedback

### Color Palette
- Primary: Blue to Purple gradient
- Secondary: Purple to Pink gradient
- Accent: Orange, Green, Cyan
- Background: Gray tones with gradients

## 📱 Demo Credentials

### Admin Access
- Email: `admin@college.edu`
- Password: `any`

### Student Access
- Email: `student@college.edu`
- Password: `any`

## 🗂️ Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # Base UI components
│   └── Layout.tsx    # Dashboard layout
├── pages/            # Page components
│   ├── student/      # Student pages
│   └── admin/        # Admin pages
├── store/            # Zustand state management
├── services/         # API services & mock data
├── types/            # TypeScript types
├── lib/              # Utilities & configs
└── App.tsx           # Main app with routing
```

## 🎯 Key Features Implementation

### Authentication System
- JWT-based authentication
- Role-based access control (Admin, Student, Organizer, Volunteer)
- Protected routes
- Persistent login with localStorage

### Event Management
- Multiple event categories (Technical, Non-Tech, Career, Sports, Hackathon)
- Event filtering and search
- Registration tracking
- Capacity management
- QR code generation for events

### Gamification
- XP points system
- User levels
- Achievement badges
- Leaderboards
- Department battles

### AI Features (Mock Implementation)
- Event recommendations
- AI chatbot assistant
- Smart event matching
- Feedback analysis

### Certificate System
- Auto-generated PDF certificates
- QR code verification
- Unique certificate numbers
- Download functionality

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

### Backend (Render) - Planned
1. Create MongoDB Atlas cluster
2. Set up Express API
3. Deploy to Render
4. Configure environment variables

## 📊 Analytics & Insights

The platform provides comprehensive analytics:
- Event participation trends
- Department-wise engagement
- Student activity tracking
- Event success metrics
- Attendance rates
- Feedback analysis

## 🔒 Security Features

- JWT authentication
- Protected API routes
- Role-based access control
- Input validation
- XSS protection
- CORS configuration

## 🎓 Use Cases

### Educational Institutions
- College event management
- Hackathon hosting
- Workshop organization
- Cultural fest management
- Sports event tracking
- Career fair coordination

### Features by Event Type

**Technical Events**
- Hackathons
- Coding contests
- Workshops
- Bootcamps

**Non-Tech Events**
- Cultural festivals
- Competitions
- Exhibitions

**Career Events**
- Placement drives
- Internship fairs
- Alumni meetups

**Sports Events**
- Tournaments
- Competitions
- Sports fests

## 🤝 Contributing

This is a demo project showcasing a full-stack event management system. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Use as a template for your projects

## 📝 Future Enhancements

- [ ] Real backend API integration
- [ ] Live Google Gemini AI integration
- [ ] Real-time notifications with WebSockets
- [ ] Video streaming for online events
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Advanced team matching algorithm
- [ ] Multi-language support
- [ ] Event live streaming
- [ ] Social media integration

## 🐛 Known Issues

- Some TypeScript warnings (unused imports)
- Mock data for demo purposes
- AI features use simulated responses

## 📄 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Author

Built with ❤️ for college communities worldwide

## 🙏 Acknowledgments

- React Team
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide Icons
- All open-source contributors

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check documentation
- Review demo credentials above

---

**Made with modern web technologies for the next generation of smart campuses! 🚀**
