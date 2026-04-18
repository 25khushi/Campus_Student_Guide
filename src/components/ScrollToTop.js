import React, { useState, useEffect } from 'react';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => setIsVisible(window.scrollY > 200);
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <button
            id="ScrollUpBtn"
            title="Go to top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ display: isVisible ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}
        >
            <i className="fas fa-arrow-up"></i>
        </button>
    );
};

export default ScrollToTop;
