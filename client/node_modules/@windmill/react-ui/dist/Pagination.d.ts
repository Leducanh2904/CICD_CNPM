import React from 'react';
import { ButtonAsButtonProps } from './Button';
interface NavigationButtonProps extends ButtonAsButtonProps {
    directionIcon: 'prev' | 'next';
}
export declare const NavigationButton: React.FC<NavigationButtonProps>;
interface PageButtonProps extends ButtonAsButtonProps {
    /**
     * The page the button represents
     */
    page: string | number;
    /**
     * Defines if the button is active
     */
    isActive?: boolean;
}
export declare const PageButton: React.FC<PageButtonProps>;
export declare const EmptyPageButton: () => JSX.Element;
export interface PaginationProps {
    /**
     * The total number of results
     */
    totalResults: number;
    /**
     * The number of results shown per page
     */
    resultsPerPage?: number;
    /**
     * The accessible name of the pagination (what does it refer to?)
     */
    label: string;
    /**
     * The function executed on page change
     */
    onChange: (activePage: number) => void;
}
declare const Pagination: React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<HTMLDivElement>>;
export default Pagination;
//# sourceMappingURL=Pagination.d.ts.map