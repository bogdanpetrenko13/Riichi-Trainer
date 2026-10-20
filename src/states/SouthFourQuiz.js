import React from 'react';
import { Input, InputGroup, InputGroupAddon, Label } from '../components/ui/legacy';
import { Button, Card, Modal, cx } from '../components/ui';
import { getPoints } from '../scripts/ScoreCalculation';
import Player from '../models/Player';
import { randomInt, validateFu, shuffleArray } from '../scripts/Utils';
import { SEAT_NAMES, RON_SCORES, TSUMO_SCORES } from '../Constants';
import SouthFourResultMessage from "../models/SouthFourResultMessage";
import { withTranslation } from '../i18n';
import { PLACEMENTS } from '../Constants';
import LocalizedMessage from '../models/LocalizedMessage';

/** The 15 questions of the trainer: tsumo or ron on a target, the placement to reach, riichi declarations. */
const QUESTIONS = [
    { tsumo: true, ronTarget: 0, placementTarget: 1, riichis: [0, 0, 0, 0] },
    { tsumo: false, ronTarget: 1, placementTarget: 1, riichis: [0, 0, 0, 0] },
    { tsumo: false, ronTarget: 2, placementTarget: 1, riichis: [0, 0, 0, 0] },
    { tsumo: false, ronTarget: 3, placementTarget: 1, riichis: [0, 0, 0, 0] },
    { tsumo: true, ronTarget: 0, placementTarget: 1, riichis: [0, 0, 0, 1] },
    { tsumo: false, ronTarget: 1, placementTarget: 1, riichis: [0, 0, 0, 1] },
    { tsumo: false, ronTarget: 3, placementTarget: 1, riichis: [0, 0, 0, 1] },
    { tsumo: true, ronTarget: 0, placementTarget: 1, riichis: [0, 1, 0, 0] },
    { tsumo: false, ronTarget: 1, placementTarget: 1, riichis: [0, 1, 0, 0] },
    { tsumo: false, ronTarget: 3, placementTarget: 1, riichis: [0, 1, 0, 0] },
    { tsumo: true, ronTarget: 0, placementTarget: 2, riichis: [0, 0, 0, 0] },
    { tsumo: false, ronTarget: 1, placementTarget: 2, riichis: [0, 0, 0, 0] },
    { tsumo: false, ronTarget: 2, placementTarget: 2, riichis: [0, 0, 0, 0] },
    { tsumo: true, ronTarget: 0, placementTarget: 3, riichis: [0, 0, 0, 0] },
    { tsumo: false, ronTarget: 3, placementTarget: 3, riichis: [0, 0, 0, 0] },
];

const HAN_CHOICES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const FU_CHOICES = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130];

/** Section header key for a question index. */
function sectionKey(index) {
    if (index < 4) return "allLast.escapeHeader";
    if (index < 10) return "allLast.riichiHeader";
    return "allLast.higherHeader";
}

/** The score table after the player wins with the given han and fu (same math as onSubmit, without feedback). */
function projectScores(players, question, han, fu) {
    let scores = players.map((player) => player.points);

    for (let i = 1; i < question.riichis.length; i++) {
        scores[i] -= question.riichis[i] * 1000;
        scores[0] += question.riichis[i] * 1000;
    }

    let dealer = players[0].seat === 0;
    let gained;

    if (question.tsumo) {
        let points = getPoints(han, fu, dealer);
        gained = points[0] * 2 + points[1];
        scores[0] += gained;
        scores[1] -= players[1].seat > 0 ? points[0] : points[1];
        scores[2] -= players[2].seat > 0 ? points[0] : points[1];
        scores[3] -= players[3].seat > 0 ? points[0] : points[1];
    } else {
        gained = getPoints(han, fu, dealer, false);
        scores[0] += gained;
        scores[question.ronTarget] -= gained;
    }

    return { scores: scores, gained: gained };
}

