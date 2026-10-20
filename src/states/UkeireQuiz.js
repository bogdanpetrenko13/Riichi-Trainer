import React from 'react';
import { Button, Modal, Icon, showToast, dismissToast } from '../components/ui';
import Tile from '../components/Tile';
import { bumpDaily } from '../progress';
import ReviewPanel from '../components/ReviewPanel';
import Dock from '../components/Dock';
import ModeSwitch from '../components/ModeSwitch';
import { getTrainerMode, setTrainerMode } from '../trainerMode';
import Hand from '../components/Hand';
import History from "../components/History";
import Settings from '../components/ukeire-quiz/Settings';
import CopyButton from '../components/CopyButton';
import LoadButton from '../components/LoadButton';
import DiscardPool from "../components/DiscardPool";
import ValueTileDisplay from "../components/ValueTileDisplay";
import StatsDisplay from "../components/ukeire-quiz/StatsDisplay";
import { generateHand, fillHand } from '../scripts/GenerateHand';
import { calculateDiscardUkeire, calculateUkeireFromOnlyHand } from "../scripts/UkeireCalculator";
import { calculateMinimumShanten, calculateStandardShanten } from "../scripts/ShantenCalculator";
import { convertRedFives, getTileAsText } from "../scripts/TileConversions";
import { convertHandToTenhouString, convertHandToTileIndexArray } from "../scripts/HandConversions";
import { evaluateBestDiscard } from "../scripts/Evaluations";
import { shuffleArray, removeRandomItem, getRandomItem } from '../scripts/Utils';
import SortedHand from '../components/SortedHand';
import Player from '../models/Player';
import { PLAYER_NAMES } from '../Constants';
import { withTranslation } from '../i18n';
import LocalizedMessage from '../models/LocalizedMessage';
import UkeireHistoryData from '../components/ukeire-quiz/UkeireHistoryData';
import HistoryData from '../models/HistoryData';

const DISCLAIMER_KEY = 'rt-disclaimer-seen';

function readStored(key, fallback) {
    try {
        const value = window.localStorage.getItem(key);
        return value === null ? fallback : value;
    } catch {
        return fallback;
    }
}

function writeStored(key, value) {
    try {
        window.localStorage.setItem(key, value);
    } catch { }
}

class UkeireQuiz extends React.Component {
    constructor(props) {
        super(props);
        this.onSettingsChanged = this.onSettingsChanged.bind(this);
        this.onTileClicked = this.onTileClicked.bind(this);
        this.loadHand = this.onHandLoaded.bind(this);
        this.updateTime = this.onUpdateTime.bind(this);
        this.timerUpdate = null;
        this.timer = null;
        this.autoTimer = null;
        this.turnStart = Date.now();
        this.times = [];
        this.onTileSelected = this.onTileSelected.bind(this);
        this.onHint = this.onHint.bind(this);
        this.onDiscardSelected = this.onDiscardSelected.bind(this);
        this.setMode = this.setMode.bind(this);
        this.togglePause = this.togglePause.bind(this);
        this.dismissDisclaimer = this.dismissDisclaimer.bind(this);
        this.state = {
            mode: getTrainerMode(),
            selected: -1,
            preview: null,
            hinted: false,
            review: null,
            whyOpen: false,
            streak: 0,
            avgTime: 0,
            paused: false,
            settingsOpen: false,
            disclaimerOpen: readStored(DISCLAIMER_KEY, '') !== '1',
            hand: null,
            lastDraw: -1,
            remainingTiles: null,
            tilePool: null,
            players: [],
            discardCount: 0,
            optimalCount: 0,
            achievedTotal: 0,
            possibleTotal: 0,
            settings: { /* See ../components/ukeire-quiz/Settings.js */ },
            stats: {
                totalDiscards: 0,
                totalTenpai: 0,
                totalEfficiency: 0,
                totalPossibleEfficiency: 0,
                totalOptimalDiscards: 0
            },
            history: [],
            isComplete: false,
            roundWind: 31,
            seatWind: 31,
            dora: 1,
            shuffle: [],
            disclaimerSeen: false,
            currentTime: 0,
            currentBonus: 0,
        }
    }

