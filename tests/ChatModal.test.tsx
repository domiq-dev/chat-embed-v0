import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatModal from '../src/components/ChatModal';
import { DEFAULT_APARTMENT_CONFIG } from '../src/types/apartment';

// Mock minimal required props
const mockOnClose = jest.fn();
const mockConfig = DEFAULT_APARTMENT_CONFIG;

// Mock akoolSession as needed for your app
const mockAkoolSession = null;

// Mock agora-rtc-sdk-ng to avoid actual imports
jest.mock('agora-rtc-sdk-ng', () => {
  return {
    __esModule: true,
    default: {
      createClient: jest.fn().mockReturnValue({
        on: jest.fn(),
        join: jest.fn().mockResolvedValue(true),
        leave: jest.fn().mockResolvedValue(true),
        sendStreamMessage: jest.fn().mockResolvedValue(true),
      }),
    },
  };
});

describe('ChatModal (user-facing)', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('renders the chat modal with header, body, and input', async () => {
    await act(async () => {
      render(
        <ChatModal onClose={mockOnClose} config={mockConfig} akoolSession={mockAkoolSession} />,
      );
    });

    expect(screen.getByText(/your leasing specialist/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('allows the user to type in the input', async () => {
    await act(async () => {
      render(
        <ChatModal onClose={mockOnClose} config={mockConfig} akoolSession={mockAkoolSession} />,
      );
    });

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello, I am interested in a tour.' } });
    });

    expect(input).toHaveValue('Hello, I am interested in a tour.');
  });

  it('renders the tour booking modal when triggered', async () => {
    await act(async () => {
      render(
        <ChatModal onClose={mockOnClose} config={mockConfig} akoolSession={mockAkoolSession} />,
      );
    });

    // Find the tour booking button specifically by its content
    const tourButton = screen.getByRole('button', { name: /schedule tour/i });

    await act(async () => {
      fireEvent.click(tourButton);
    });

    // Wait for the modal to appear and verify it contains the expected content
    await waitFor(() => {
      expect(screen.getByText(/Schedule Your Tour/i)).toBeInTheDocument();
    });
  });

  it('renders the contact form modal or link', async () => {
    await act(async () => {
      render(
        <ChatModal onClose={mockOnClose} config={mockConfig} akoolSession={mockAkoolSession} />,
      );
    });

    // Find the contact link by its accessible name
    const contactLink = screen.getByRole('link', { name: /get in touch/i });
    expect(contactLink).toHaveAttribute('href');
  });
});
