import React from 'react';
import Tile from './Tile';

function Hand(props) {
    const tiles = [];
    let index = 0;

    let hand = props.tiles;

    if (!hand) {
        return <div className="rt-hand" />;
    }

    let lastDraw = props.lastDraw;
    let hasLastDraw = lastDraw > -1;

    if (hasLastDraw) {
        hand[lastDraw]--;
    }

    for (let i = 0; i < hand.length; i++) {
        if (i % 10 === 5 && hand[i - 5] > 0) {
            for (let j = 0; j < hand[i - 5]; j++) {
                tiles.push((
                    <Tile className="handTile"
                        key={index++}
                        tile={i - 5}
                        displayTile={hasLastDraw && props.blind ? 30 : i - 5}
                        onClick={props.onTileClick}
                        showIndexes={props.showIndexes}
                    />
                ));
            }
        }

        if (hand[i] === 0) continue;
        if (i % 10 === 0) continue;

        for (let j = 0; j < hand[i]; j++) {
            tiles.push((
                <Tile className="handTile"
                    key={index++}
                    tile={i}
                    displayTile={hasLastDraw && props.blind ? 30 : i}
                    onClick={props.onTileClick}
                    showIndexes={props.showIndexes}
                />
            ));
        }

    }

    if (hasLastDraw) {
        hand[lastDraw]++;
        tiles.push((
            <Tile className="handTile drawTile"
                key={index++}
                tile={lastDraw}
                displayTile={lastDraw}
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

export default Hand;