    componentDidMount() {
        try {
            let savedStats = window.localStorage.getItem("stats");
            if (savedStats) {
                savedStats = JSON.parse(savedStats);

                this.setState({
                    stats: {
                        totalDiscards: savedStats.totalDiscards,
                        totalTenpai: savedStats.totalTenpai,
                        totalEfficiency: savedStats.totalEfficiency,
                        totalPossibleEfficiency: savedStats.totalPossibleEfficiency,
                        totalOptimalDiscards: savedStats.totalOptimalDiscards
                    }
                }, () => this.onNewHand());
            } else {
                this.setState({}, () => this.onNewHand());
            }
        } catch {
            this.setState({}, () => this.onNewHand());
        }
    }

    componentWillUnmount() {
        clearTimeout(this.autoTimer);
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

    /** Puts all the tiles in the player's hand into the player's discards. */
    discardHand() {
        let hand = this.state.hand;
        let players = this.state.players.slice();

        for (let i = 0; i < hand.length; i++) {
            if (hand[i] === 0) continue;

            for (let j = 0; j < hand[i]; j++) {
                players[0].discards.push(i);
            }
        }

        this.setState({
            players: players
        });
    }

    /** 
     * Randomly chooses between East and South round. 
     * @returns {number} 31 for East, 32 for South
     */
    pickRoundWind() {
        return getRandomItem([31, 32]);
    }

    /**
     * Randomly chooses a seat for the player, between East, South, West, and North (unless it's three player)
     * @returns {number} A number between 31 and 34
     */
    pickSeatWind() {
        let possibilities = [31, 32, 33];
        if (!this.state.settings.threePlayer) {
            possibilities.push(34);
        }

        return getRandomItem(possibilities);
    }

    /**
     * Sets the state to a clean slate based on the given parameters.
     * @param {TileCounts} hand The player's hand.
     * @param {TileCounts} availableTiles The tiles remaining in the wall.
     * @param {TileIndex[]} tilePool A list of tile indexes representing the remaining tiles.
     * @param {UkeireHistoryData[]} history A list of history objects.
     * @param {TileIndex} dora The dora indicator.
     * @param {TileIndex} lastDraw The tile the player just drew.
     * @param {TileIndex} seatWind The player's seat.
     * @param {TileIndex} roundWind The round.
     */
    setNewHandState(hand, availableTiles, tilePool, history, dora, lastDraw = false, seatWind = false, roundWind = false) {
        history.unshift(new HistoryData(new LocalizedMessage("trainer.start", { hand: convertHandToTenhouString(hand) })));

        let players = [];
        let numberOfPlayers = this.state.settings.threePlayer ? 3 : 4;
        seatWind = seatWind || this.pickSeatWind();

        for (let i = 0; i < numberOfPlayers; i++) {
            let player = new Player();
            player.name = PLAYER_NAMES[i];
            player.seat = (seatWind - 31 + i) % numberOfPlayers;
            players.push(player);
        }

        if (lastDraw !== false) hand[lastDraw]--;
        let shuffle = convertHandToTileIndexArray(hand);
        if (lastDraw !== false) hand[lastDraw]++;
        shuffle = shuffleArray(shuffle);

        this.turnStart = Date.now();

        this.setState({
            selected: -1,
            preview: null,
            hinted: false,
            review: null,
            whyOpen: false,
            hand: hand,
            remainingTiles: availableTiles,
            tilePool: tilePool,
            players: players,
            discardCount: 0,
            optimalCount: 0,
            achievedTotal: 0,
            possibleTotal: 0,
            history: history,
            isComplete: false,
            lastDraw: lastDraw || shuffle.pop(),
            roundWind: roundWind || this.pickRoundWind(),
            seatWind: seatWind,
            dora: dora,
            shuffle: shuffle,
            currentTime: this.state.settings.time + 2,
            currentBonus: this.state.settings.extraTime
        });

        if (this.state.disclaimerSeen && this.state.settings.useTimer) {
            this.timer = setTimeout(
                () => {
                    this.onTileClicked({target:{name:this.state.lastDraw}});
                    this.setState({
                        currentBonus: 0
                    });
                },
                (this.state.settings.time + this.state.settings.extraTime + 2) * 1000
            );
            this.timerUpdate = setInterval(this.updateTime, 100);
        }
    }

    /** Generates a new hand and fresh game state. */
    onNewHand() {
        clearTimeout(this.autoTimer);

        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }

        let history = [];
        let dora = 1;
        let hand, availableTiles, tilePool;

        let minShanten = this.state.settings.minShanten;
        minShanten = Math.max(0, minShanten);

        // Count how many suits are currently enabled.
        let allowedSuits = +this.state.settings.honors
            + +this.state.settings.bamboo
            + +this.state.settings.characters
            + +this.state.settings.circles;

        minShanten = Math.min(minShanten, allowedSuits);

        if (!this.state.settings.reshuffle && this.state.hand) {
            this.discardHand();
            let remainingTiles = this.state.remainingTiles.slice();

            if (this.state.tilePool.length > 0) {
                dora = removeRandomItem(this.state.tilePool);
                remainingTiles[dora]--;
            }

            do {
                let generationResult = generateHand(remainingTiles, this.state.settings.tilesInHand);
                hand = generationResult.hand;
                availableTiles = generationResult.availableTiles;
                tilePool = generationResult.tilePool;

                if (!hand) break;
            } while (calculateMinimumShanten(hand) < minShanten)

            if (!hand) {
                history.push(new HistoryData(new LocalizedMessage("trainer.error.wallEmptyShuffle")));
                // Continues into the normal flow, rebuilding the wall.
            }
            else {
                this.setNewHandState(hand, availableTiles, tilePool, history, dora);
                return;
            }
        }

        let remainingTiles = this.getStartingTiles();
        do {
            let generationResult = generateHand(remainingTiles, this.state.settings.tilesInHand);
            hand = generationResult.hand;
            availableTiles = generationResult.availableTiles;
            tilePool = generationResult.tilePool;

            if (!hand) {
                history.push(new HistoryData(new LocalizedMessage("trainer.error.wallEmpty")));

                this.setState({
                    history: history
                });
                return;
            }
        } while (calculateMinimumShanten(hand) < minShanten)

        if (tilePool.length > 0) {
            dora = removeRandomItem(tilePool);
            availableTiles[dora]--;
        }

        this.setNewHandState(hand, availableTiles, tilePool, history, dora);
    }

