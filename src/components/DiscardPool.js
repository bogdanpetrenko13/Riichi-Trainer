import React from 'react';
import Tile from './Tile';
import { Collapsible } from './ui';
import { SEAT_NAMES } from '../Constants';
import { withTranslation } from '../i18n';

class DiscardPool extends React.Component {
    render() {
        let players = this.props.players;
        let pools = [];
        let { t } = this.props;

        for (let i = 0; i < players.length; i++) {
            if (players[i].discards.length < 1) continue;

            pools.push(
                <div className="rt-discards__player" key={i}>
                    <h4 className="rt-discards__name">{t(players[i].name)} ({t(SEAT_NAMES[players[i].seat])})</h4>
                    <div className="rt-discards__grid">
                        {players[i].discards.map((tile, index) => {
                            return (
                                <div
                                    className={index === players[i].riichiIndex ? "rt-discards__cell rt-discards__cell--riichi" : "rt-discards__cell"}
                                    key={players[i].name + index}
                                >
                                    <Tile className="discardTile" tile={tile} showIndexes={this.props.showIndexes} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )
        }

        if (pools.length === 0) return null;

        return (
            <Collapsible title={t("discards.label")} icon="layers">
                <div className="rt-discards">
                    {pools}
                </div>
            </Collapsible>
        );
    }
}

export default withTranslation()(DiscardPool);
