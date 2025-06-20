# LocalHeroes Mobile App 🦸‍♂️

**LocalHeroes** is a community-driven mobile platform that connects people with local helpers, volunteers, and professionals. This React Native app built with Expo provides an intuitive interface for posting jobs, finding help, and getting AI-powered customer support.

## Features

- 🔐 **User Authentication** - Secure login and registration
- 📝 **Job Management** - Post, browse, and apply for local jobs
- 💬 **Real-time Messaging** - Chat with other users
- 🤖 **AI Customer Support** - Get instant help with our AI assistant
- 📍 **Location Services** - Find nearby opportunities
- ⭐ **Reviews & Ratings** - Build trust through feedback
- 📱 **Cross-platform** - Works on iOS, Android, and Web

## Prerequisites

Before running the app, make sure you have:

- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio & Emulator (for Android development)
- LocalHeroes Backend Server running (see backend README)

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npx expo start
   ```

3. **Choose your platform**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for Web browser
   - Scan QR code with Expo Go app on your phone

## Backend Configuration

The app requires the LocalHeroes backend server to be running. Make sure:

1. The backend server is running on `http://localhost:3000`
2. Update the API base URL in `app/services/api.ts` if needed:
   ```typescript
   const API_BASE_URL = 'http://localhost:3000'; // Update if different
   ```

## AI Customer Support Feature 🤖

The app includes an intelligent AI assistant powered by Google Gemini that helps users with:

- Platform navigation and usage
- Job posting and application guidance
- General support questions
- Quick help suggestions

### Using AI Support

1. Navigate to the **Customer Support** page
2. Tap the floating chat button in the bottom-right corner
3. Type your question or select from suggested topics
4. Get instant, helpful responses from our AI assistant

### AI Features

- **Smart Chat**: Ask questions in natural language
- **Quick Suggestions**: Pre-defined helpful topics
- **Context-Aware**: Understands LocalHeroes-specific queries
- **Always Available**: 24/7 instant support

## App Structure

```
app/
├── (tabs)/           # Tab navigation screens
├── components/       # Reusable components
│   └── AiChat.tsx   # AI chat modal component
├── constants/        # App constants and colors
├── context/         # React context providers
├── jobs/            # Job-related screens
├── services/        # API and external services
│   └── api.ts       # Main API service with AI endpoints
├── types/           # TypeScript type definitions
├── _layout.tsx      # Root layout
├── customer-support.tsx  # Customer support with AI chat
├── index.tsx        # Home screen
├── login.tsx        # Authentication screens
├── register.tsx
├── profile.tsx      # User profile management
└── settings.tsx     # App settings
```

## Key Screens

- **Home** (`index.tsx`) - Dashboard and job overview
- **Job Management** (`post-job.tsx`, `jobs/`) - Create and manage jobs
- **Customer Support** (`customer-support.tsx`) - Help center with AI chat
- **Profile** (`profile.tsx`) - User profile and settings
- **Authentication** (`login.tsx`, `register.tsx`) - User auth flows

## Development Commands

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run lint` - Lint the code

## Building for Production

### Android APK

```bash
npx expo build:android
```

### iOS IPA

```bash
npx expo build:ios
```

### Web Bundle

```bash
npx expo export:web
```

## Environment Configuration

Create a `.env` file if you need to configure environment-specific settings:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_APP_NAME=LocalHeroes
```

## Styling & UI

The app uses:

- **React Native Paper** - Material Design components
- **React Native Elements** - Additional UI components
- **Expo Vector Icons** - Icon library
- **Custom Styles** - Platform-specific styling

## Navigation

Built with **Expo Router** using file-based routing:

- Tabs for main navigation
- Stack navigation for detailed flows
- Modal navigation for overlays (like AI chat)

## Testing the AI Feature

To test the AI customer support:

1. Ensure the backend is running with a valid `GOOGLE_AI_API_KEY`
2. Open the app and navigate to "Customer Support"
3. Tap the blue chat button
4. Try asking questions like:
   - "How do I post a job?"
   - "What is LocalHeroes?"
   - "How do I apply for jobs?"

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **Backend connection**: Verify backend server is running on correct port
3. **AI chat not working**: Check backend server logs for API key issues
4. **Build errors**: Run `npm install` and restart development server
5. **iOS simulator issues**: Reset simulator content and settings

### Development Tips

- Use `console.log()` for debugging (visible in terminal/browser console)
- Hot reload is enabled by default for faster development
- Use React DevTools browser extension for debugging
- Test on both iOS and Android for platform-specific issues

## Dependencies

### Key Libraries

- **Expo** - Development platform and tools
- **React Navigation** - Navigation library
- **Axios** - HTTP client for API calls
- **React Native Paper** - Material Design components
- **Expo Location** - Location services
- **Expo Image Picker** - Image selection
- **React Native Vector Icons** - Icon components

## API Integration

The app communicates with the backend through REST APIs:

- Authentication endpoints
- Job management APIs
- Messaging services
- **AI Support APIs** (new):
  - `POST /ai-support/chat` - Chat with AI
  - `GET /ai-support/suggestions` - Get suggestions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test on multiple platforms
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://expo.github.io/router/)
- [React Native Paper](https://reactnativepaper.com/)

## Support

For technical support or questions about the AI features:

1. Use the in-app AI customer support
2. Check the backend server logs
3. Review this documentation
4. Contact the development team

---

**Happy coding! 🚀**
