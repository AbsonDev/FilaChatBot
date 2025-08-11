import { useState, useEffect, useCallback } from 'react';

interface TerminalInfo {
  id: number;
  name: string;
  provider: {
    id: number;
    name: string;
    slug: string;
  };
  location: {
    id: number;
    name: string;
  };
  services: Array<{
    id: number;
    name: string;
    sessions: Array<{
      id: number;
      start: string;
      end: string;
      hasSlotsLeft: boolean;
    }>;
  }>;
}

interface TerminalConfig {
  accessKey: string;
  terminalInfo?: TerminalInfo;
  configuredAt: string;
}

interface UseTerminalConfigReturn {
  currentTerminal: TerminalConfig | null;
  isValidating: boolean;
  validationError: string | null;
  setTerminal: (accessKey: string) => Promise<boolean>;
  validateTerminal: (accessKey: string) => Promise<TerminalInfo | null>;
  clearTerminal: () => void;
  hasTerminal: boolean;
}

const STORAGE_KEY = 'filazero_terminal_config';

export function useTerminalConfig(): UseTerminalConfigReturn {
  const [currentTerminal, setCurrentTerminal] = useState<TerminalConfig | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load terminal config from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored) as TerminalConfig;
        setCurrentTerminal(config);
      }
    } catch (error) {
      console.error('Failed to load terminal config:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Validate terminal by calling the backend API
  const validateTerminal = useCallback(async (accessKey: string): Promise<TerminalInfo | null> => {
    if (!accessKey?.trim()) {
      throw new Error('Access key é obrigatório');
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await fetch('/api/terminal/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessKey: accessKey.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Erro HTTP ${response.status}`);
      }

      const terminalInfo: TerminalInfo = await response.json();
      return terminalInfo;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setValidationError(message);
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Set terminal config after validation
  const setTerminal = useCallback(async (accessKey: string): Promise<boolean> => {
    try {
      const terminalInfo = await validateTerminal(accessKey);
      
      if (terminalInfo) {
        const config: TerminalConfig = {
          accessKey: accessKey.trim(),
          terminalInfo,
          configuredAt: new Date().toISOString(),
        };

        setCurrentTerminal(config);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        setValidationError(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to set terminal:', error);
      return false;
    }
  }, [validateTerminal]);

  // Clear terminal configuration
  const clearTerminal = useCallback(() => {
    setCurrentTerminal(null);
    localStorage.removeItem(STORAGE_KEY);
    setValidationError(null);
  }, []);

  const hasTerminal = Boolean(currentTerminal?.accessKey);

  return {
    currentTerminal,
    isValidating,
    validationError,
    setTerminal,
    validateTerminal,
    clearTerminal,
    hasTerminal,
  };
}