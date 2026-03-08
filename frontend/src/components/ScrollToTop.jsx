import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures the window scrolls to the top on every route change.
 * This prevents the "blank screen" effect when navigating from the bottom 
 * of a long page to a short page.
 */
export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
