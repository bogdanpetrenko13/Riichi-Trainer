import React from 'react';
import { Collapsible, Segmented } from '../components/ui';
import Hand from '../components/Hand';
import LoadButton from '../components/LoadButton';
import HandFutures from '../components/hand-explorer/HandFutures';
import { fillHand } from '../scripts/GenerateHand';
import { withTranslation } from '../i18n';

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
                <LoadButton callback={this.loadHand} />
                <Segmented
                    ariaLabel={t("menu.explorer")}
                    value={this.state.showAll ? "all" : "notable"}
                    onChange={(value) => this.setState({ showAll: value === "all" })}
                    options={[
                        { value: "notable", label: t("explorer.notableShort") },
                        { value: "all", label: t("explorer.allShort") },
                    ]}
                />
                {this.state.message ? <p className="rt-feedback" role="status">{this.state.message}</p> : null}
                <section className="rt-board rt-board--play">
                    <Hand tiles={this.state.hand} />
                </section>
                <HandFutures hand={this.state.hand} showAll={this.state.showAll} />
                <Collapsible title={t("explorer.howTo")} icon="help">
                    <p className="rt-prose">{t("explorer.warning")}</p>
                    <p className="rt-prose">{t("explorer.shanten")}</p>
                    <p className="rt-prose">{t("explorer.ukeire")}</p>
                </Collapsible>
            </div>
        );
    }
}

export default withTranslation()(HandExplorer);