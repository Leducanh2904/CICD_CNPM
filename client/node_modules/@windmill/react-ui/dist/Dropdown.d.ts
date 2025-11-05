import React from 'react';
export interface DropdownProps extends React.HTMLAttributes<HTMLUListElement> {
    /**
     * Function executed when the dropdown is closed
     */
    onClose: () => void;
    /**
     * Defines if the dropdown is open
     */
    isOpen: boolean;
    /**
     * Defines the alignement of the dropdown related to its parent
     */
    align?: 'left' | 'right';
}
declare const Dropdown: React.ForwardRefExoticComponent<DropdownProps & React.RefAttributes<HTMLDivElement>>;
export default Dropdown;
//# sourceMappingURL=Dropdown.d.ts.map