
import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import Note from '../../app/(tabs)/note';

jest.mock('expo-router', () => ({
  useRouter: () => ({ 
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn()
  }),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve('fake_token')),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'View', 
}));


global.fetch = jest.fn((url) => {
  if (url.toString().includes('/api/notes')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        data: [
          {
            id: 1,
            title: 'Ma première note',
            content: 'Contenu de test',
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
            categories: [
              {
                id: 1,
                name: 'Catégorie 1',
                color: '#ff0000'
              }
            ]
          }
        ]
      }),
    });
  }
  
  if (url.toString().includes('/api/categories')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        data: [
          {
            id: 1,
            name: 'Catégorie 1',
            color: '#ff0000'
          }
        ]
      }),
    });
  }
  
  return Promise.reject(new Error('URL non mockée'));
});

describe('Composant Note', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche les notes', async () => {
    render(<Note />);
    
    await waitFor(() => {
      expect(screen.getByText('Ma première note')).toBeTruthy();
    });
  });

  it('affiche un message quand il n\'y a pas de notes', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce((url) => {
      if (url.includes('/api/notes')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        });
      }
      return Promise.reject(new Error('URL non mockée'));
    });

    render(<Note />);
    
    await waitFor(() => {
      expect(screen.getByText('Aucune note pour le moment')).toBeTruthy();
    });
  });

  it('affiche un indicateur de chargement', async () => {
    const { getByTestId } = render(<Note />);
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).toBeNull();
    });
  });
});