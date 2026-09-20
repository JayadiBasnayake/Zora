import { user as demoUser } from '../data/journey';
import { readStorage, removeStorage, writeStorage } from '../utils/storage';
import type { RouteOption } from '../types';
import { buildRouteOptions } from '../utils/routing';

export interface MockUser {
  id: string;
  fullName: string;
  email: string;
  passId: string;
  onboardingComplete: boolean;
  termsAccepted: boolean;
}

export interface MockSession {
  token: string;
  userId: string;
  expiresAt: number;
  remember: boolean;
}

export interface MockEmergency {
  active: boolean;
  category: string;
  location: string;
  vehicle: string;
  incidentId: string;
  etaSeconds: number;
  dispatchedAt: number;
}

interface StoredAccount extends MockUser { passwordHash: string; }
const accountsKey = 'transport-accounts';
const sessionKey = 'transport-session';
const demoEmail = 'demo@transport2100.city';
const demoPassword = 'Demo-Pass-2100!';

const delay = (ms = 180) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
const token = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

async function hashPassword(password: string) {
  // MOCK: a real backend must use Argon2 or bcrypt server-side with a unique salt.
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function accounts(): StoredAccount[] { return readStorage<StoredAccount[]>(accountsKey) ?? []; }
function saveAccounts(value: StoredAccount[]) { writeStorage(accountsKey, value); }
function cleanEmail(email: string) { return email.trim().toLowerCase().slice(0, 160); }

function demoAccount(): StoredAccount {
  return {
    id: 'demo-jayadi', fullName: demoUser.fullName, email: demoEmail, passId: demoUser.passId,
    onboardingComplete: true, termsAccepted: true, passwordHash: ''
  };
}

export async function register(input: { fullName: string; email: string; password: string; acceptedTerms: boolean }) {
  await delay();
  const email = cleanEmail(input.email);
  if (!input.fullName.trim() || !email.includes('@') || input.password.length < 10 || !input.acceptedTerms) throw new Error('Please complete all required fields.');
  const existing = accounts().some((account) => account.email === email) || email === demoEmail;
  if (existing) throw new Error('An account with this email already exists.');
  const account: StoredAccount = {
    id: `user-${token()}`, fullName: input.fullName.trim().slice(0, 120), email,
    passId: `UMP-${token().slice(0, 4).toUpperCase()}-${token().slice(0, 4).toUpperCase()}`,
    onboardingComplete: false, termsAccepted: true, passwordHash: await hashPassword(input.password)
  };
  saveAccounts([...accounts(), account]);
  return account;
}

export async function signIn(input: { email: string; password: string; remember: boolean }): Promise<MockSession> {
  await delay();
  const email = cleanEmail(input.email);
  const account = email === demoEmail ? demoAccount() : accounts().find((candidate) => candidate.email === email);
  const valid = account && (email === demoEmail ? input.password === demoPassword : account.passwordHash === await hashPassword(input.password));
  if (!valid) throw new Error('Email or password is incorrect');
  const session = { token: token(), userId: account.id, expiresAt: Date.now() + (input.remember ? 60 : 30) * 60 * 1000, remember: input.remember };
  writeStorage(sessionKey, session, input.remember ? 'local' : 'session');
  return session;
}

export async function restoreSession() {
  await delay(120);
  return readStorage<MockSession>(sessionKey, 'session') ?? readStorage<MockSession>(sessionKey, 'local');
}

export function signOut() {
  removeStorage(sessionKey, 'session');
  removeStorage(sessionKey, 'local');
}

export async function forgotPassword(_email: string) {
  await delay();
  void _email;
  // MOCK: always return the same response to prevent account enumeration.
  return 'If an account exists, a reset link was sent.';
}

export async function loadUser(userId: string): Promise<MockUser | null> {
  await delay(40);
  if (userId === 'demo-jayadi') return demoAccount();
  return accounts().find((account) => account.id === userId) ?? null;
}

export async function updateUser(userId: string, patch: Partial<MockUser>) {
  await delay(60);
  const updated = accounts().map((account) => account.id === userId ? { ...account, ...patch } : account);
  saveAccounts(updated);
  return updated.find((account) => account.id === userId) ?? null;
}


export async function dispatchEmergency(category: string, location: string, vehicle = ''): Promise<MockEmergency> {
  await delay(120);
  if ((globalThis as {__TRANSPORT_MOCK_EMERGENCY_FAILURE__?: boolean}).__TRANSPORT_MOCK_EMERGENCY_FAILURE__) throw new Error('Emergency dispatch is unavailable.');
  // MOCK: a real backend dispatches to emergency operators and returns a signed incident record.
  return { active: true, category, location, vehicle, incidentId: token(), etaSeconds: 120, dispatchedAt: Date.now() };
}

export async function saveEmergency(userId: string | null, emergency: MockEmergency | null) {
  if (!userId) return;
  if (emergency) writeStorage(`transport-emergency:${userId}`, emergency);
  else removeStorage(`transport-emergency:${userId}`);
}

export function restoreEmergency(userId: string | null) {
  return userId ? readStorage<MockEmergency>(`transport-emergency:${userId}`) : null;
}

export interface RouteSearchQuery {
  from: string; to: string; date: string; time: string; passengers: number;
  accessibility: string[];}

export async function searchRoutes(query: RouteSearchQuery): Promise<RouteOption[]> {
  await delay(260);
  const from = query.from.trim();
  const to = query.to.trim();
  if (!from || !to || from.toLowerCase() === to.toLowerCase()) return [];
  // Generic graph search: works between ANY two known places (network
  // stations or real towns/landmarks), not just a single hardcoded pair.
  const found = buildRouteOptions(from, to, { timeHHMM: query.time, passengers: query.passengers });
  return found.filter((route) => query.accessibility.every((feature) => route.accessibility[feature as keyof RouteOption['accessibility']] === 'yes'));
}
