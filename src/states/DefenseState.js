import React from 'react';
import { withTranslation } from '../i18n';
import { Button, Collapsible, Icon, showToast, dismissToast } from '../components/ui';
import Tile from '../components/Tile';
import Dock from '../components/Dock';
import ReviewPanel from '../components/ReviewPanel';
import ModeSwitch from '../components/ModeSwitch';
import { getTrainerMode, setTrainerMode } from '../trainerMode';
import { getTileAsText } from '../scripts/TileConversions';
import DiscardTable from '../components/DiscardTable';
import Hand from '../components/Hand';
import History from '../components/History';
import Player from "../models/Player";
import { ALL_TILES_REMAINING, PLAYER_NAMES, SAFETY_RATING_EXPLANATIONS } from "../Constants";
import { generateHand } from "../scripts/GenerateHand";
import { shuffleArray, randomInt, removeRandomItem, getRandomItem } from "../scripts/Utils";
import calculateMinimumShanten from "../scripts/ShantenCalculator";
import { calculateDiscardUkeire } from "../scripts/UkeireCalculator";
import { evaluateBestDiscard, evaluateDiscardSafety } from "../scripts/Evaluations";
import { convertHandToTileIndexArray, convertHandToTenhouString } from "../scripts/HandConversions";
import SafetyHistoryData from '../components/defense-trainer/SafetyHistoryData';
import HistoryData from '../models/HistoryData';
import LocalizedMessage from '../models/LocalizedMessage';
import LocalizedMessageChain from '../models/LocalizedMessageChain';
import DefenseSettings from '../components/defense-trainer/DefenseSettings';

class DefenseState extends React.Component {
    constructor(props) {
        super(props);
        this.onTileClicked = this.onTileClicked.bind(this);
        this.onTileSelected = this.onTileSelected.bind(this);
        this.onDiscardSelected = this.onDiscardSelected.bind(this);
        this.setMode = this.setMode.bind(this);
        this.onSettingsChanged = this.onSettingsChanged.bind(this);
        this.updateTime = this.onUpdateTime.bind(this);
        this.timerUpdate = null;
        this.timer = null;
        this.state = {
            mode: getTrainerMode(),
            selected: -1,
            preview: null,
            review: null,
            whyOpen: false,
            streak: 0,
            settingsOpen: false,
            lastDraw: 0,
            isComplete: false,
            /** @type Player[] */
            players: [],
            history: [],
            tilePool: [],
            discardCount: 0,
            dora: 0,
            chartCollapsed: true,
            settings: {
                verbose: true,
                numberOfRiichis: 1,
                minimumTurnsBeforeRiichi: 4,
                tilesInHand: 13,
            },
            currentTime: 0,
            currentBonus: 0,
        }
    }

