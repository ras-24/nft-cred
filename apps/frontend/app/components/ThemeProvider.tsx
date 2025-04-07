'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
};

// Initialize with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with light theme
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const isDark = theme === 'dark';

  // Apply theme directly to DOM
  const applyTheme = useCallback((newTheme: Theme) => {
    console.log(`ForceApply theme: ${newTheme}`);
    
    // Apply class to HTML element
    const htmlEl = document.documentElement;
    if (newTheme === 'dark') {
      htmlEl.classList.add('dark');
      document.body.dataset.theme = 'dark';
    } else {
      htmlEl.classList.remove('dark');
      document.body.dataset.theme = 'light';
      
      // Force critical elements to light mode
      document.querySelectorAll('button.p-2.rounded-full').forEach(button => {
        (button as HTMLElement).style.backgroundColor = '#f1f5f9';
        (button as HTMLElement).style.color = '#4b5563';
        (button as HTMLElement).style.borderColor = '#e5e7eb';
      });
    }
    
    // Force immediate recalculation by using a small timeout 
    setTimeout(() => {
      if (newTheme === 'dark') {
        document.body.style.backgroundColor = 'rgb(17, 24, 39)';
      } else {
        document.body.style.backgroundColor = 'rgb(255, 255, 255)';
      }
    }, 10);
    
    // Force immediate recalculation for light/dark specific elements
    const buttons = document.querySelectorAll('button.p-2.rounded-full');
    buttons.forEach(button => {
      if (newTheme === 'dark') {
        button.classList.add('dark-mode-button');
        button.classList.remove('light-mode-button');
      } else {
        button.classList.add('light-mode-button');
        button.classList.remove('dark-mode-button');
      }
    });
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('theme', newTheme);
        console.log(`Theme saved in localStorage: ${newTheme}`);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    // Determine initial theme from localStorage or default to light
    if (typeof window !== 'undefined') {
      try {
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        const initialTheme = storedTheme === 'dark' ? 'dark' : 'light';
        
        console.log('Initial theme from localStorage:', storedTheme);
        console.log('Setting initial theme to:', initialTheme);
        
        // Update state to match initial theme
        setTheme(initialTheme);
        
        // Apply theme directly to DOM
        applyTheme(initialTheme);
      } catch (error) {
        console.error('Error reading theme from localStorage:', error);
        setTheme('light');
        applyTheme('light');
      }
    }
  }, [applyTheme]);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    console.log(`Toggle theme current: ${theme}`);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log(`Switching to: ${newTheme}`);
    
    // First apply the theme directly to DOM
    applyTheme(newTheme);
    
    // Then update the state
    setTheme(newTheme);
    
    // Force repaint to make sure styles are applied
    document.body.style.backgroundColor = '';
    
    console.log(`Theme toggled to: ${newTheme}`);
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}