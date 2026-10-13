import React from 'react';
import { Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { Button } from './ui';
import { withTranslation } from 'react-i18next';
import { characterToSuit } from '../scripts/Utils';

class LoadButton extends React.Component {
    onClick() {
        let string = document.getElementById("loadHandString").value;
        let characters = string.toLowerCase();
        let hand = Array(38).fill(0);
        let index = 0;
        let offset = -1;
        let tiles = 0;

        let draw = this.tryRegex(/(\d{1,2})t/, characters);
        let dora = this.tryRegex(/(\d{1,2})d/, characters);
        let seatWind = this.tryRegex(/(\d)j/, characters);
        let roundWind = this.tryRegex(/(\d)[br]/, characters);

        characters = characters.split('').reverse();
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
                        if (draw === false) draw = tile;
                    }
                }
                else if (tile === 0) {
                    tile += offset;

                    if (tile !== 30 && hand[tile] + hand[tile + 5] < 4) {
                        hand[tile]++;
                        tiles++;
                        if (draw === false) draw = tile;
                    }
                }

                index++;
            }
        }

        let ret = {
            hand,
            tiles,
            draw,
            dora,
            seatWind,
            roundWind
        };

        this.props.callback(ret);
    }

    tryRegex(regex, string) {
        let match = regex.exec(string);

        if (match) {
            return parseInt(match[1]);
        }

        return false;
    }

    render() {
        let { t } = this.props;
        return (
            <div className="rt-load">
                <InputGroup>
                    <Input id="loadHandString" placeholder="123m456p789s12345z" aria-label={t("trainer.loadButtonLabel")} autoCapitalize="off" autoCorrect="off" spellCheck="false" />
                    <InputGroupAddon addonType="append">
                        <Button variant="primary" icon="download" onClick={() => this.onClick()}>{t("trainer.loadButtonLabel")}</Button>
                    </InputGroupAddon>
                </InputGroup>
            </div>
        )
    }
}

export default withTranslation()(LoadButton);