import React, { SVGAttributes } from 'react';
declare enum AlertEnum {
    success = 0,
    danger = 1,
    warning = 2,
    info = 3,
    neutral = 4
}
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * The type of the alert
     */
    type?: keyof typeof AlertEnum;
    /**
     * If defined, shows the close icon that calls this function
     */
    onClose?: () => void;
}
declare type IconProps = SVGAttributes<SVGElement>;
export declare const InfoIcon: React.FC<IconProps>;
export declare const WarningIcon: React.FC<IconProps>;
export declare const DangerIcon: React.FC<IconProps>;
export declare const SuccessIcon: React.FC<IconProps>;
export declare const NeutralIcon: React.FC<IconProps>;
declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>>;
export default Alert;
//# sourceMappingURL=Alert.d.ts.map