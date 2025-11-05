import React, { ReactNode } from 'react';
declare type IconType = string | React.FunctionComponent<{
    className: string;
    'aria-hidden': boolean;
}> | React.ComponentClass<{
    className: string;
    'aria-hidden': boolean;
}>;
export interface Props {
    children?: React.ReactNode;
    /**
     * Defines if the button is disabled
     */
    disabled?: boolean;
    /**
     * The size of the button
     */
    size?: 'larger' | 'large' | 'regular' | 'small' | 'pagination';
    /**
     * Shows only one icon inside the button; defaults to left
     */
    icon?: IconType;
    /**
     * Shows an icon inside the button, left aligned
     */
    iconLeft?: IconType;
    /**
     * Shows an icon inside the button, right aligned
     */
    iconRight?: IconType;
    /**
     * The style of the button
     */
    layout?: 'outline' | 'link' | 'primary' | '__dropdownItem';
    /**
     * Shows the button as a block (full width)
     */
    block?: boolean;
}
export interface ButtonAsButtonProps extends Props, React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * The element that should be rendered as a button
     */
    tag?: 'button';
    /**
     * The native HTML button type
     */
    type?: 'button' | 'submit' | 'reset';
}
export interface ButtonAsAnchorProps extends Props, React.AnchorHTMLAttributes<HTMLAnchorElement> {
    tag: 'a';
}
export interface ButtonAsOtherProps extends Props, React.AnchorHTMLAttributes<HTMLAnchorElement> {
    tag: string;
}
export declare type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps | ButtonAsOtherProps;
declare type Ref = ReactNode | HTMLElement | string;
declare const Button: React.ForwardRefExoticComponent<(ButtonAsButtonProps & React.RefAttributes<Ref>) | (ButtonAsAnchorProps & React.RefAttributes<Ref>) | (ButtonAsOtherProps & React.RefAttributes<Ref>)>;
export default Button;
//# sourceMappingURL=Button.d.ts.map