import React from 'react';
import Tile from './Tile';

/** Adds the lifted look to the tile the player has selected (compares the tile index). */
function tileClass(base, selected, tile) {
    return selected !== undefined && selected === tile ? base + ' rt-tile--selected' : base;
}

function SortedHand(props) {
    const tiles = [];

    let hand = props.tiles;

    if (!hand) {
        return <div className="rt-hand" />;
    }

    let lastDraw = props.lastDraw;
    let index = 0;

    for (let i = 0; i < hand.length; i++) {
        tiles.push((
            <Tile className={tileClass("handTile", props.selected, hand[i])}
                key={index++}
                tile={hand[i]}
                onClick={props.onTileClick}
                showIndexes={props.showIndexes}
            />
        ));
    }

    if (lastDraw > -1) {
        tiles.push((
            <Tile className={tileClass("handTile drawTile", props.selected, lastDraw)}
                key={index++}
                tile={lastDraw}
                onClick={props.onTileClick}
                showIndexes={props.showIndexes}
            />
        ));
    }

    return (
        <div className={props.compact ? "rt-hand rt-hand--compact" : "rt-hand"} role="group">
            {tiles}
        </div>
    );
}

export default SortedHand;