class SouthFourQuiz extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            score: 0,
            players: [],
            messages: [],
            maxFu: 50,
            showDifferences: true,
            loadErrorMessage: "",
            current: 0,
            han: 1,
            fu: 30,
            settingsOpen: false
        }

        this.onSubmit = this.onSubmit.bind(this);
        this.onFuChanged = this.onFuChanged.bind(this);
    }

    componentDidMount() {
        try {
            let savedFu = window.localStorage.getItem("maxS4Fu");

            if (savedFu) {
                savedFu = parseInt(savedFu);

                this.setState({
                    maxFu: savedFu
                }, () => this.generateNewQuiz());
            } else {
                this.generateNewQuiz();
            }
        } catch {
            this.generateNewQuiz();
        }
    }

    onLoadSituation() {
        let string = document.getElementById("loadScoresString").value;
        let scores = string.split(',');

        if (scores.length < 4) {
            this.setState({ loadErrorMessage: new LocalizedMessage("allLast.error.few") });
            return;
        }

        let players = [new Player(), new Player(), new Player(), new Player()];

        for (let i = 0; i < players.length; i++) {
            let converted = parseInt(scores[i]);

            if (isNaN(converted)) {
                this.setState({ loadErrorMessage: new LocalizedMessage("allLast.error.NaN", { seat: `$t(${SEAT_NAMES[i]})` }) });
                return;
            }

            players[i].points = converted;
            players[i].seat = i;
        }

        players.sort((a, b) => a.points - b.points);

        this.setState({
            players: players,
            messages: Array(15).fill(""),
            loadErrorMessage: "",
            current: 0,
            han: 1,
            fu: 30,
            settingsOpen: false
        });
    }

    generateNewQuiz() {
        let players = [new Player(), new Player(), new Player(), new Player()];

        // Generate randomish scores
        do {
            let pointsRemaining = 100000;

            let points = randomInt(500, 300) * 100
            players[0].points = points;
            pointsRemaining -= points;

            for (let i = 1; i < 3; i++) {
                points = randomInt(300, 100) * 100;
                players[i].points = points;
                pointsRemaining -= points;
            }

            players[3].points = pointsRemaining;
            players.sort((a, b) => a.points - b.points);
        } while (players[1].points - players[0].points < 1500 || players[1].points - players[0].points > 16000);

        // Assign random seats
        let seats = shuffleArray([0, 1, 2, 3]);

        for (let i = 0; i < players.length; i++) {
            players[i].seat = seats[i];
        }

        this.setState({
            players: players,
            messages: Array(15).fill(""),
            current: 0,
            han: 1,
            fu: 30,
        });
    }

    onSubmit(han, fu, tsumo, ronTarget, placementTarget, index, riichis) {
        let players = this.state.players;
        let scores = players.map((player) => player.points);

        for (let i = 1; i < riichis.length; i++) {
            scores[i] -= riichis[i] * 1000;
            scores[0] += riichis[i] * 1000;
        }

        let required;
        let message = new SouthFourResultMessage();
        message.feedback = "allLast.wrong";
        // South (1 -> 0) > West (2 -> 1) > North (3 -> 2) > East (0 -> 3)
        let canBeEqual = (players[0].seat + 3) % 4 < (players[placementTarget].seat + 3) % 4;
        let dealer = players[0].seat === 0;

        if (tsumo) {
            required = findMinimumTsumoValue(players, scores, placementTarget, this.state.maxFu, canBeEqual);

            let points = getPoints(han, fu, dealer);
            scores[0] += points[0] * 2 + points[1];
            scores[1] -= players[1].seat > 0 ? points[0] : points[1];
            scores[2] -= players[2].seat > 0 ? points[0] : points[1];
            scores[3] -= players[3].seat > 0 ? points[0] : points[1];

            if ((!dealer && points[0] === required.nondealer && points[1] === required.dealer)
                || (dealer && points[0] === required.dealer)) {
                message.feedback = "allLast.correct";
            } else if ((!dealer && (points[0] > required.nondealer || points[1] > required.dealer))
                || (dealer && points[0] > required.dealer)) {
                message.feedback = "allLast.tooMuch";
            }
        } else {
            required = findMinimumRonValue(players, scores, ronTarget, placementTarget, this.state.maxFu, canBeEqual);

            let points = getPoints(han, fu, dealer, false);
            scores[0] += points;
            scores[ronTarget] -= points;

            if ((!dealer && points === required.nondealer)
                || (dealer && points === required.dealer)) {
                message.feedback = "allLast.correct";
            } else if ((!dealer && points > required.nondealer)
                || (dealer && points > required.dealer)) {
                message.feedback = "allLast.tooMuch";
            }
        }

        message.placement = placementTarget;
        message.playerSeats = players.map((player) => player.seat);
        message.scores = scores;
        message.requiredScore = required;

        let messages = this.state.messages.slice();
        messages[index] = message;

        this.setState({ messages: messages });
    }

    onFuChanged(event) {
        let fu = validateFu(event.target.value, this.state.maxFu);
        event.target.value = fu;

        try {
            window.localStorage.setItem("maxS4Fu", fu);
        } catch { }

        this.setState({
            maxFu: fu
        });
    }

    onNumberChanged(event) {
        event.target.focus();

        let value = parseInt(event.target.value);
        if (value > 30 && value % 10 === 5) {
            event.target.blur();
        }
    }

    onToggleDifferences() {
        this.setState({
            showDifferences: !this.state.showDifferences
        });
    }

    onPickHan(han) {
        this.setState({ han: han, fu: han < 2 && this.state.fu > 110 ? 30 : this.state.fu });
    }

    onPickFu(fu) {
        this.setState({ fu: fu, han: fu > 110 && this.state.han < 2 ? 2 : this.state.han });
    }

    onCheck() {
        let question = QUESTIONS[this.state.current];
        this.onSubmit(this.state.han, this.state.fu, question.tsumo, question.ronTarget, question.placementTarget, this.state.current, question.riichis);
    }

    onNext() {
        this.setState({ current: this.state.current + 1 });
        window.scrollTo(0, 0);
    }

    questionText(t, question) {
        let action = question.tsumo ? t("allLast.tsumo") : t("allLast.ron", { target: t(PLACEMENTS[question.ronTarget]) });
        let placement = t(PLACEMENTS[question.placementTarget]);

        for (let i = 1; i < question.riichis.length; i++) {
            if (question.riichis[i] > 0) {
                return t("allLast.riichiQuestion", { player: t(PLACEMENTS[i]), action: action, placement: placement });
            }
        }

        return t("allLast.question", { action: action, placement: placement });
    }

    renderChoices(label, values, selected, onPick, isDisabled) {
        return (
            <div className="rt-choice-group" role="group" aria-label={label}>
                <div className="rt-choice-group__label">{label}</div>
                <div className="rt-choice-group__items">
                    {values.map((value) => (
                        <button
                            key={value}
                            type="button"
                            className={cx("rt-choice rt-num", value === selected && "is-selected")}
                            aria-pressed={value === selected}
                            disabled={isDisabled ? isDisabled(value) : false}
                            onClick={() => onPick(value)}
                        >{value}</button>
                    ))}
                </div>
            </div>
        );
    }

    render() {
        if (this.state.players.length === 0) {
            return (
                <div>One moment...</div>
            );
        }

        let { t } = this.props;
        let total = QUESTIONS.length;
        let index = this.state.current;
        let finished = index >= total;
        let players = this.state.players;

        let scores = players.map((player, i) => {
            if (this.state.showDifferences) {
                return <li key={i}>{t(SEAT_NAMES[player.seat]) + ": " + player.points} ({i === 0 ? t("allLast.you") : "+" + (player.points - players[0].points)})</li>;
            } else {
                return <li key={i}>{t(SEAT_NAMES[player.seat]) + ": " + player.points}</li>;
            }
        });

        let settingsSheet = (
            <Modal open={this.state.settingsOpen} onClose={() => this.setState({ settingsOpen: false })} title={t("lastRound.settings")}>
                <div className="rt-stack">
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">{t("allLast.maxFu")}</InputGroupAddon>
                        <Input type="number" inputMode="numeric" aria-label={t("allLast.maxFu")} value={this.state.maxFu} placeholder={t("allLast.fu")} step="5" min="20" max="130" onBlur={this.onFuChanged} onChange={this.onNumberChanged} />
                    </InputGroup>
                    <div className="form-check form-check-inline">
                        <Input className="form-check-input" type="checkbox" id="toggleDifference"
                            checked={this.state.showDifferences} onChange={() => this.onToggleDifferences()} />
                        <Label className="form-check-label" for="toggleDifference">{t("allLast.showDifferences")}</Label>
                    </div>
                    <p className="rt-instructions">{t("allLast.loadInstructions")}</p>
                    <InputGroup>
                        <Input id="loadScoresString" aria-label={t("allLast.loadLabel")} placeholder="28000,26000,24000,22000" autoCapitalize="off" autoCorrect="off" spellCheck="false" />
                        <InputGroupAddon addonType="append">
                            <Button variant="primary" icon="download" onClick={() => this.onLoadSituation()}>{t("allLast.loadLabel")}</Button>
                        </InputGroupAddon>
                    </InputGroup>
                    {this.state.loadErrorMessage ? <p className="rt-feedback rt-feedback--error" role="alert">{this.state.loadErrorMessage.generateString(t)}</p> : null}
                </div>
            </Modal>
        );

        if (finished) {
            let correct = this.state.messages.filter((message) => message && message.feedback === "allLast.correct").length;

            return (
                <div className="rt-page">
                    {settingsSheet}
                    <Card title={t("allLast.title")} icon="barChart">
                        <div className="rt-stack">
                            <p className="rt-lastround__done">{t("lastRound.finished", { correct: correct, total: total })}</p>
                            <Button variant="accent" icon="refresh" onClick={() => this.generateNewQuiz()}>{t("allLast.newLabel")}</Button>
                        </div>
                    </Card>
                </div>
            );
        }

        let question = QUESTIONS[index];
        let answer = this.state.messages[index];
        let answered = !!answer;
        let projection = projectScores(players, question, this.state.han, this.state.fu);
        let place = 1 + projection.scores.slice(1).filter((points) => points > projection.scores[0]).length;
        let percent = Math.round(index / total * 100);

        return (
            <div className="rt-page">
                {settingsSheet}

                <div className="rt-lastround__top">
                    <span className="rt-num">{t("lastRound.progress", { current: index + 1, total: total })}</span>
                    <Button size="sm" variant="secondary" icon="sliders" onClick={() => this.setState({ settingsOpen: true })}>{t("settings.buttonLabel")}</Button>
                </div>
                <div className="rt-bar rt-goal__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent}>
                    <span style={{ width: percent + "%" }} />
                </div>

                <Card title={t(sectionKey(index))} icon={index < 4 ? "shield" : index < 10 ? "target" : "barChart"}>
                    <div className="rt-stack">
                        <p className="rt-instructions">{t("allLast.info")}</p>
                        <ul className="rt-lines rt-num">{scores}</ul>
                        <p className="rt-question__text">{this.questionText(t, question)}</p>

                        {this.renderChoices(t("allLast.han"), HAN_CHOICES, this.state.han, (han) => this.onPickHan(han))}
                        {this.renderChoices(t("allLast.fu"), FU_CHOICES.filter((fu) => fu <= this.state.maxFu), this.state.fu, (fu) => this.onPickFu(fu))}

                        <p className="rt-lastround__outcome rt-num" aria-live="polite">
                            {t("lastRound.outcome", { points: projection.gained, score: projection.scores[0], place: place })}
                        </p>

                        {answered ? answer.generateJSX(t, this.state.showDifferences) : null}

                        <div className="rt-actions">
                            {answered ? (
                                <Button variant="accent" iconRight="chevronRight" onClick={() => this.onNext()}>{t("play.next")}</Button>
                            ) : (
                                <Button variant="primary" icon="check" onClick={() => this.onCheck()}>{t("lastRound.check")}</Button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }
}

function findMinimumTsumoValue(players, scores, placementTarget, maxFu, canBeEqual) {
    for (let i = 0; i < TSUMO_SCORES.length; i++) {
        if (TSUMO_SCORES[i].fu > maxFu) continue;

        let newScores = scores.slice();

        if (players[0].seat === 0) {
            newScores[0] += TSUMO_SCORES[i].dealer * 3;
            newScores[1] -= TSUMO_SCORES[i].dealer;
            newScores[2] -= TSUMO_SCORES[i].dealer;
            newScores[3] -= TSUMO_SCORES[i].dealer;
        } else {
            newScores[0] += TSUMO_SCORES[i].nondealer * 2 + TSUMO_SCORES[i].dealer;
            newScores[1] -= players[1].seat === 0 ? TSUMO_SCORES[i].dealer : TSUMO_SCORES[i].nondealer;
            newScores[2] -= players[2].seat === 0 ? TSUMO_SCORES[i].dealer : TSUMO_SCORES[i].nondealer;
            newScores[3] -= players[3].seat === 0 ? TSUMO_SCORES[i].dealer : TSUMO_SCORES[i].nondealer;
        }

        let sortedScores = newScores.slice().sort((a, b) => a - b);

        if (canBeEqual) {
            if (sortedScores.lastIndexOf(newScores[0]) >= placementTarget) {
                return TSUMO_SCORES[i];
            }
        } else {
            if (sortedScores.indexOf(newScores[0]) >= placementTarget) {
                return TSUMO_SCORES[i];
            }
        }
    }

    return TSUMO_SCORES[0];
}

function findMinimumRonValue(players, scores, ronTarget, placementTarget, maxFu, canBeEqual) {
    for (let i = 0; i < RON_SCORES.length; i++) {
        if (RON_SCORES[i].fu > maxFu) continue;

        let newScores = scores.slice();

        let points = players[0].seat === 0 ? RON_SCORES[i].dealer : RON_SCORES[i].nondealer;
        newScores[0] += points;
        newScores[ronTarget] -= points;

        let sortedScores = newScores.slice().sort((a, b) => a - b);

        if (canBeEqual) {
            if (sortedScores.lastIndexOf(newScores[0]) >= placementTarget) {
                return RON_SCORES[i];
            }
        } else {
            if (sortedScores.indexOf(newScores[0]) >= placementTarget) {
                return RON_SCORES[i];
            }
        }
    }

    return RON_SCORES[0];
}

export default withTranslation()(SouthFourQuiz);