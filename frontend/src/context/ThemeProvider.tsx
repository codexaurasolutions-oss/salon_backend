import { createContext, useContext, useEffect, useState, FC, ReactNode, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const location = useLocation();

    const [theme, setThemeState] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        return savedTheme || 'light';
    });

    const updateThemeClass = useCallback((currentPath: string) => {
        const root = window.document.documentElement;

        // Admin routes that should use dark theme
        const isAdminRoute =
            currentPath.startsWith('/salon/') ||
            currentPath.startsWith('/staff/') ||
            currentPath.startsWith('/super-admin/') ||
            currentPath.startsWith('/admin-setup') ||
            currentPath.startsWith('/admin-access') ||
            currentPath === '/dashboard';

        root.classList.remove('light', 'dark', 'admin-dark-theme');

        if (isAdminRoute) {
            root.classList.add('admin-dark-theme');
            // We set the internal theme state to dark for component-level checks if needed
            setThemeState('dark');
        } else {
            root.classList.add('light');
            setThemeState('light');
        }
    }, []);

    useEffect(() => {
        updateThemeClass(location.pathname);
    }, [location.pathname, updateThemeClass]);

    const toggleTheme = () => {
        setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
