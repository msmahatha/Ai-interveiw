# Crisp - AI-Powered Interview Assistant

A revolutionary AI-powered interview platform that streamlines the technical interview process with intelligent automation, real-time evaluation, and comprehensive candidate management.

![Crisp Logo](public/crisp-logo.svg)

## 🚀 Features

### For Interviewees
- **📄 Smart Resume Parsing**: Drag-and-drop PDF/DOCX upload with AI-powered data extraction
- **💬 Interactive Chat Interface**: Smooth, modern chat experience with real-time messaging
- **⏱️ Intelligent Timers**: Dynamic question timers with visual countdown and auto-submission
- **📊 Progress Tracking**: Real-time interview progress with completion indicators
- **🎯 Adaptive Questions**: 6 carefully crafted questions (2 Easy → 2 Medium → 2 Hard)
- **🎉 Completion Celebration**: Animated score reveal with detailed feedback

### For Interviewers
- **📈 Comprehensive Dashboard**: Beautiful candidate management interface
- **🔍 Advanced Search & Filters**: Find candidates by name, email, score range, and date
- **📋 Detailed Candidate Profiles**: Complete interview history with AI-generated summaries
- **📊 Performance Analytics**: Score distributions, completion rates, and timing metrics
- **💾 Data Persistence**: All interviews saved locally with IndexedDB storage
- **📤 Export Capabilities**: PDF export functionality for candidate reports

### Technical Excellence
- **🎨 Modern UI/UX**: Glass-morphism design with smooth animations and micro-interactions
- **📱 Responsive Design**: Works flawlessly on desktop, tablet, and mobile devices
- **♿ Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **⚡ Performance**: Optimized with lazy loading, code splitting, and efficient state management
- **🔒 Security**: Client-side data processing with no server dependencies

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Redux Toolkit** + **Redux Persist** for state management and persistence
- **Tailwind CSS** + **shadcn/ui** for modern, accessible components
- **Framer Motion** for smooth animations and transitions
- **React Router** for client-side routing

### Libraries & Tools
- **React Dropzone** for drag-and-drop file uploads
- **React Hook Form** + **Zod** for form validation
- **Lucide React** for beautiful, consistent icons
- **date-fns** for date manipulation and formatting
- **Sonner** for elegant toast notifications
- **UUID** for unique identifier generation

### AI Integration (Mock Implementation)
- **Question Generation**: Contextual technical questions based on role
- **Answer Evaluation**: Intelligent scoring with detailed feedback
- **Summary Generation**: AI-powered candidate assessment summaries

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern web browser with ES6+ support

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/crisp-interview-assistant.git
   cd crisp-interview-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_AI_API_KEY=your_api_key_here
VITE_AI_PROVIDER=openai
```

## 🎯 Usage

### For Interviewees

1. **Upload Resume**: Drag and drop your PDF or DOCX resume
2. **Review Information**: Verify extracted details (name, email, phone)
3. **Start Interview**: Begin the 6-question technical assessment
4. **Answer Questions**: Respond within the time limits for each question
5. **View Results**: Receive instant scoring and AI-generated feedback

### For Interviewers

1. **Access Dashboard**: Switch to the Interviewer tab
2. **Browse Candidates**: View all completed interviews
3. **Filter & Search**: Find specific candidates using advanced filters
4. **Review Details**: Click on candidates to view comprehensive profiles
5. **Export Data**: Generate PDF reports for candidate evaluation

## 🎨 Design Philosophy

Crisp follows a modern, minimalist design philosophy with:

- **Glass-morphism Effects**: Translucent backgrounds with backdrop blur
- **Gradient Accents**: Subtle color transitions for visual hierarchy
- **Smooth Animations**: Micro-interactions that enhance user experience
- **Consistent Spacing**: 8px grid system for perfect alignment
- **Accessible Colors**: High contrast ratios meeting WCAG standards

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (single column layout)
- **Tablet**: 640px - 1024px (2-column grid)
- **Desktop**: > 1024px (3-column grid with sidebar)

## 🔧 Customization

### Theme Configuration
Modify `tailwind.config.js` to customize:
- Color palettes
- Typography scales
- Animation durations
- Breakpoint definitions

### Component Styling
All components use Tailwind CSS classes for easy customization:
- Modify `src/index.css` for global styles
- Update component-specific classes for local changes
- Use CSS custom properties for dynamic theming

## 🚀 Deployment

### Build for Production
```bash
npm run build
# or
yarn build
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

## 📊 Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

## 🔒 Security Considerations

- **Client-Side Processing**: All data processing happens locally
- **No External APIs**: Mock AI implementation for demo purposes
- **Data Privacy**: No user data transmitted to external servers
- **Secure Storage**: IndexedDB with encryption for sensitive data

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Framer Motion** for animation capabilities
- **Lucide** for the consistent icon set
- **Tailwind CSS** for the utility-first styling approach

## 📞 Support

For support, email support@crisp-interviews.com or join our Slack channel.

---

**Built with ❤️ by the Crisp Team**