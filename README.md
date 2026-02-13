# Passwordless Authentication Flow

React Native (Expo) passwordless authentication using Email + OTP with session tracking.

## Features

- 6-digit OTP with 60-second expiry
- Maximum 3 verification attempts
- Per-email OTP storage
- Live session timer (mm:ss)
- Session persistence via AsyncStorage
- Analytics event logging

## Setup Guide

Follow these steps to run the app

### Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Expo Go app** - Install on your mobile device from [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/hardiksharmaa/passwordlessAuthentication.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   press w to switch to web 
   press s to switch to expo Go
   ```

### Running on Mobile Device

1. Ensure your mobile device and computer are on the **same Wi-Fi network**
2. Open **Expo Go** app on your device
3. Scan the QR code displayed in the terminal or browser

### Tunnel Mode (Different Networks)

If your device and computer are on different networks:

```bash
npx expo start --tunnel
press s 
```

> Note: Tunnel mode requires `@expo/ngrok` which will be installed automatically on first use.

### Troubleshooting

| Issue | Solution |
|-------|----------|
| QR code not scanning | Use tunnel mode or check network connection |
| Metro bundler stuck | Clear cache with `npx expo start -c` |
| Dependencies issues | Delete `node_modules` and run `npm install` |

## Project Structure

```
src/
├── components/
│   ├── common/          # Button, Input, Typography
│   └── otp/             # OtpInput, CountdownTimer
├── constants/           # Config, theme
├── hooks/               # useSessionTimer
├── navigation/          # RootNavigator
├── screens/             # Login, OTP, Session
├── services/
│   ├── analytics.ts     # Event logging
│   ├── otpManager.ts    # OTP generation/validation
│   └── storage.ts       # Storage abstraction
└── types/               # TypeScript definitions
```

## OTP Logic

**Generation:** `OtpManager.generateOtp(email)` creates a 6-digit code, replaces any existing OTP for that email.

**Validation:** Checks in order:
1. OTP exists for email
2. Attempts < 3
3. Not expired (60s)
4. Code matches

**Resend:** Replaces old OTP, resets attempts and timer.

## Data Structures

```typescript
interface OtpRecord {
  otp: string;
  email: string;
  createdAt: number;   // For expiry calculation
  attempts: number;    // 0-3
  isValid: boolean;    // False after successful use
}

interface SessionData {
  email: string;
  startTime: number;   // Duration = Date.now() - startTime
}
```

OTP storage uses `Map<string, OtpRecord>` for O(1) email lookups.

## Storage: AsyncStorage

Using `@react-native-async-storage/async-storage` for persistent storage across all platforms (web, iOS, Android).

**Why AsyncStorage:**
- Works with Expo Go (no native build required)
- Async API integrates well with React hooks
- Cross-platform compatibility
- Built-in with Expo

**Storage Keys:**
- `passwordless_auth_session` - Session data (email, startTime)
- `passwordless_auth_analytics_log` - Analytics events (max 100)

## Analytics Events

- `OTP_GENERATED` - When OTP is requested
- `OTP_VALIDATION_SUCCESS` - Successful verification
- `OTP_VALIDATION_FAILURE` - Failed attempt
- `LOGOUT` - User logs out

## Edge Cases

| Case | Handling |
|------|----------|
| Expired OTP | Shows "Code expired", blocks verification |
| Max attempts | Prompts to request new code |
| App backgrounded | Uses timestamp diff, not counter |
| Component unmount | Clears intervals, prevents setState |

## Configuration

```typescript
// src/constants/config.ts
OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_SECONDS: 60,
  MAX_ATTEMPTS: 3,
}
```

## Tech Stack

- Expo SDK 54 (Managed)
- TypeScript
- React Navigation 7
- AsyncStorage (persistent storage)
- Inter Font

## GPT Assistance vs Personal Implementation

**GPT Helped With:**
- Initial project scaffolding and folder structure
- TypeScript interface definitions
- Email validation regex pattern
- AsyncStorage async/await patterns

**Understood and Implemented:**
- OTP business logic (per-email Map storage, attempt tracking, expiry via timestamps)
- Session timer using `Date.now() - startTime` (survives re-renders, background)
- Proper interval cleanup to prevent memory leaks
- Navigation flow with `navigation.reset()` on logout
- Separating SessionScreen into loader + content components for async data
