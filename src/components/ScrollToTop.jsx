import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Scroll to top immediately when route changes
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Also scroll the document element and body (for better cross-browser support)
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Scroll any scrollable containers with the 'screen' class
    const screenElements = document.querySelectorAll('.screen');
    screenElements.forEach(el => {
      el.scrollTop = 0;
    });
  }, [pathname]);
  
  return null;
}