    componentDidMount() {
        // Ensure settings are loaded before starting a new hand.
        this.setState({}, () => this.onNewHand());
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

    /** Generates a fresh game state. */
    onNewHand() {
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }

        /** @type {Player[]} */
        let players = [];
        let tilePool = [];

        let remainingTiles = ALL_TILES_REMAINING.slice();
        let dora = randomInt(10, 1) + randomInt(3) * 10;
        remainingTiles[dora]--;

        // Pick numberOfRiichis random players to be in riichi.
        let riichiPlayers = shuffleArray([1, 2, 3]).slice(0, this.state.settings.numberOfRiichis);
        let playerSeat = randomInt(4);

        // Generate players with random hands
        for (let i = 0; i < 4; i++) {
            let player = new Player();
            let shanten = 0;

            do {
                let generationResult = generateHand(remainingTiles);
                remainingTiles = generationResult.availableTiles;
                player.hand = generationResult.hand;
                tilePool = generationResult.tilePool;
                shanten = calculateMinimumShanten(player.hand);
            } while (shanten < 1);

            player.name = PLAYER_NAMES[i];
            player.seat = (playerSeat + i) % 4;

            // If this is one of the players who calls riichi, bring their hand to tenpai
            if (riichiPlayers.indexOf(i) > -1) {
                let finishResult = this.finishHand(player, tilePool, remainingTiles);
                tilePool = finishResult.tilePool;
                remainingTiles = finishResult.remainingTiles;
            }

            players.push(player);
        }

        let minDiscards = Math.min(...riichiPlayers.map(player => players[player].discards.length));
        let maxDiscards = Math.max(...riichiPlayers.map(player => players[player].discards.length));

        // Bring all the riichi players to the same number of discards
        for (let i = 0; i < riichiPlayers.length; i++) {
            let currentPlayer = players[riichiPlayers[i]];
            let riichiIndex = currentPlayer.riichiIndex;

            for (let j = riichiIndex; j < maxDiscards; j++) {
                for (let k = 0; k < riichiPlayers.length; k++) {
                    if (k === i) continue;

                    let otherPlayer = players[riichiPlayers[k]];

                    if (otherPlayer.discards.length <= j) continue;

                    if (j > riichiIndex ||
                        (j === riichiIndex && currentPlayer.takesTurnBefore(otherPlayer))) {
                        currentPlayer.discardsAfterRiichi.push(otherPlayer.discards[j]);
                    }
                }
            }
        }

        // Fill the discards of each player.
        players.forEach((player) => {
            // Discards made before any riichi
            while (player.discards.length < minDiscards - 1) {
                let tile = removeRandomItem(tilePool);
                player.discards.push(tile);
            }

            // Discard made on the same turn as the first riichi
            if (!player.isInRiichi() && player.discards.length < minDiscards) {
                if (riichiPlayers.some((index => players[index].takesTurnBefore(player)))) {
                    // Someone declared riichi before this player discarded
                    this.drawTilesToFourteen(player, tilePool);
                    let discard = this.discardSafestTile(player, players, tilePool);

                    for (let j = 0; j < riichiPlayers.length; j++) {
                        if (players[riichiPlayers[j]].takesTurnBefore(player)) {
                            players[riichiPlayers[j]].discardsAfterRiichi.push(discard);
                        }
                    }
                } else {
                    // This player discarded before any riichis happened
                    this.drawTilesToFourteen(player, tilePool);
                    this.discardMostEfficientTile(player, players, tilePool);
                }
            }

            // Discards made after the first riichi
            while (player.discards.length < maxDiscards) {
                let discard;

                if (player.isInRiichi()) {
                    // This player can't change their hand
                    discard = removeRandomItem(tilePool);
                    player.discards.push(discard);

                } else {
                    // Fold vs the first (and maybe second) riichi
                    this.drawTilesToFourteen(player, tilePool);
                    discard = this.discardSafestTile(player, players, tilePool);
                }

                for (let j = 0; j < riichiPlayers.length; j++) {
                    let otherPlayer = players[riichiPlayers[j]];
                    if (player.discards.length - 1 > otherPlayer.riichiIndex ||
                        (player.discards.length - 1 === otherPlayer.riichiIndex && otherPlayer.takesTurnBefore(player))) {
                        otherPlayer.discardsAfterRiichi.push(discard);
                    }
                }
            }
        });

        // playerSeat -> dealerIndex: 0 -> 0, 1 -> 3, 2 -> 2, 3 -> 1
        let dealerIndex = (4 - playerSeat) % 4;

        // Discard a tile for the players whose turn comes before the user's
        for (let i = dealerIndex; i > 0; i = (i + 1) % 4) {
            let discard = -1;

            if (players[i].isInRiichi()) {
                discard = removeRandomItem(tilePool);
                players[i].discards.push(discard);
            } else {
                this.drawTilesToFourteen(players[i], tilePool);
                discard = this.discardSafestTile(players[i], players, tilePool);
            }

            this.tileDiscardedAfterRiichi(discard, players);
        }

        // Remove safe tiles from the player's hand without adding them to the discards
        let tileCount = convertHandToTileIndexArray(players[0].hand).length;
        while (tileCount > this.state.settings.tilesInHand) {
            let averageSafety = this.getAverageSafety(players[0], players);
            let bestSafety = Math.max(...averageSafety);
            let bestChoice = averageSafety.indexOf(bestSafety);
            players[0].hand[bestChoice]--;
            tileCount--;
        }

        // Dead wall
        for (let i = 0; i < 13; i++) {
            removeRandomItem(tilePool);
        }

        let shuffle = convertHandToTileIndexArray(players[0].hand);
        shuffle = shuffleArray(shuffle);

        this.setState({
            selected: -1,
            preview: null,
            review: null,
            whyOpen: false,
            players: players,
            tilePool: tilePool,
            history: [new HistoryData(new LocalizedMessage("trainer.start", { hand: convertHandToTenhouString(players[0].hand) }))],
            discardCount: 0,
            dora: dora,
            lastDraw: shuffle.pop(),
            isComplete: false,
            currentTime: this.state.settings.time,
            currentBonus: this.state.settings.extraTime
        });

        if (this.state.settings.useTimer) {
            this.timer = setTimeout(
                () => {
                    this.onTileClicked({ target: { name: this.state.lastDraw } });
                    this.setState({

                        currentBonus: 0
                    });
                },
                (this.state.settings.time + this.state.settings.extraTime) * 1000
            );
            this.timerUpdate = setInterval(this.updateTime, 100);
        }
    }

