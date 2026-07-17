import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll the window & document element (covers most cases)
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Also reset any inner scrollable containers (dashboard main area, mobile layout, etc.)
        const scrollTargets = [
            document.getElementById('app-routes-container'),
            document.getElementById('mobile-main-content'),
            document.querySelector('main'),
            document.querySelector('.overflow-y-auto'),
            document.querySelector('[data-scroll-container]'),
        ];

        scrollTargets.forEach((el) => {
            if (el) {
                el.scrollTop = 0;
            }
        });
    }, [pathname]);

    return null;
}
