import React from 'react';
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    /**
     * The type of the badge
     */
    type?: 'success' | 'danger' | 'warning' | 'neutral' | 'primary';
}
declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLSpanElement>>;
export default Badge;
//# sourceMappingURL=Badge.d.ts.map