    /**
     * 
     * @param {Player} player The player who is discarding.
     * @param {Player[]} players The players in the game.
     * @returns {TileIndex} The tile the player discarded.
     */
    discardMostEfficientTile(player, players) {
        let ukeire = calculateDiscardUkeire(player.hand, this.getTilesHiddenFromPlayer(player, players), calculateMinimumShanten);
        let bestTile = evaluateBestDiscard(ukeire);
        player.discardTile(bestTile);
        return bestTile;
    }

    /**
     * Discards the safest tile from the player's hand and returns it.
     * @param {Player} player The player who is discarding.
     * @param {Player[]} players The players in the game.
     * @returns {TileIndex} The tile the player discarded.
     */
    discardSafestTile(player, players) {
        let averageSafety = this.getAverageSafety(player, players);
        let bestSafety = Math.max(...averageSafety);
        let bestChoice = averageSafety.indexOf(bestSafety);

        player.discardTile(bestChoice);
        return bestChoice;
    }

    /**
     * Draws tiles until the player's hand has 14 tiles.
     * @param {Player} player The player to draw tiles.
     * @param {TileIndex[]} tilePool The tiles in the wall.
     */
    drawTilesToFourteen(player, tilePool) {
        let tilesInHand = player.hand.reduce((a, b) => a + b, 0);
        for (let i = tilesInHand; i <= 14; i++) {
            player.hand[removeRandomItem(tilePool)]++;
        }
    }

    /**
     * Counts how many of each tile a player can't see.
     * @param {Player} player The player to view from.
     * @param {Player[]} players The players in the game.
     * @returns {TileCounts} The number of each tile that can't be seen by the player.
     */
    getTilesHiddenFromPlayer(player, players) {
        let visibleTiles = ALL_TILES_REMAINING.slice();

        for (let i = 0; i < player.hand.length; i++) {
            visibleTiles[i] -= player.hand[i];
        }

        for (let p = 0; p < players.length; p++) {
            for (let i = 0; i < players[p].discards.length; i++) {
                visibleTiles[players[p].discards[i]]--;
            }
        }

        return visibleTiles;
    }

