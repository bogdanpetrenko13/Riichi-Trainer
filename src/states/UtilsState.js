import React from 'react';
import RandomGameState from '../components/utils/RandomGameState';
import ConvertHand from '../components/utils/ConvertHand';

function UtilsState() {
    return (
        <div className="rt-page">
            <ConvertHand />
            <RandomGameState />
        </div>
    );
}

export default UtilsState;
