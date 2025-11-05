import React from 'react';
export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Function executed when the dropdown is closed
     */
    onClose: () => void;
    /**
     * Defines if the modal is open
     */
    isOpen: boolean;
}
declare const Modal: React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<HTMLDivElement>>;
export default Modal;
//# sourceMappingURL=Modal.d.ts.map