    /**
     * Calculates the average safety for each tile in the given player's hand.
     * @param {Player} player The player with the hand to check.
     * @param {Player[]} players The players in the game.
     * @returns {number[]} The average safety for each tile in the hand.
     */
    getAverageSafety(player, players) {
        let totalSafety = Array(38).fill(0);
        let riichis = 0;

        for (let i = 0; i < players.length; i++) {
            if (players[i].isInRiichi()) {
                riichis++;

                let safety = evaluateDiscardSafety(
                    player.hand,
                    players[i].discards,
                    this.getTilesHiddenFromPlayer(player, players),
                    players[i].discardsAfterRiichi,
                    players[i].riichiTile
                );

                for (let j = 0; j < totalSafety.length; j++) {
                    totalSafety[j] += safety[j];
                }
            }
        }

        return totalSafety.map((x) => x / riichis);
    }

    /**
     * Brings the player's hand to tenpai after some useless turns.
     * @param {Player} player 
     * @param {TileIndex[]} tilePool 
     * @param {TileCounts} remainingTiles 
     */
    finishHand(player, tilePool, remainingTiles) {
        let shanten = calculateMinimumShanten(player.hand);
        // We do this manually instead of using the function because we care about the ukeire counts.
        let ukeire = calculateDiscardUkeire(player.hand, remainingTiles, calculateMinimumShanten, shanten);
        let bestTile = evaluateBestDiscard(ukeire);
        let uselessTurns = this.state.settings.minimumTurnsBeforeRiichi + randomInt(5);
        let drawnTile = 0;
        player.discardTile(bestTile);

        for (let i = 0; i <= uselessTurns - shanten; i++) {
            // Draw a useless tile.
            while (true) {
                drawnTile = removeRandomItem(tilePool);

                if (ukeire[bestTile].tiles.includes(drawnTile)) {
                    tilePool.push(drawnTile);
                } else {
                    break;
                }
            }

            remainingTiles[drawnTile]--;
            player.hand[drawnTile]++;

            ukeire = calculateDiscardUkeire(player.hand, remainingTiles, calculateMinimumShanten, shanten);
            bestTile = evaluateBestDiscard(ukeire);
            player.discardTile(bestTile);
        }

        while (shanten > 0) {
            while (true) {
                drawnTile = getRandomItem(ukeire[bestTile].tiles);

                if (tilePool.includes(drawnTile)) {
                    break;
                }
            }

            remainingTiles[drawnTile]--;
            player.hand[drawnTile]++;

            shanten = calculateMinimumShanten(player.hand);

            if (shanten === 0) player.riichiTile = -2;

            ukeire = calculateDiscardUkeire(player.hand, remainingTiles, calculateMinimumShanten, shanten);
            bestTile = evaluateBestDiscard(ukeire);
            player.discardTile(bestTile);
        }

        return {
            player: player,
            tilePool: convertHandToTileIndexArray(remainingTiles),
            remainingTiles: remainingTiles
        }
    }

    onTileClicked(event) {
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }

        let { t } = this.props;
        let isComplete = this.state.isComplete;
        if (isComplete) return;

        let chosenTile = parseInt(event.target.name);
        let players = this.state.players.slice();
        let averageSafety = this.getAverageSafety(players[0], players);

        // Safety of every distinct tile in the hand, for the review bars
        let reviewRows = [];
        for (let i = 0; i < players[0].hand.length; i++) {
            if (players[0].hand[i] > 0) reviewRows.push({ tile: i, value: averageSafety[i] });
        }
        reviewRows.sort((a, b) => b.value - a.value);

        players[0].discardTile(chosenTile);
        this.tileDiscardedAfterRiichi(chosenTile, players);

        let tilePool = this.state.tilePool.slice();

        for (let i = 1; i < players.length; i++) {
            if (tilePool.length === 0) break;

            let discard = -1;

            if (players[i].isInRiichi()) {
                discard = removeRandomItem(tilePool);
                players[i].discards.push(discard);
            } else {
                this.drawTilesToFourteen(players[i], tilePool);
                discard = this.discardSafestTile(players[i], players, tilePool);
            }

            this.tileDiscardedAfterRiichi(discard, players);
        }

        let draw = -1;
        let history = this.state.history.slice();

