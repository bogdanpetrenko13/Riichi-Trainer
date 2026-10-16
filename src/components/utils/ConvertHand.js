import React from 'react';
import { Input, InputGroup, InputGroupAddon } from '../ui/legacy';
import { Button, Card } from '../ui';
import { convertHandToAsciiSymbols, convertHandToDiscordEmoji } from '../../scripts/HandConversions';
import { withTranslation } from '../../i18n';
import { characterToSuit } from '../../scripts/Utils';

class ConvertHand extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hand: [0, 1]
        }
    }

    onClick() {
        let string = document.getElementById("convertHandString").value;
        let characters = string.toLowerCase().split('').reverse();
        let hand = Array(38).fill(0);
        let index = 0;
        let offset = -1;
        let tiles = 0;

        while (index < characters.length && tiles < 14) {
            do {
                offset = characterToSuit(characters[index]);
                index++;
            } while (offset === -1 && index < characters.length);

            while (!isNaN(characters[index]) && index < characters.length && tiles < 14) {
                let tile = parseInt(characters[index]);

                if (tile > 0) {
                    tile += offset;

                    if (hand[tile] < 4) {
                        hand[tile]++;
                        tiles++;
                    }
                }
                else if (tile === 0) {
                    tile += offset;

                    if (tile !== 30 && hand[tile] + hand[tile + 5] < 4) {
                        hand[tile]++;
                        tiles++;
                    }
                }

                index++;
            }
        }

        this.setState({
            hand: hand
        });
    }

    render() {
        let { t } = this.props;
        return (
            <Card title={t("utils.convertHeader")} icon="wrench">
                <div className="rt-stack">
                    <InputGroup>
                        <Input id="convertHandString" aria-label={t("utils.convertButtonLabel")} placeholder="123m456p789s12345z" autoCapitalize="off" autoCorrect="off" spellCheck="false" />
                        <InputGroupAddon addonType="append">
                            <Button variant="primary" icon="refresh" onClick={() => this.onClick()}>{t("utils.convertButtonLabel")}</Button>
                        </InputGroupAddon>
                    </InputGroup>
                    <ul className="rt-lines">
                        <li>{t("utils.ascii")} {convertHandToAsciiSymbols(this.state.hand)}</li>
                        <li>{t("utils.emoji")} {convertHandToDiscordEmoji(this.state.hand)}</li>
                    </ul>
                </div>
            </Card>
        )
    }
}

export default withTranslation()(ConvertHand);