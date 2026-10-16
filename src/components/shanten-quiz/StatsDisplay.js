import React from 'react';
import { withTranslation } from '../../i18n';
import { Button, Collapsible, Modal } from '../ui';

class StatsDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.toggleStats = this.toggleStats.bind(this);
        this.toggleConfirm = this.toggleConfirm.bind(this);
        this.onConfirmReset = this.onConfirmReset.bind(this);
        this.state = {
            statsCollapsed: true,
            confirmCollapsed: true
        };
    }

    toggleStats() {
        this.setState({ statsCollapsed: !this.state.statsCollapsed });
    }

    toggleConfirm() {
        this.setState({ confirmCollapsed: !this.state.confirmCollapsed });
    }

    onConfirmReset() {
        this.props.onReset();
        this.setState({ confirmCollapsed: true });
    }

    render() {
        const { t, values, useTimer } = this.props;

        let correctGuesses = values.correctGuesses || 0;
        let totalGuesses = values.totalGuesses || 0;
        let correctRate = totalGuesses > 0 ? (correctGuesses / totalGuesses) * 100 : 0;
        correctRate = Math.round(correctRate);

        let averageTime = values.totalTime / totalGuesses;
        if (isNaN(averageTime)) averageTime = 0;
        averageTime = Math.round(averageTime * 10) / 10;

        return (
            <React.Fragment>
                <Collapsible title={t("shanten.stats.buttonLabel")} icon="barChart" open={!this.state.statsCollapsed} onToggle={this.toggleStats}>
                    <ul className="rt-lines rt-num">
                        <li>{t("shanten.stats.correctGuesses", { count: correctGuesses, total: totalGuesses, percent: correctRate })}</li>
                        {useTimer && <li>{t("shanten.stats.averageTime", { time: averageTime })}</li>}
                    </ul>
                    <div className="rt-bar" aria-hidden="true"><span style={{ width: correctRate + '%' }} /></div>
                    <div className="rt-mt-4">
                        <Button variant="danger" icon="refresh" onClick={this.toggleConfirm}>{t("shanten.stats.reset")}</Button>
                    </div>
                </Collapsible>
                <Modal
                    open={!this.state.confirmCollapsed}
                    onClose={this.toggleConfirm}
                    title={t("shanten.stats.reset")}
                    footer={
                        <React.Fragment>
                            <Button variant="secondary" onClick={this.toggleConfirm}>{t("shanten.stats.no")}</Button>
                            <Button variant="danger" onClick={this.onConfirmReset}>{t("shanten.stats.yes")}</Button>
                        </React.Fragment>
                    }
                >
                    <p>{t("shanten.stats.confirmation")}</p>
                </Modal>
            </React.Fragment>
        );
    }
}

export default withTranslation()(StatsDisplay);
