export type AccessibilityFeature = 'step-free' | 'wheelchair-space' | 'low-vision' | 'hearing' | 'child-friendly' | 'senior-friendly' | 'luggage' | 'assistance-animal' | 'reduced-walking' | 'companion';
export type AccessibilityStatus = 'yes' | 'partial' | 'no' | 'unknown';
export type AccessibilityProfile = AccessibilityFeature[];

export const accessibilityFeatures: {id: AccessibilityFeature;label: string;}[] = [
  { id: 'step-free', label: 'Step-free' },
  { id: 'wheelchair-space', label: 'Wheelchair space' },
  { id: 'low-vision', label: 'Low-vision friendly' },
  { id: 'hearing', label: 'Hearing assistance' },
  { id: 'child-friendly', label: 'Child-friendly' },
  { id: 'senior-friendly', label: 'Senior-friendly' },
  { id: 'luggage', label: 'Luggage-friendly' },
  { id: 'assistance-animal', label: 'Assistance animal' },
  { id: 'reduced-walking', label: 'Reduced walking' },
  { id: 'companion', label: 'Companion travel' }
];

export const accessibilityUnknown: Record<AccessibilityFeature, AccessibilityStatus> = {
  'step-free': 'unknown', 'wheelchair-space': 'unknown', 'low-vision': 'unknown', hearing: 'unknown',
  'child-friendly': 'unknown', 'senior-friendly': 'unknown', luggage: 'unknown', 'assistance-animal': 'unknown',
  'reduced-walking': 'unknown', companion: 'unknown'
};
