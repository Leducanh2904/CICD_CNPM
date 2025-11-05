import React from 'react';
interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    /**
     * Defines the styles used throughout the library
     */
    theme?: object;
    /**
     * Defines dark mode as the default theme
     */
    dark?: boolean;
    /**
     * Allows the change of theme, reading user's preferences and saving them
     */
    usePreferences?: boolean;
}
declare const Windmill: React.FC<Props>;
export default Windmill;
//# sourceMappingURL=Windmill.d.ts.map