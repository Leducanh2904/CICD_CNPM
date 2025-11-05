import React from 'react';
export interface HelperTextProps extends React.HTMLAttributes<HTMLSpanElement> {
    /**
     * Defines the color of the helper text (the same as with Input, Select, etc.)
     */
    valid?: boolean;
}
declare const HelperText: React.ForwardRefExoticComponent<HelperTextProps & React.RefAttributes<HTMLSpanElement>>;
export default HelperText;
//# sourceMappingURL=HelperText.d.ts.map