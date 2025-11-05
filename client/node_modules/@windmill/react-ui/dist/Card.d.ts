import React from 'react';
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Removes default styles (if true) so you can override with your own background styles
     */
    colored?: boolean;
}
declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
export default Card;
//# sourceMappingURL=Card.d.ts.map