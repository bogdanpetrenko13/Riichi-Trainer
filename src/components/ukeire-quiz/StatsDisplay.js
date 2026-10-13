import React from 'react';
import { withTranslation } from 'react-i18next';
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
        let optimalDiscardRate = this.props.values.totalOptimalDiscards / this.props.values.totalDiscards;
        if (isNaN(optimalDiscardRate)) optimalDiscardRate = 0;
        optimalDiscardRate *= 100;
        optimalDiscardRate = Math.round(optimalDiscardRate);

        let efficiency = this.props.values.totalEfficiency / this.props.values.totalPossibleEfficiency;
        if (isNaN(efficiency)) efficiency = 0;
        efficiency *= 100;
        efficiency = Math.round(efficiency);

        let averageDiscards = this.props.values.totalDiscards / this.props.values.totalTenpai;
        if (isNaN(averageDiscards)) averageDiscards = 0;
        averageDiscards = Math.round(averageDiscards * 10) / 10;

        let { t } = this.props;

        return (
            <React.Fragment>
                <Collapsible title={t("stats.buttonLabel")} icon="barChart" open={!this.state.statsCollapsed} onToggle={this.toggleStats}>
                    <p className="rt-muted">{t("stats.info")}</p>
                    <ul className="rt-lines rt-num">
                        <li>{t("stats.ready", { count: this.props.values.totalTenpai })}</li>
                        <li>{t("stats.discards", { count: this.props.values.totalDiscards })}</li>
                        <li>{t("stats.average", { average: averageDiscards })}</li>
                        <li>{t("stats.optimal", { count: this.props.values.totalOptimalDiscards })}</li>
                        <li>{t("stats.optimalRate", { percent: optimalDiscardRate, achieved: this.props.values.totalOptimalDiscards, total: this.props.values.totalDiscards })}</li>
                    </ul>
                    <div className="rt-bar" aria-hidden="true"><span style={{ width: optimalDiscardRate + '%' }} /></div>
                    <ul className="rt-lines rt-num">
                        <li>{t("stats.efficiency", { count: this.props.values.totalEfficiency })}</li>
                        <li>{t("stats.possible", { count: this.props.values.totalPossibleEfficiency })}</li>
                        <li>{t("stats.overall", { percent: efficiency, achieved: this.props.values.totalEfficiency, total: this.props.values.totalPossibleEfficiency })}</li>
                    </ul>
                    <div className="rt-bar rt-bar--accent" aria-hidden="true"><span style={{ width: efficiency + '%' }} /></div>
                    <div className="rt-mt-4">
                        <Button variant="danger" icon="refresh" onClick={this.toggleConfirm}>{t("stats.reset")}</Button>
                    </div>
                </Collapsible>
                <Modal
                    open={!this.state.confirmCollapsed}
                    onClose={this.toggleConfirm}
                    title={t("stats.reset")}
                    footer={
                        <React.Fragment>
                            <Button variant="secondary" onClick={this.toggleConfirm}>{t("stats.no")}</Button>
                            <Button variant="danger" onClick={this.onConfirmReset}>{t("stats.yes")}</Button>
                        </React.Fragment>
                    }
                >
                    <p>{t("stats.confirmation")}</p>
                </Modal>
            </React.Fragment>
        );
    }
}

export default withTranslation()(StatsDisplay);
