export function isDemoUser(user: {id?: string} | null | undefined) {
  return user?.id === 'demo-jayadi';
}