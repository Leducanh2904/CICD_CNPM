/**
 * https://gist.github.com/adamwathan/e0a791aa0419098a7ece70028b2e641e
 */
import React from 'react';
interface TransitionProps {
    children?: React.ReactNode;
    show?: boolean;
    enter?: string;
    enterFrom?: string;
    enterTo?: string;
    leave?: string;
    leaveFrom?: string;
    leaveTo?: string;
    appear?: string;
}
declare const Transition: React.FC<TransitionProps>;
export default Transition;
//# sourceMappingURL=Transition.d.ts.map