        if (tilePool.length === 0) {
            isComplete = true;
            let hands = new LocalizedMessageChain();
            hands.appendLocalizedMessage("defense.finalHands");
            for (let i = 0; i < players.length; i++) {
                hands.appendLineBreak();
                hands.appendLocalizedMessage("defense.hand", {
                    player: t(players[i].name),
                    hand: convertHandToTenhouString(players[i].hand)
                });
            }
            history.unshift(new HistoryData(hands));
        } else {
            draw = removeRandomItem(tilePool);
            players[0].hand[draw]++;

            if (this.state.settings.useTimer) {
                this.timer = setTimeout(
                    () => {
                        this.onTileClicked({ target: { name: this.state.lastDraw } });
                        this.setState({
                            currentBonus: 0
                        });
                    },
                    (this.state.settings.time + this.state.currentBonus) * 1000
                );
                this.timerUpdate = setInterval(this.updateTime, 100);
            }
        }

        let bestSafety = Math.max(...averageSafety);
        let bestTile = averageSafety.indexOf(bestSafety);

        let safetyEntry = new SafetyHistoryData(
            chosenTile,
            averageSafety[chosenTile],
            bestTile,
            bestSafety,
            draw
        );
        history.unshift(safetyEntry);

        let wasBest = averageSafety[chosenTile] === bestSafety;

        if (this.state.mode === 'quick') {
            if (this.lastToast) dismissToast(this.lastToast);
            this.lastToast = showToast(wasBest
                ? { type: 'success', duration: 1600, message: t('defense.quickOk', { rating: Math.floor(averageSafety[chosenTile] * 10) / 10 }) }
                : { type: 'warning', duration: 2600, message: t('defense.quickMiss', { tile: getTileAsText(t, bestTile, false), best: Math.floor(bestSafety * 10) / 10, rating: Math.floor(averageSafety[chosenTile] * 10) / 10 }) });
        }

