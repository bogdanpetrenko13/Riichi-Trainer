import React from 'react';
import { Collapsible } from '../ui';
import { getTileAsText, getTileImage } from '../../scripts/TileConversions';
import { calculateDiscardUkeire } from '../../scripts/UkeireCalculator';
import calculateStandardShanten from '../../scripts/ShantenCalculator';
import { ALL_TILES_REMAINING } from '../../Constants';
import { evaluateBestDiscard } from '../../scripts/Evaluations';
import { withTranslation } from '../../i18n';

class ResultingHandInfo extends React.Component {
    constructor(props) {
        super(props);
        this.toggleUpgrades = this.toggleUpgrades.bind(this);
        this.toggleShanten = this.toggleShanten.bind(this);
        this.state = {
            upgradesCollapsed: true,
            shantenCollapsed: true
        };
    }

    toggleUpgrades() {
        this.setState({ upgradesCollapsed: !this.state.upgradesCollapsed });
    }

    toggleShanten() {
        this.setState({ shantenCollapsed: !this.state.shantenCollapsed });
    }

    render() {
        if (!this.props.hand) return null;

        let upgradeTiles = this.props.upgrades.tiles.map((tile) => tile.tile);
        let total = this.props.upgrades.tiles.reduce((total, tile) => total + tile.resultingUkeire, 0);
        let { t } = this.props;

        let upgradeResults = this.props.upgrades.tiles
            .sort((a, b) => b.resultingUkeire - a.resultingUkeire)
            .map((tile, index) => {
                return (
                    <li key={index}>
                        {t("explorer.discardInfo.draw", { draw: getTileAsText(t, tile.tile, false), discard: getTileAsText(t, tile.discard, false), count: tile.resultingUkeire })}
                    </li>
                );
            });

        let shantenResults = [];
        let totalShantenUkeire = 0;
        let remainingTiles = ALL_TILES_REMAINING.slice();

        for (let i = 0; i < remainingTiles.length; i++) {
            remainingTiles[i] = Math.max(0, remainingTiles[i] - this.props.hand[i]);
        }

        if (!this.state.shantenCollapsed && this.props.shanten > 0) {
            shantenResults = this.props.ukeire.tiles.map((tile, index) => {
                let resultHand = this.props.hand.slice();
                resultHand[tile]++;
                remainingTiles[tile]--;

                let discards = calculateDiscardUkeire(resultHand, remainingTiles, calculateStandardShanten);
                let bestDiscard = evaluateBestDiscard(discards);
                resultHand[bestDiscard]--;
                remainingTiles[tile]++;
                totalShantenUkeire += discards[bestDiscard].value;
                return (
                    <li key={index}>
                        {t("explorer.discardInfo.draw", { draw: getTileAsText(t, tile, false), discard: getTileAsText(t, bestDiscard, false), count: discards[bestDiscard].value })}
                    </li>
                );
            });
        }

        let percent = this.props.maxUkeire > 0 ? Math.round(this.props.ukeire.value / this.props.maxUkeire * 100) : 0;
        let tilesRow = (indexes) => (
            <span className="rt-xtiles">
                {indexes.map((tile) => <img key={tile} src={getTileImage(tile)} alt={getTileAsText(t, tile, false)} draggable="false" />)}
            </span>
        );

        return (
            <div className={"rt-xcard" + (this.props.best ? " rt-xcard--best" : "")}>
                <div className="rt-xcard__head">
                    <img className="rt-xcard__discard" src={getTileImage(this.props.discard)} alt={getTileAsText(t, this.props.discard, false)} draggable="false" />
                    <div className="rt-xcard__main">
                        <div className="rt-xcard__value">
                            <b className="rt-num">{this.props.ukeire.value}</b>
                            <span>{t("explorer.ukeireLabel")}</span>
                            <span className="rt-xcard__shanten">{t("explorer.discardInfo.shanten", { count: this.props.shanten })}</span>
                        </div>
                        <div className="rt-xcard__bar" aria-hidden="true"><i style={{ width: percent + "%" }} /></div>
                    </div>
                </div>
                {this.props.ukeire.tiles.length ? <div className="rt-xcard__row">{tilesRow(this.props.ukeire.tiles)}</div> : null}
                {upgradeTiles.length ? (
                    <div className="rt-xcard__row">
                        <span className="rt-muted">{t("explorer.upgradesShort", { count: this.props.upgrades.value })}</span>
                        {tilesRow(upgradeTiles)}
                    </div>
                ) : null}
                <Collapsible title={t("explorer.discardInfo.expand")} icon="list" open={!this.state.shantenCollapsed} onToggle={this.toggleShanten}>
                    <ul className="rt-lines rt-num">
                        {shantenResults}
                    </ul>
                    <p className="rt-feedback">
                        {t("explorer.discardInfo.average", { average: Math.round(totalShantenUkeire / shantenResults.length) })}
                    </p>
                </Collapsible>
                <Collapsible title={t("explorer.discardInfo.expandUpgrades")} icon="list" open={!this.state.upgradesCollapsed} onToggle={this.toggleUpgrades}>
                    <ul className="rt-lines rt-num">
                        {upgradeResults}
                    </ul>
                    <p className="rt-feedback">
                        {t("explorer.discardInfo.average", { average: Math.round(total / upgradeResults.length) })}
                    </p>
                </Collapsible>
            </div>
        );
    }
}

export default withTranslation()(ResultingHandInfo);