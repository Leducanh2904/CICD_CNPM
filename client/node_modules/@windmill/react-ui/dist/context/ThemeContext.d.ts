import React from 'react';
interface ThemeContextInterface {
    theme: any;
    mode?: Mode;
    toggleMode?: any;
}
export declare const ThemeContext: React.Context<ThemeContextInterface>;
interface ThemeProviderProps {
    children: React.ReactNode;
    value?: any;
}
export declare const ThemeProvider: React.FC<ThemeProviderProps>;
export {};
//# sourceMappingURL=ThemeContext.d.ts.map