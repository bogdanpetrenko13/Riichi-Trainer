import React from 'react';
import { Button } from '../components/ui';
import Hand from '../components/Hand';
import LoadButton from '../components/LoadButton';
import HandFutures from '../components/hand-explorer/HandFutures';
import { fillHand } from '../scripts/GenerateHand';
import { withTranslation } from 'react-i18next';

class HandExplorer extends React.Component {
    constructor(props) {
        super(props);
        this.loadHand = this.loadHand.bind(this);
        this.state = {
            message: "",
            hand: null,
            showAll: false
        }
    }

    loadHand(loadData) {
        let { t } = this.props;

        if (loadData.tiles === 0) {
            this.setState({
                message: t("trainer.error.load")
            });
            return;
        }

        let remainingTiles = [
            0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            0, 0, 0, 0, 0, 0, 0, 0
        ];

        for (let i = 0; i < remainingTiles.length; i++) {
            remainingTiles[i] = Math.max(0, remainingTiles[i] - loadData.hand[i]);
        }

        let { hand } = fillHand(remainingTiles, loadData.hand, 14 - loadData.tiles);

        if (!hand) {
            this.setState({
                message: t("trainer.error.load")
            });
            return;
        }

        this.setState({
            message: "",
            hand: hand
        });
    }

    onShowToggled() {
        this.setState({
            showAll: !this.state.showAll
        });
    }

    render() {
        let { t } = this.props;
        return (
            <div className="rt-page">
                <p className="rt-note">
                    {t("explorer.warning")}
                    <br />{t("explorer.shanten")}
                    <br />{t("explorer.ukeire")}
                </p>
                <div className="rt-actions">
                    <LoadButton callback={this.loadHand} />
                    <Button variant="secondary" icon="layers" onClick={() => this.onShowToggled()}>{this.state.showAll ? t("explorer.notableDiscards") : t("explorer.allDiscards")}</Button>
                </div>
                {this.state.message ? <p className="rt-feedback" role="status">{this.state.message}</p> : null}
                <section className="rt-board">
                    <Hand tiles={this.state.hand} />
                </section>
                <HandFutures hand={this.state.hand} showAll={this.state.showAll} />
            </div>
        );
    }
}

export default withTranslation()(HandExplorer);