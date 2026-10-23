import React from 'react';
import { ListGroup, ListGroupItem } from '../components/ui/legacy';
import { Button, Collapsible, showToast, dismissToast, cx } from '../components/ui';
import Dock from '../components/Dock';
import Hand from '../components/Hand';
import Settings from '../components/shanten-quiz/Settings';
import StatsDisplay from '../components/shanten-quiz/StatsDisplay';
import { generateHand } from '../scripts/GenerateHand';
import { calculateMinimumShanten } from "../scripts/ShantenCalculator";
import { convertHandToTileIndexArray } from "../scripts/HandConversions";
import { shuffleArray } from '../scripts/Utils';
import { withTranslation } from '../i18n';
import { CSS_CLASSES } from '../Constants';

class ShantenQuiz extends React.Component {
    constructor(props) {
        super(props);
        this.onSettingsChanged = this.onSettingsChanged.bind(this);
        this.onSubmitGuess = this.onSubmitGuess.bind(this);
        this.onAnswer = this.onAnswer.bind(this);
        this.updateTime = this.onUpdateTime.bind(this);
        this.resetStats = this.resetStats.bind(this);
        this.timerUpdate = null;
        this.timer = null;
        this.state = {
            hand: null,
            shanten: null,
            shuffle: [],
            guess: '',
            streak: 0,
            settingsOpen: false,
            history: [],
            settings: {
                useTimer: false,
                showIndexes: false,
                showHandInHistory: false,
                time: 10,
            },
            currentTime: 0,
            stats: {
                correctGuesses: 0,
                totalGuesses: 0,
                totalTime: 0,
            }
        };
    }

    componentDidMount() {
        this.onNewHand();
    }

