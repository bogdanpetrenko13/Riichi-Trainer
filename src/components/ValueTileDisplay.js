import React from 'react';
import Tile from './Tile';
import { useTranslation } from 'react-i18next';

function ValueTileDisplay(props) {
    let { t } = useTranslation();

    const items = [
        { label: t("trainer.roundWind"), tile: props.roundWind },
        { label: t("trainer.seatWind"), tile: props.seatWind },
        { label: t("trainer.doraIndicator"), tile: props.dora },
    ];

    return (
        <div className="rt-values">
            {items.map((item, index) => (
                <div className="rt-value" key={index}>
                    <span className="rt-value__label">{item.label}</span>
                    <Tile className="discardTile" tile={item.tile} showIndexes={props.showIndexes} />
                </div>
            ))}
        </div>
    );
}

export default ValueTileDisplay;
