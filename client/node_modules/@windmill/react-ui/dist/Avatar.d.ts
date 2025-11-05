import React from 'react';
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * The size of the avatar
     */
    size?: 'large' | 'regular' | 'small';
    /**
     * Alternative text for the avatar image
     */
    alt?: string;
    /**
     * The source for the avatar image
     */
    src: string;
}
declare const Avatar: React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<HTMLDivElement>>;
export default Avatar;
//# sourceMappingURL=Avatar.d.ts.map