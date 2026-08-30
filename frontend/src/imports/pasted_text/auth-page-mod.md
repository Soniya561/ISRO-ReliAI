Modify the CURRENT ISRO RELI-AI authentication page only. Do NOT create separate pages, routes, screens, or navigation for authentication.

Keep the existing overall layout, logo, background grid, branding, colors, and centered authentication card.

REMOVE completely:
- Username field
- Demo Access box
- isro_demo username
- reliai2026 password
- "Demo access" text
- Any hardcoded credentials
- Any demo-only authentication logic

Replace the current authentication card with a SINGLE interactive authentication component.

IMPORTANT:
Sign In, Sign Up, and Forgot Password must all work INSIDE THE SAME CARD on the SAME PAGE. When the user clicks them, dynamically change the contents of the card instead of navigating to another page.

### DEFAULT STATE — SIGN IN

Show:

ISRO RELI-AI
Component Reliability Intelligence

Card title:
"Sign In"

Subtitle:
"Access the reliability screening dashboard"

Fields:

EMAIL ADDRESS
[ Enter your email address ]

PASSWORD
[ Enter your password                         👁 ]

Below:
[✓] Remember me                    Forgot Password?

Primary button:
[ Sign In ]

At the bottom:
"Don't have an account? Sign Up"

The email field must accept any properly formatted email address.

The password field must accept any non-empty password.

Do NOT require a specific email or password such as demo credentials.

### SIGN UP — SAME CARD

When the user clicks "Sign Up", DO NOT open another page.

Change the contents of the SAME authentication card smoothly.

Title:
"Create Account"

Subtitle:
"Create your RELI-AI account"

Fields:

FULL NAME
[ Enter your full name ]

EMAIL ADDRESS
[ Enter your email address ]

PASSWORD
[ Create your password                         👁 ]

CONFIRM PASSWORD
[ Confirm your password                    👁 ]

Show password requirements underneath:

✓ At least 8 characters
✓ One uppercase letter
✓ One lowercase letter
✓ One number
✓ One special character

Button:
[ Create Account ]

Bottom:
"Already have an account? Sign In"

Clicking "Sign In" must return to the Sign In form inside the SAME CARD.

### FORGOT PASSWORD — SAME CARD

When "Forgot Password?" is clicked, do NOT navigate away.

Replace the contents of the SAME CARD with:

Title:
"Reset Password"

Subtitle:
"Enter your email address to receive a password reset link."

EMAIL ADDRESS
[ Enter your email address ]

Button:
[ Send Reset Link ]

Bottom:
"Remember your password? Sign In"

Clicking "Sign In" returns to the original Sign In form in the same card.

### PROTOTYPE FUNCTIONALITY

Make the interactions work in the Figma prototype.

SIGN IN:
- Validate email format.
- Password cannot be empty.
- If valid, show a small success state:
  "Sign in successful"
  "Welcome to RELI-AI"
- Then allow the user to continue to the existing Reliability Screening Dashboard.
- Do NOT require hardcoded demo credentials.

SIGN UP:
- Validate full name.
- Validate email format.
- Password must meet the displayed requirements.
- Confirm password must match.
- On valid input, show:
  "Account created successfully"
  "Your RELI-AI account is ready."
- Keep the user on the SAME PAGE.
- Provide a "Continue to Sign In" action that returns to the Sign In state.

FORGOT PASSWORD:
- Validate email format.
- On valid input show:
  "Reset link sent"
  "Check your email for instructions to reset your password."
- Keep the user on the SAME PAGE.
- Provide "Back to Sign In".

### IMPORTANT AUTHENTICATION RULE

This is a prototype, so simulate the authentication behavior.

Do NOT hardcode:
isro_demo
reliai2026

The user should be able to type their OWN email and password.

Accept any valid email format and any non-empty password for Sign In.

Do not display any demo credentials anywhere.

### VISUAL DESIGN

Preserve the existing ISRO RELI-AI visual identity:

- Light aerospace blueprint/grid background
- Navy blue branding
- Blue primary buttons
- White rounded authentication card
- Subtle shadows
- Clean technical typography
- Small aerospace/AI visual details
- Professional enterprise interface
- Responsive layout

Do not redesign the whole website.

ONLY replace the existing authentication section with this interactive single-card authentication system.

FINAL BEHAVIOR:

Current Page
     ↓
┌──────────────────────────────┐
│          SIGN IN             │
│                              │
│ Email                        │
│ Password                     │
│ Forgot Password?             │
│                              │
│       [ Sign In ]            │
│                              │
│ Don't have account? Sign Up  │
└──────────────────────────────┘

Click "Sign Up"
     ↓
SAME CARD changes to Sign Up

Click "Forgot Password?"
     ↓
SAME CARD changes to Forgot Password

Click "Sign In"
     ↓
SAME CARD returns to Sign In

NEVER navigate to a separate authentication page.