import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { App } from '../src/App';

describe('public emergency access', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.pushState({}, '', '/emergency');
  });

  it('keeps signed-out users on the emergency route', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByRole('heading', { name: /i need help/i })).toBeInTheDocument());
    expect(window.location.pathname).toBe('/emergency');
  });
});