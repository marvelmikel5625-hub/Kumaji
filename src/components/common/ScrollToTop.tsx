import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Route-aware ScrollRestoration Component for Kumaji Marketplace
 *
 * Ensures:
 * 1. Navigating to a new route (PUSH/REPLACE) smoothly starts at the top of the viewport.
 * 2. Hash anchors (e.g. #faq, #reviews) scroll cleanly to the target element.
 * 3. Browser Back/Forward navigation (POP) preserves the user's historical scroll position.
 * 4. Defends against residual element focus (e.g. button click in footer keeping focus at page bottom).
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    // If the navigation is a back/forward action (POP), let the browser manage scroll restoration
    if (navType === 'POP' && prevPathnameRef.current === pathname) {
      return;
    }

    prevPathnameRef.current = pathname;

    // If there is an anchor hash in the URL, scroll to that element
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Reset window scroll to top immediately
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    // Also reset document root / body scroll in case of any overflow wrappers
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Blur any active element (e.g., footer button) so mobile browsers don't pull viewport down
    if (document.activeElement && document.activeElement instanceof HTMLElement) {
      if (document.activeElement.tagName === 'BUTTON' || document.activeElement.tagName === 'A') {
        document.activeElement.blur();
      }
    }
  }, [pathname, hash, navType]);

  return null;
};
