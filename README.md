# TRANSPORT 2100

Citizen-first transportation platform prototype for Sri Lanka in 2100. All server behaviour is mocked in `src/services/mockApi.ts`.

## Getting Started

1. Run `npm install`
2. Run `npm run dev`

## Demo account

Use the demo account on the sign-in screen:

- Email: `demo@transport2100.city`
- Password: `Demo-Pass-2100!`

The demo account opens the seeded Jayadi Perera mobility world. Other registered accounts start with a new-user profile and complete onboarding before entering the app.

## Deep links

The app uses BrowserRouter. Configure the host to serve `index.html` for unknown routes in production (for example, a Netlify `_redirects` rule: `/* /index.html 200`).