    /**
     * Creates an array containing how many of each tile should be in the wall at the start of the game based on the current settings.
     * @returns {TileCounts} The available tiles.
     */
    getStartingTiles() {
        let availableTiles = Array(38).fill(0);

        if (this.state.settings.characters) {
            for (let i = 1; i < 10; i++) {
                availableTiles[i] = 4;
            }

            if (this.state.settings.threePlayer) {
                for (let i = 2; i < 9; i++) {
                    availableTiles[i] = 0;
                }
            }
        }

        if (this.state.settings.circles) {
            for (let i = 11; i < 20; i++) {
                availableTiles[i] = 4;
            }
        }

        if (this.state.settings.bamboo) {
            for (let i = 21; i < 30; i++) {
                availableTiles[i] = 4;
            }
        }

        if (this.state.settings.honors) {
            for (let i = 31; i < 38; i++) {
                availableTiles[i] = 4;
            }
        }

        if (this.state.settings.redFives > 0) {
            // Start with pinzu, since 4 red fives usually involves two 0p
            let suit = 10;

            for (let i = 0; i < this.state.settings.redFives; i++) {
                if (availableTiles[suit + 5] > 0) {
                    availableTiles[suit + 5]--;
                    availableTiles[suit]++;
                }

                suit = (suit + 10) % 30;
            }
        }

        return availableTiles;
    }

    /** Discards the clicked tile, adds a message comparing its efficiency with the best tile, and draws a new tile */
    onTileClicked(event) {
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }

        let isComplete = this.state.isComplete;
        if (isComplete) return;

        let chosenTile = parseInt(event.target.name);
        let hand = this.state.hand.slice();
        let remainingTiles = this.state.remainingTiles.slice();