        this.setState({
            players: players,
            tilePool: tilePool,
            discardCount: this.state.discardCount + 1,
            lastDraw: draw,
            history: history,
            isComplete: isComplete,
            currentTime: this.state.settings.time,
            selected: -1,
            preview: null,
            whyOpen: false,
            review: { rows: reviewRows, chosen: chosenTile, best: bestTile, data: safetyEntry },
            streak: wasBest ? this.state.streak + 1 : 0,
        });
    }

    /** Tap on a tile: select it in confirm mode (second tap confirms), discard at once in quick mode. */
    onTileSelected(event) {
        if (this.state.isComplete) return;

        let tile = parseInt(event.target.name);

        if (this.state.mode === 'quick' || this.state.selected === tile) {
            this.onTileClicked(event);
            return;
        }

        let players = this.state.players;
        let averageSafety = this.getAverageSafety(players[0], players);

        this.setState({
            selected: tile,
            preview: { rating: averageSafety[tile] },
            review: null,
        });
    }

    onDiscardSelected() {
        if (this.state.selected > -1) this.onTileClicked({ target: { name: this.state.selected } });
    }

    setMode(mode) {
        setTrainerMode(mode);
        this.setState({ mode: mode, selected: -1, preview: null });
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

    /**
     * Adds the given tile to the "discardsAfterRiichi" of each riichi'd player.
     * @param {TileIndex} tile The tile discarded.
     * @param {Player[]} players The players in the game.
     */
    tileDiscardedAfterRiichi(tile, players) {
        for (let i = 1; i < players.length; i++) {
            if (players[i].isInRiichi()) {
                players[i].discardsAfterRiichi.push(tile);
            }
        }
    }

    toggleChart() {
        this.setState({
            chartCollapsed: !this.state.chartCollapsed
        });
    }

    render() {
        let { t } = this.props;

        let safetyRatings = SAFETY_RATING_EXPLANATIONS.map((explanation, index) => {
            if (index === 0) return null;
            return <li key={index}>{t("defense.safetyRating", { rating: index, explanation: t(explanation) })}</li>
        }).reverse();

        let quick = this.state.mode === 'quick';
        let ready = this.state.players.length > 0;
        let preview = this.state.preview;
        let review = this.state.review;

        return (
            <div className="rt-page rt-trainer">
                <DefenseSettings
                    onChange={this.onSettingsChanged}
                    open={this.state.settingsOpen}
                    onClose={() => this.setState({ settingsOpen: false })}
                    header={<ModeSwitch mode={this.state.mode} onChange={this.setMode} />}
                />

                {ready && (quick || this.state.settings.useTimer) ? (
                    <div className="rt-chips">
                        {quick ? <span className="rt-chip"><span className="rt-chip__label">{t("play.streak")}</span> <b className="rt-num">{this.state.streak}</b></span> : null}
                        {this.state.settings.useTimer ? <span className="rt-chip rt-num">{this.state.currentTime.toFixed(1)} + {this.state.currentBonus.toFixed(1)}</span> : null}
                    </div>
                ) : null}

                {ready ? (
                    <div className="rt-trainer__hint">
                        <p className="rt-instructions">{quick ? t("defense.instructions") : t("defense.instructionsConfirm")}</p>
                        <Button size="sm" variant="secondary" icon="sliders" onClick={() => this.setState({ settingsOpen: true })}>{t("settings.buttonLabel")}</Button>
                    </div>
                ) : null}

                {preview ? (
                    <section className="rt-peek" aria-live="polite">
                        <div className="rt-peek__head">
                            <Icon name="shield" size={18} />
                            <strong className="rt-num">{t("defense.safetyRating", { rating: Math.floor(preview.rating * 10) / 10, explanation: t(SAFETY_RATING_EXPLANATIONS[Math.floor(preview.rating)]) })}</strong>
                        </div>
                    </section>
                ) : review && !quick ? (
                    <ReviewPanel
                        rows={review.rows}
                        chosen={review.chosen}
                        best={review.best}
                        maxValue={SAFETY_RATING_EXPLANATIONS.length - 1}
                        format={(value) => String(Math.floor(value * 10) / 10)}
                        lines={review.data.getMessage(t, true, true, false).split("<br/>")}
                        whyOpen={this.state.whyOpen}
                        onToggleWhy={() => this.setState({ whyOpen: !this.state.whyOpen })}
                        onNext={() => this.setState({ review: null, whyOpen: false })}
                    />
                ) : null}

                {ready ? <DiscardTable players={this.state.players} discardCount={this.state.discardCount} wallCount={this.state.tilePool && this.state.tilePool.length} showIndexes={this.state.settings.showIndexes} /> : null}

                <div className="rt-actions">
                    <Button variant={this.state.isComplete ? "success" : "accent"} icon="refresh" onClick={() => this.onNewHand()}>{t("trainer.newHandButtonLabel")}</Button>
                </div>

                <Collapsible title={t("defense.safetyRatings")} icon="shield" open={!this.state.chartCollapsed} onToggle={() => this.toggleChart()}>
                    <p className="rt-muted">{t("defense.averagedSafetyRating")}</p>
                    <ul className="rt-lines">
                        {safetyRatings}
                    </ul>
                </Collapsible>
                {ready ? <History history={this.state.history} concise={true} verbose={this.state.settings.verbose} spoilers={this.state.settings.spoilers} /> : null}

                {ready ? (
                    <Dock>
                        {!quick ? (
                            <Button
                                variant="accent"
                                block
                                disabled={this.state.selected < 0 || this.state.isComplete}
                                onClick={this.onDiscardSelected}
                            >{t("play.discard")}</Button>
                        ) : null}
                        <Hand tiles={this.state.players[0].hand}
                            lastDraw={this.state.lastDraw}
                            onTileClick={this.onTileSelected}
                            selected={this.state.selected > -1 ? this.state.selected : undefined}
                            showIndexes={this.state.settings.showIndexes} />
                    </Dock>
                ) : null}
            </div>
        );
    }
}
export default withTranslation()(DefenseState);