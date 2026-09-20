import type { OrbitAction } from '../types';

export type OrbitIntent = 'EMERGENCY' | 'CONNECTION_CHECK' | 'DELAY' | 'HOLD_SHUTTLE' | 'STEP_FREE_ROUTE' | 'CHEAPEST_ROUTE' | 'OPEN_JOURNEY' | 'KEEP_JOURNEY' | 'VIEW_ALTERNATIVE' | 'PLAN_FIRST_JOURNEY' | 'UNKNOWN';

export interface OrbitContext {
  hasJourney: boolean;
  emergencyActive: boolean;
}

export interface OrbitResolution { intent: OrbitIntent; params: Record<string, string>; }

const matches = (text: string, pattern: RegExp) => pattern.test(text.trim().toLowerCase());

export function resolveIntent(text: string, context: OrbitContext): OrbitResolution {
  const value = text.trim().toLowerCase().slice(0, 500);
  if (matches(value, /\b(?:help|sos|emergency|ambulance|fire|hurt|injured|unconscious|collapsed|attack|accident|police|unsafe)\b/)) return { intent: 'EMERGENCY', params: {} };
  if (matches(value, /\b(?:will i make|check|what about)\b.*\bconnection\b/) || matches(value, /\bconnection\b.*\b(?:safe|risk|make)\b/)) return { intent: context.hasJourney ? 'CONNECTION_CHECK' : 'PLAN_FIRST_JOURNEY', params: {} };
  if (matches(value, /\b(?:delay|delayed|late)\b/)) return { intent: context.hasJourney ? 'DELAY' : 'PLAN_FIRST_JOURNEY', params: {} };
  if (matches(value, /\bhold\b.*\b(?:shuttle|connection)\b/)) return { intent: context.hasJourney ? 'HOLD_SHUTTLE' : 'PLAN_FIRST_JOURNEY', params: {} };
  if (matches(value, /\b(?:step-free|wheelchair|accessible|reduced walking)\b/)) return { intent: 'STEP_FREE_ROUTE', params: {} };
  if (matches(value, /\b(?:cheapest|lowest cost|save credits)\b/)) return { intent: 'CHEAPEST_ROUTE', params: {} };  if (matches(value, /\b(?:view|open|show)\b.*\b(?:journey|trip)\b/)) return { intent: 'OPEN_JOURNEY', params: {} };
  if (matches(value, /\b(?:alternative|another route|reroute)\b/)) return { intent: 'VIEW_ALTERNATIVE', params: {} };
  if (matches(value, /\b(?:keep|stay on)\b.*\b(?:journey|route)\b/)) return { intent: 'KEEP_JOURNEY', params: {} };
  if (matches(value, /\b(?:plan|first journey|get me there)\b/)) return { intent: 'PLAN_FIRST_JOURNEY', params: {} };
  return { intent: 'UNKNOWN', params: {} };
}

export function actionForIntent(intent: OrbitIntent): {label: string;action: OrbitAction}[] {
  const actions: Partial<Record<OrbitIntent, {label: string;action: OrbitAction}[]>> = {
    EMERGENCY: [{ label: 'Send for Help', action: 'DISPATCH_SOS' }, { label: 'Open Emergency', action: 'OPEN_EMERGENCY' }],
    CONNECTION_CHECK: [{ label: 'Check Connection', action: 'CHECK_CONNECTION' }],
    DELAY: [{ label: 'Hold Connection', action: 'HOLD_SHUTTLE' }, { label: 'View Alternative', action: 'VIEW_ALTERNATIVE' }],
    HOLD_SHUTTLE: [{ label: 'Hold Shuttle', action: 'HOLD_SHUTTLE' }],
    VIEW_ALTERNATIVE: [{ label: 'View Alternative', action: 'VIEW_ALTERNATIVE' }],
    KEEP_JOURNEY: [{ label: 'Keep Current Journey', action: 'KEEP_JOURNEY' }],
    OPEN_JOURNEY: [{ label: 'Open Journey', action: 'OPEN_JOURNEY' }],
    PLAN_FIRST_JOURNEY: [{ label: 'Plan First Journey', action: 'PLAN_FIRST_JOURNEY' }],
    CHEAPEST_ROUTE: [{ label: 'Plan Cheapest Route', action: 'PLAN_FIRST_JOURNEY' }]
  };
  return actions[intent] ?? [];
}