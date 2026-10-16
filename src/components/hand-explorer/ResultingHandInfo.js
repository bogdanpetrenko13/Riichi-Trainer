import React from 'react';
import { Collapsible } from '../ui';
import { convertHandToAsciiSymbols } from '../../scripts/HandConversions';
import { getTileAsText, convertTilesToAsciiSymbols } from '../../scripts/TileConversions';
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

        return (
            <div className="rt-stack">
                <h3 className="rt-section-title">{t("explorer.discardInfo.discard", { tile: getTileAsText(t, this.props.discard, false) })}</h3>
                <div className="rt-num">{convertHandToAsciiSymbols(this.props.hand)}</div>
                <ul className="rt-lines rt-num">
                    <li>{t("explorer.discardInfo.shanten", { count: this.props.shanten })}</li>
                    <li>{t("explorer.discardInfo.ukeire", { count: this.props.ukeire.value, tiles: convertTilesToAsciiSymbols(this.props.ukeire.tiles) })}</li>
                </ul>
                <Collapsible title={t("explorer.discardInfo.expand")} icon="list" open={!this.state.shantenCollapsed} onToggle={this.toggleShanten}>
                    <ul className="rt-lines rt-num">
                        {shantenResults}
                    </ul>
                    <p className="rt-feedback">
                        {t("explorer.discardInfo.average", { average: Math.round(totalShantenUkeire / shantenResults.length) })}
                    </p>
                </Collapsible>
                <p className="rt-num">
                    {t("explorer.discardInfo.upgrades", { count: this.props.upgrades.value, tiles: convertTilesToAsciiSymbols(upgradeTiles) })}
                </p>
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