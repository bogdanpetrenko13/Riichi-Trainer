import React from 'react';
import {
    Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
    Row, ListGroup, ListGroupItem, Input
} from '../components/ui/legacy';
import { Button, Card, Collapsible, Icon } from '../components/ui';
import * as ParseTenhouReplay from '../scripts/ParseTenhouReplay';
import * as ParseMajsoulReplay from '../scripts/ParseMajsoulReplay';
import Hand from '../components/Hand';
import { convertIndexesToTenhouTiles, convertTilesToAsciiSymbols } from '../scripts/TileConversions';
import { convertHandToTenhouString } from '../scripts/HandConversions';
import { withTranslation } from '../i18n';

class ReplayAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileName: "",
            text: "",
            rounds: [],
            roundDropdownOpen: false,
            playerDropdownOpen: false,
            player: 0,
            currentRound: -1,
            turns: [],
            URLfeedback: "",
            currentTurn: 0,
            tenhou: true,
        }

        this.onURLChanged = this.onURLChanged.bind(this);
        this.onFileChanged = this.onFileChanged.bind(this);
        this.onFileLoaded = this.onFileLoaded.bind(this);
        this.toggleRoundDropdown = this.toggleRoundDropdown.bind(this);
        this.togglePlayerDropdown = this.togglePlayerDropdown.bind(this);
    }

    onURLChanged() {
        let URLfeedback = <div />
        let { t } = this.props;
        if (document.getElementById('tenhouURL')) {
            let URL = document.getElementById('tenhouURL').value;
            if (URL !== "") {
                let tenhouRegex = /\/\?log=(.+?)&tw/;
                let majsoulRegex = /\/\?paipu=(.+)/;
                let match = tenhouRegex.exec(URL);

                if (match) {
                    URLfeedback = <a href={`https://tenhou.net/0/log/?${match[1]}`} target="_blank" rel="noopener noreferrer">{t("analyzer.downloadInstructions")}</a>;
                } else {
                    match = majsoulRegex.exec(URL);

                    if (match) {
                        let uuid = match[1].split("_")[0];
                        URLfeedback = <a href={`https://mjusgs.mahjongsoul.com:2882/majsoul/game_record/${uuid}`} target="_blank" rel="noopener noreferrer">{t("analyzer.downloadInstructions")}</a>;
                    } else {
                        URLfeedback = <div>{t("analyzer.invalidURL")}</div>;
                    }
                }
            }
        }

        this.setState({
            URLfeedback: URLfeedback
        });
    }

    onFileChanged(files) {
        let file = document.getElementById("fileInput").files[0];

        let player = 0;
        let playerRegex = /tw=(\d{1})/;
        let match = playerRegex.exec(file.name);
        if (match) {
            player = parseInt(match[1]);
        }

        this.setState({
            fileName: file.name,
            player: player,
        });

        let reader = new FileReader();
        reader.onload = this.onFileLoaded;
        reader.readAsText(file);
    }

    onFileLoaded(e) {
        let replayText = e.target.result.trim();
        let tenhou = replayText.charAt(0) === "<";
        let rounds;

        if (tenhou) {
            rounds = ParseTenhouReplay.parseRounds(replayText);
        } else {
            rounds = ParseMajsoulReplay.parseRounds(replayText);
        }

        this.setState({
            tenhou: tenhou,
            text: e.target.result,
            rounds: rounds
        });
    }

    toggleRoundDropdown() {
        this.setState({
            roundDropdownOpen: !this.state.roundDropdownOpen
        });
    }

    togglePlayerDropdown() {
        this.setState({
            playerDropdownOpen: !this.state.playerDropdownOpen
        });
    }

    onRoundChoice(index) {
        let { t } = this.props;

        let turns;

        if (this.state.tenhou) {
            turns = ParseTenhouReplay.parseRound(t, this.state.rounds[index], this.state.player);
        } else {
            turns = ParseMajsoulReplay.parseRound(t, this.state.rounds[index], this.state.player);
        }

        this.setState({
            turns: turns,
            currentRound: index,
            currentTurn: 0,
        });
    }

    onPlayerChoice(index) {
        let currentRound = Math.max(0, this.state.currentRound);
        let { t } = this.props;

        let turns;

        if (this.state.tenhou) {
            turns = ParseTenhouReplay.parseRound(t, this.state.rounds[currentRound], index);
        } else {
            turns = ParseMajsoulReplay.parseRound(t, this.state.rounds[currentRound], index);
        }

        this.setState({
            turns: turns,
            player: index,
            currentTurn: 0,
            currentRound: currentRound,
        });
    }

    parseRound() {
        let { t } = this.props;

        let turns;

        if (this.state.tenhou) {
            turns = ParseTenhouReplay.parseRound(t, this.state.rounds[this.state.currentRound], this.state.player);
        } else {
            turns = ParseMajsoulReplay.parseRound(t, this.state.rounds[this.state.currentRound], this.state.player);
        }

        this.setState({
            turns: turns
        });
    }

    onNextTurn() {
        if (this.state.currentTurn < this.state.turns.length - 1) {
            this.setState({ currentTurn: this.state.currentTurn + 1 });
        }
    }

    onPreviousTurn() {
        if (this.state.currentTurn > 0) {
            this.setState({ currentTurn: this.state.currentTurn - 1 });
        }
    }

    onNextIssue() {
        if (this.state.currentTurn >= this.state.turns.length - 1) return;
        let currentTurn = this.state.currentTurn;

        while (currentTurn < this.state.turns.length - 1) {
            currentTurn++;

            if (this.state.turns[currentTurn].className !== "bg-success text-white") {
                break;
            }
        }

        this.setState({ currentTurn: currentTurn });
    }

    render() {
        let roundItems;
        let playerItems;
        let { t } = this.props;

        let roundNames;
        if (this.state.tenhou) {
            roundNames = ParseTenhouReplay.parseRoundNames(this.state.rounds);
        } else {
            roundNames = ParseMajsoulReplay.parseRoundNames(this.state.rounds);
        }

        if (this.state.rounds.length) {
            roundItems = roundNames.map((roundName, index) => {
                return <DropdownItem key={index} disabled={index === this.state.currentRound} onClick={() => this.onRoundChoice(index)}>{roundName.generateString(t)}</DropdownItem>;
            });

            let playerNames;

            if (this.state.tenhou) {
                playerNames = ParseTenhouReplay.parsePlayers(t, this.state.text);
            } else {
                playerNames = ParseMajsoulReplay.parsePlayers(t, this.state.text);
            }

            playerItems = playerNames.map((player, index) => {
                return <DropdownItem key={index} disabled={index === this.state.player} onClick={() => this.onPlayerChoice(index)}>{index}: {player}</DropdownItem>
            });
        }

        let message = <ListGroupItem />;
        let currentTurn = this.state.turns[this.state.currentTurn];

        if (this.state.turns.length) {
            let messageArray = currentTurn.message.generateString(t).split("<br/>");
            message = <ListGroupItem className={currentTurn.className}>{messageArray.map((row, rowIndex) => <Row key={rowIndex}>{row}</Row>)}</ListGroupItem>;
        }

        let calls = "";

        for (let i = 0; currentTurn && i < currentTurn.calls.length; i++) {
            if (calls) calls += t("analyzer.callsSeparator");
            calls += `${convertTilesToAsciiSymbols(currentTurn.calls[i])} (${convertIndexesToTenhouTiles(currentTurn.calls[i])})`;
        }

        return (
            <div className="rt-page">
                <div className="rt-stack">
                        <Input id="tenhouURL" aria-label={t("analyzer.URLplaceholder")} placeholder={t("analyzer.URLplaceholder")} onChange={this.onURLChanged} autoCapitalize="off" autoCorrect="off" spellCheck="false" />
                        {this.state.URLfeedback ? <p className="rt-feedback" role="status">{this.state.URLfeedback}</p> : null}
                        <label className="rt-file">
                            <Icon name="download" size={20} />
                            <span>{t("analyzer.chooseFile")}</span>
                            <span className="rt-file__name">{this.state.fileName || ""}</span>
                            <input type="file" id="fileInput" aria-label="mjlog / xml" onChange={this.onFileChanged} />
                        </label>
                        {this.state.rounds.length ? (
                            <div className="rt-pair">
                                <Dropdown isOpen={this.state.roundDropdownOpen} toggle={this.toggleRoundDropdown}>
                                    <DropdownToggle caret>
                                        {t("analyzer.roundSelect")}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {roundItems}
                                    </DropdownMenu>
                                </Dropdown>
                                <Dropdown isOpen={this.state.playerDropdownOpen} toggle={this.togglePlayerDropdown}>
                                    <DropdownToggle caret>
                                        {t("analyzer.playerSelect")}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {playerItems}
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                        ) : null}
                </div>
                {this.state.turns.length ? (
                    <React.Fragment>
                        <section className="rt-board">
                            <Hand tiles={currentTurn.hand} lastDraw={currentTurn.draw} />
                        </section>
                        <div className="rt-steps">
                            <Button variant="primary" icon="chevronLeft" disabled={this.state.currentTurn <= 0} onClick={() => this.onPreviousTurn()}>{t("analyzer.previousTurn")}</Button>
                            <Button variant="primary" iconRight="chevronRight" disabled={this.state.currentTurn >= this.state.turns.length - 1} onClick={() => this.onNextTurn()}>{t("analyzer.nextTurn")}</Button>
                            <Button variant="accent" iconRight="chevronRight" disabled={this.state.currentTurn >= this.state.turns.length - 1} onClick={() => this.onNextIssue()}>{t("analyzer.nextIssue")}</Button>
                        </div>
                        <ListGroup>
                            <ListGroupItem>
                                <Row>{t("analyzer.turn", { round: roundNames[this.state.currentRound].generateString(t), turn: this.state.currentTurn + 1 })}</Row>
                                <Row>{currentTurn.discards.length ? t("analyzer.discards", { symbols: convertTilesToAsciiSymbols(currentTurn.discards), tiles: convertIndexesToTenhouTiles(currentTurn.discards) }) : ""}</Row>
                                <Row>{calls.length > 0 ? t("analyzer.calls", { calls: calls }) : ""}</Row>
                            </ListGroupItem>
                            {message}
                            <ListGroupItem>
                                <a className="tenhouLink" href={"http://tenhou.net/2/?q=" + convertHandToTenhouString(currentTurn.hand)} target="_blank" rel="noopener noreferrer">
                                    {t("analyzer.tenhouLinkText")}
                                </a>
                            </ListGroupItem>
                        </ListGroup>
                    </React.Fragment>
                ) : null}
                <Collapsible title={t("analyzer.instructions1")} icon="help">
                    <ol className="rt-prose">
                        {[2, 3, 4, 5, 6, 7, 8, 9].map((n) => <li key={n}>{t("analyzer.instructions" + n)}</li>)}
                    </ol>
                </Collapsible>
            </div>
        );
    }
}

export default withTranslation()(ReplayAnalysis);
