import React from 'react';

/** Bottom dock above the navigation bar: the hand on one row plus an optional action button. */
function Dock({ children }) {
    return (
        <div className="rt-dock">
            <div className="rt-dock__inner">{children}</div>
        </div>
    );
}

export default Dock;
