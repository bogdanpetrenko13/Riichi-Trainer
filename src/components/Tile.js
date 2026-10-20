import React from 'react';
import { getTileImage, getTileAsText } from '../scripts/TileConversions';
import { useTranslation } from '../i18n';
import { TILE_INDEXES } from '../Constants';

function Tile(props) {
    let { t } = useTranslation();

    let displayTile = props.displayTile || props.tile;

    return (
        <div className={props.className}>
            <img
                className={props.onClick ? "tile rt-tile--interactive" : "tile"}
                name={props.tile}
                src={getTileImage(displayTile)}
                title={getTileAsText(t, displayTile)}
                alt={getTileAsText(t, displayTile)}
                draggable="false"
                onClick={props.onClick}
                role={props.onClick ? "button" : undefined}
                tabIndex={props.onClick ? 0 : undefined}
                onKeyDown={props.onClick ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        props.onClick({ target: { name: props.tile } });
                    }
                } : undefined}
            />
            <span className="index">{props.showIndexes ? TILE_INDEXES[displayTile] : ""}</span>
        </div>
    );
}

export default Tile;