        let shantenFunction = this.state.settings.exceptions ? calculateMinimumShanten : calculateStandardShanten;
        let ukeire = calculateDiscardUkeire(hand, remainingTiles, shantenFunction);
        let chosenUkeire = ukeire[convertRedFives(chosenTile)];

        let handString = convertHandToTenhouString(hand);

        // Acceptance of every distinct discard, for the review bars
        let reviewCounts = convertRedFives(hand);
        let reviewRows = [];
        for (let i = 0; i < reviewCounts.length; i++) {
            if (reviewCounts[i] > 0) reviewRows.push({ tile: i, value: ukeire[i].value });
        }
        reviewRows.sort((a, b) => b.value - a.value);
        let reviewChosen = convertRedFives(chosenTile);
        reviewRows = reviewRows.filter((row) => row.value > 0 || row.tile === reviewChosen);

        hand[chosenTile]--;

        let shanten = shantenFunction(hand);
        let handUkeire = calculateUkeireFromOnlyHand(hand, this.getStartingTiles(), shantenFunction);
        let bestTile = evaluateBestDiscard(ukeire, this.state.dora + 1);

        let players = this.state.players.slice();
        players[0].discards.push(chosenTile);

        let achievedTotal = this.state.achievedTotal + chosenUkeire.value;
        let possibleTotal = this.state.possibleTotal + ukeire[bestTile].value;
        let tilePool = this.state.tilePool.slice();
        let drawnTile = -1;


        let historyData = new UkeireHistoryData(
            chosenTile,
            chosenUkeire,
            bestTile,
            ukeire[bestTile],
            shanten,
            handString,
            handUkeire,
            players[0].discards.slice()
        );

        if (shanten <= 0 && handUkeire.value > 0) {
            // If the hand is tenpai, and has winning tiles outside of the hand, training is complete
            let message = new LocalizedMessage("trainer.complete", { achieved: achievedTotal, total: possibleTotal, percent: Math.floor(achievedTotal / possibleTotal * 1000) / 10 })
            historyData.message = message;
            isComplete = true;
        }

        if (!isComplete) {
            if (this.state.settings.simulate) {
                for (let i = 1; i < players.length; i++) {
                    if (tilePool.length === 0) continue;

                    let simulatedDiscard = removeRandomItem(tilePool);
                    players[i].discards.push(simulatedDiscard);
                    remainingTiles[simulatedDiscard]--;
                }
            }

            if (tilePool.length > 0) {
                drawnTile = removeRandomItem(tilePool);
                hand[drawnTile]++;
                remainingTiles[drawnTile]--;

                historyData.drawnTile = drawnTile;

                if (this.state.settings.useTimer) {
                    this.timer = setTimeout(
                        () => {
                            this.onTileClicked({target:{name:this.state.lastDraw}});
                            this.setState({
                                currentBonus: 0
                            });
                        },
                        (this.state.settings.time + this.state.currentBonus) * 1000
                    );
                    this.timerUpdate = setInterval(this.updateTime, 100);
                }
            }
            else {
                // No tiles left in the wall
                isComplete = true;
            }
        }

        let history = this.state.history;
        history.unshift(historyData);

        // Streak and average time per discard
        let wasBest = chosenUkeire.value === ukeire[bestTile].value && !this.state.hinted;
        this.times.push((Date.now() - this.turnStart) / 1000);
        this.turnStart = Date.now();
        let avgTime = this.times.reduce((sum, time) => sum + time, 0) / this.times.length;

        if (this.state.mode === 'quick') {
            let { t } = this.props;
            if (this.lastToast) dismissToast(this.lastToast);
            this.lastToast = showToast(wasBest
                ? { type: 'success', duration: 1600, message: t('play.quickOk', { count: chosenUkeire.value }) }
                : { type: 'warning', duration: 2600, message: t('play.quickMiss', { tile: getTileAsText(t, bestTile, false), best: ukeire[bestTile].value, count: chosenUkeire.value }) });
        }

        let shuffle = this.state.shuffle.slice();