    componentWillUnmount() {
        if (this.lastToast) dismissToast(this.lastToast);
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }
    }

    onSettingsChanged(settings) {
        if (!settings.useTimer) {
            if (this.timer != null) {
                clearTimeout(this.timer);
                clearInterval(this.timerUpdate);
            }
        }

        this.setState({
            settings: settings
        });
    }

    /** Generates a new hand and calculates its shanten. */
    onNewHand() {
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }

        let remainingTiles = this.getStartingTiles();
        let generationResult = generateHand(remainingTiles);
        let hand = generationResult.hand;

        let shanten = calculateMinimumShanten(hand);

        let shuffle = convertHandToTileIndexArray(hand);
        shuffle = shuffleArray(shuffle);

        this.setState({
            hand: hand,
            shanten: shanten,
            shuffle: shuffle,
            guess: '',
            currentTime: this.state.settings.time,
        });

        if (this.state.settings.useTimer) {
            this.timer = setTimeout(
                () => {
                    this.onSubmitGuess();
                },
                (this.state.settings.time) * 1000
            );
            this.timerUpdate = setInterval(this.updateTime, 100);
        }
    }

    /**
     * Creates an array containing how many of each tile should be in the wall at the start of the game.
     * @returns {TileCounts} The available tiles.
     */
    getStartingTiles() {
        let availableTiles = Array(38).fill(0);

        for (let i = 1; i < 30; i++) {
            availableTiles[i] = 4;
        }

        for (let i = 31; i < 38; i++) {
            availableTiles[i] = 4;
        }

        return availableTiles;
    }

    getHistoryClassName(guess, shanten) {
        return parseInt(guess) === shanten ? CSS_CLASSES.CORRECT : CSS_CLASSES.INCORRECT
    }

    getHistoryMessage(guess, shanten) {
        let { t } = this.props;

        if (guess === '') {
            return t("shanten.historyNone", { shanten: shanten });
        }

        if (parseInt(guess) === shanten) {
            return t("shanten.historyOk", { guess: guess });
        }

        return t("shanten.historyMiss", { guess: guess, shanten: shanten });
    }

    /** One tap on an answer chip submits it. */
    onAnswer(value) {
        this.setState({ guess: String(value) }, this.onSubmitGuess);
    }

    /** Handles the user's guess submission. */
    onSubmitGuess() {
        let { guess, shanten, hand, history, stats, currentTime } = this.state;
        const className = this.getHistoryClassName(guess, shanten);
        const text = this.getHistoryMessage(guess, shanten);
        history.unshift({ text, className, hand });

        stats.totalGuesses += 1;

        if (this.state.settings.useTimer) {
            stats.totalTime += this.state.settings.time - currentTime;
        }

        if (parseInt(guess) === shanten) {
            stats.correctGuesses += 1;
        }

        let correct = parseInt(guess) === shanten;
        let { t } = this.props;
        if (this.lastToast) dismissToast(this.lastToast);
        this.lastToast = showToast(correct
            ? { type: 'success', duration: 1400, message: t("shanten.quickOk", { shanten: shanten }) }
            : { type: 'warning', duration: 2600, message: guess === '' ? t("shanten.noAnswer", { shanten: shanten }) : t("shanten.quickMiss", { shanten: shanten, guess: guess }) });

        this.setState({ history, stats, streak: correct ? this.state.streak + 1 : 0 });
        this.onNewHand();
    }

    onUpdateTime() {
        if (this.state.currentTime > 0.1) {
            this.setState({
                currentTime: Math.max(this.state.currentTime - 0.1, 0)
            });
        }
    }

    resetStats() {
        this.setState({
            stats: {
                correctGuesses: 0,
                totalGuesses: 0,
                totalTime: 0,
            }
        });
    }

    render() {
        let { t } = this.props;
        const currentTime = this.state.currentTime || 0;
        const answers = [-1, 0, 1, 2, 3, 4, 5, 6];

        return (
            <div className="rt-page rt-trainer rt-trainer--dock">
                <Settings
                    onChange={this.onSettingsChanged}
                    open={this.state.settingsOpen}
                    onClose={() => this.setState({ settingsOpen: false })}
                />

                <div className="rt-chips">
                    <span className="rt-chip"><span className="rt-chip__label">{t("shanten.streakLabel")}</span> <b className="rt-num">{this.state.streak}</b></span>
                    {this.state.settings.useTimer ? <span className="rt-chip rt-num">{currentTime.toFixed(1)}</span> : null}
                </div>

                <div className="rt-trainer__hint">
                    <p className="rt-instructions">{t("shanten.tapAnswer")}</p>
                    <Button size="sm" variant="secondary" icon="refresh" aria-label={t("shanten.newHandButtonLabel")} title={t("shanten.newHandButtonLabel")} onClick={() => this.onNewHand()} />
                    <Button size="sm" variant="secondary" icon="sliders" aria-label={t("settings.buttonLabel")} title={t("settings.buttonLabel")} onClick={() => this.setState({ settingsOpen: true })} />
                </div>

                <section className="rt-board rt-board--play">
                    <Hand tiles={this.state.hand} showIndexes={this.state.settings.showIndexes} />
                </section>

                <StatsDisplay values={this.state.stats} onReset={this.resetStats} useTimer={this.state.settings.useTimer} />

                <Collapsible title={t("shanten.history.buttonLabel")} icon="history" defaultOpen>
                    {this.state.history.length === 0 ? <p className="rt-empty">{t("shanten.historyEmpty")}</p> : null}
                    <ListGroup>
                        {this.state.history.map((entry, index) => (
                            <ListGroupItem key={index} className={entry.className}>
                                {entry.text}
                                {this.state.settings.showHandInHistory && <Hand compact tiles={entry.hand} showIndexes={this.state.settings.showIndexes} />}
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                </Collapsible>

                <Dock>
                    <div className="rt-answers" role="group" aria-label={t("shanten.guessPlaceholder")}>
                        {answers.map((value) => (
                            <button key={value} type="button" className={cx("rt-choice rt-num")} onClick={() => this.onAnswer(value)}>{value}</button>
                        ))}
                    </div>
                </Dock>
            </div>
        );
    }
}

export default withTranslation()(ShantenQuiz);