        if (chosenTile !== this.state.lastDraw) {
            for (let i = 0; i < shuffle.length; i++) {
                if (shuffle[i] === chosenTile) {
                    shuffle[i] = this.state.lastDraw;
                    break;
                }
            }
        }

        this.setState({
            hand: hand,
            tilePool: tilePool,
            remainingTiles: remainingTiles,
            players: players,
            discardCount: this.state.discardCount + 1,
            optimalCount: this.state.optimalCount + (wasBest ? 1 : 0),
            hasCopied: false,
            achievedTotal: achievedTotal,
            possibleTotal: possibleTotal,
            history: history,
            isComplete: isComplete,
            lastDraw: drawnTile,
            shuffle: shuffle,
            disclaimerSeen: true,
            currentTime: this.state.settings.time,
            selected: -1,
            preview: null,
            hinted: false,
            whyOpen: false,
            review: { rows: reviewRows, chosen: convertRedFives(chosenTile), best: bestTile, data: historyData, hinted: this.state.hinted },
            streak: wasBest ? this.state.streak + 1 : 0,
            avgTime: avgTime,
        }, () => {
            if (isComplete) {
                this.saveStats();
                this.scheduleAutoHand();
            }
        });
    }

    /** Tap handler used by the hand: select first in confirm mode, discard at once in quick mode. */
    onTileSelected(event) {
        if (this.state.isComplete) return;

        let tile = parseInt(event.target.name);

        if (this.state.mode === 'quick' || this.state.selected === tile) {
            this.onTileClicked(event);
            return;
        }

        // Selecting a tile reveals nothing: the answer is only shown after the discard is confirmed.
        this.setState({ selected: tile, preview: null, review: null });
    }

    /** Optional hint: shows the acceptance of the selected tile, but the discard no longer counts as optimal. */
    onHint() {
        if (this.state.selected < 0 || this.state.isComplete) return;

        let shantenFunction = this.state.settings.exceptions ? calculateMinimumShanten : calculateStandardShanten;
        let ukeire = calculateDiscardUkeire(this.state.hand.slice(), this.state.remainingTiles.slice(), shantenFunction);
        let chosen = ukeire[convertRedFives(this.state.selected)];

        this.setState({ hinted: true, preview: { value: chosen.value, tiles: chosen.tiles } });
    }

    onDiscardSelected() {
        if (this.state.selected > -1) this.onTileClicked({ target: { name: this.state.selected } });
    }

    setMode(mode) {
        setTrainerMode(mode);
        clearTimeout(this.autoTimer);
        this.setState({ mode: mode, selected: -1, preview: null }, () => this.scheduleAutoHand());
    }

    /** In quick mode a finished hand is replaced by a new one after a short pause. */
    scheduleAutoHand(delay = 1600) {
        clearTimeout(this.autoTimer);

        if (this.state.mode === 'quick' && this.state.isComplete && !this.state.paused) {
            this.autoTimer = setTimeout(() => this.onNewHand(), delay);
        }
    }

    togglePause() {
        let paused = !this.state.paused;
        clearTimeout(this.autoTimer);
        this.setState({ paused: paused }, () => { if (!paused) this.scheduleAutoHand(300); });
    }

    dismissDisclaimer() {
        writeStored(DISCLAIMER_KEY, '1');
        this.setState({ disclaimerOpen: false });
    }

    onUpdateTime() {
        if (this.state.currentTime > 0.1) {
            this.setState({
                currentTime: Math.max(this.state.currentTime - 0.1, 0)
            });
        } else {
            this.setState({
                currentBonus: Math.max(this.state.currentBonus - 0.1, 0)
            });
        }
    }

    /** Save the player's current stats into local storage. */
    saveStats() {
        let stats = this.state.stats;
        stats.totalDiscards += this.state.discardCount;
        stats.totalTenpai += 1;
        stats.totalEfficiency += this.state.achievedTotal;
        stats.totalPossibleEfficiency += this.state.possibleTotal;
        stats.totalOptimalDiscards += this.state.optimalCount;
        bumpDaily();

        this.setState({
            stats: stats
        });

        try {
            window.localStorage.setItem("stats", JSON.stringify(stats));
        } catch { }
    }

    /** Reset the player's stats to nothing. */
    resetStats() {
        let stats = {
            totalDiscards: 0,
            totalTenpai: 0,
            totalEfficiency: 0,
            totalPossibleEfficiency: 0,
            totalOptimalDiscards: 0
        };

        this.setState({
            stats: stats
        });

        try {
            window.localStorage.setItem("stats", JSON.stringify(stats));
        } catch { }
    }

    /**
     * Starts a new round with the hand the player loaded, if possible.
     * @param {{hand:TileCounts, tiles:number, dora:TileIndex, roundWind:number, seatWind: number, draw:TileIndex}} loadData The data from the hand parser.
     */
    onHandLoaded(loadData) {
        if (loadData.tiles === 0) {
            this.logToHistory("trainer.error.load");
            return;
        }

        let remainingTiles = this.getStartingTiles();

        // Remove the tiles in the hand from the wall
        for (let i = 0; i < remainingTiles.length; i++) {
            remainingTiles[i] = Math.max(0, remainingTiles[i] - loadData.hand[i]);
        }

        let dora = loadData.dora;
        if (dora !== false) {
            dora = Math.min(Math.max(0, dora), 37);
            remainingTiles[dora]--;
        }

        let { hand, availableTiles, tilePool } = fillHand(remainingTiles, loadData.hand, this.state.settings.tilesInHand - loadData.tiles);

        if (!hand) {
            this.logToHistory("trainer.error.wallEmpty");
            return;
        }

        if (dora === false) {
            if (tilePool.length > 0) {
                dora = removeRandomItem(tilePool);
                availableTiles[dora]--;
            }
        }

        let roundWind = loadData.roundWind;
        let seatWind = loadData.seatWind;
        let draw = loadData.draw;

        if (roundWind !== false) {
            roundWind = Math.min(Math.max(1, roundWind), 4) + 30;
        }
        if (seatWind !== false) {
            seatWind = Math.min(Math.max(1, seatWind), 4) + 30;
        }
        if (draw !== false) {
            draw = Math.min(Math.max(0, draw), 37);
            // Ensure the drawn tile is in the hand
            if (hand[draw] <= 0) draw = false;
        }

        this.setNewHandState(hand, availableTiles, tilePool, [], dora, draw, seatWind, roundWind);
    }

    /**
     * Adds an object to the history containing just a message.
     * @param {string} text The localization key to log to the history.
     */
    logToHistory(text) {
        let history = this.state.history;
        history.unshift(new HistoryData(new LocalizedMessage(text)));
        this.setState({
            history: history,
        });
    }

    renderPreview(t) {
        let preview = this.state.preview;

        return (
            <section className="rt-peek" aria-live="polite">
                <div className="rt-peek__head">
                    <Icon name="target" size={18} />
                    <strong className="rt-num">{t("play.acceptance", { count: preview.value })}</strong>
                </div>
                {preview.tiles.length > 0 ? (
                    <React.Fragment>
                        <div className="rt-peek__label">{t("play.improves")}</div>
                        <div className="rt-peek__tiles">
                            {preview.tiles.map((tile) => <Tile key={tile} className="discardTile" tile={tile} showIndexes={this.state.settings.showIndexes} />)}
                        </div>
                    </React.Fragment>
                ) : null}
            </section>
        );
    }

    renderReview(t) {
        let review = this.state.review;

        return (
            <ReviewPanel
                rows={review.rows}
                chosen={review.chosen}
                best={review.best}
                lines={review.data.getMessage(t, false, true, true).split("<br/>")}
                whyOpen={this.state.whyOpen}
                onToggleWhy={() => this.setState({ whyOpen: !this.state.whyOpen })}
                hinted={review.hinted}
                onNext={() => this.setState({ review: null, whyOpen: false })}
            />
        );
    }

    render() {
        let { t } = this.props;
        let blind = this.state.players.length && this.state.players[0].discards.length && this.state.settings.blind && !this.state.isComplete;
        let quick = this.state.mode === 'quick';

        let modeSwitch = <ModeSwitch mode={this.state.mode} onChange={this.setMode} />;

        let handProps = {
            lastDraw: this.state.lastDraw,
            onTileClick: this.onTileSelected,
            selected: this.state.selected > -1 ? this.state.selected : undefined,
            showIndexes: this.state.settings.showIndexes && !blind,
            blind: blind,
        };

        return (
            <div className="rt-page rt-trainer">
                <Settings
                    onChange={this.onSettingsChanged}
                    open={this.state.settingsOpen}
                    onClose={() => this.setState({ settingsOpen: false })}
                    header={modeSwitch}
                />
                <Modal
                    open={this.state.disclaimerOpen}
                    onClose={this.dismissDisclaimer}
                    title={t("play.disclaimerTitle")}
                    footer={<Button variant="primary" onClick={this.dismissDisclaimer}>{t("play.gotIt")}</Button>}
                >
                    <p>{t("trainer.disclaimer")}</p>
                </Modal>

                <ValueTileDisplay roundWind={this.state.roundWind} seatWind={this.state.seatWind} dora={this.state.dora} showIndexes={this.state.settings.showIndexes} />

                {quick || this.state.settings.useTimer ? (
                    <div className="rt-chips">
                        {quick ? <span className="rt-chip"><span className="rt-chip__label">{t("play.streak")}</span> <b className="rt-num">{this.state.streak}</b></span> : null}
                        {quick ? <span className="rt-chip"><span className="rt-chip__label">{t("play.avgTime")}</span> <b className="rt-num">{this.state.avgTime.toFixed(1)}{t("play.seconds")}</b></span> : null}
                        {this.state.settings.useTimer ? <span className="rt-chip rt-num">{this.state.currentTime.toFixed(1)} + {this.state.currentBonus.toFixed(1)}</span> : null}
                        {quick ? <Button size="sm" variant="ghost" icon={this.state.paused ? "play" : "minus"} onClick={this.togglePause}>{this.state.paused ? t("play.resume") : t("play.pause")}</Button> : null}
                    </div>
                ) : null}

                <div className="rt-trainer__hint">
                    <p className="rt-instructions">{this.state.isComplete ? "" : (quick ? t("play.tapQuick") : t("play.tapToSelect"))}</p>
                    <div className="rt-trainer__hintbtns">
                        {!quick && !this.state.isComplete && this.state.selected > -1 && !this.state.preview ? (
                            <Button size="sm" variant="ghost" icon="info" onClick={this.onHint}>{t("play.hint")}</Button>
                        ) : null}
                        <Button size="sm" variant="secondary" icon="sliders" onClick={() => this.setState({ settingsOpen: true })}>{t("settings.buttonLabel")}</Button>
                    </div>
                </div>
                {this.state.preview ? this.renderPreview(t) : this.state.review && !quick ? this.renderReview(t) : null}

                <div className="rt-actions">
                    <Button variant={this.state.isComplete ? "success" : "accent"} icon="refresh" onClick={() => this.onNewHand()}>{t("trainer.newHandButtonLabel")}</Button>
                    <CopyButton hand={this.state.hand} />
                    <LoadButton callback={this.loadHand} />
                </div>
                <History history={this.state.history} concise={this.state.settings.extraConcise} verbose={this.state.settings.verbose} spoilers={this.state.settings.spoilers}/>
                <DiscardPool players={this.state.players} discardCount={this.state.discardCount} wallCount={this.state.tilePool && this.state.tilePool.length} showIndexes={this.state.settings.showIndexes} />
                <StatsDisplay values={this.state.stats} onReset={() => this.resetStats()} />

                <Dock>
                    {!quick ? (
                        <Button
                            variant="accent"
                            block
                            disabled={this.state.selected < 0 || this.state.isComplete}
                            onClick={this.onDiscardSelected}
                        >{t("play.discard")}</Button>
                    ) : null}
                    {this.state.settings.sort
                        ? <Hand tiles={this.state.hand} {...handProps} />
                        : <SortedHand tiles={this.state.shuffle} {...handProps} />
                    }
                </Dock>
            </div>
        );
    }
}

export default withTranslation()(UkeireQuiz);
