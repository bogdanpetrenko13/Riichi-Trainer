import React from 'react';
import ScoreInput from './ScoreInput';
import { PLACEMENTS } from '../../Constants';
import { useTranslation } from '../../i18n';

function GyakutenQuestion(props) {
    let { t } = useTranslation();

    let question = t("allLast.question", {
        action: props.tsumo ? t("allLast.tsumo") : t("allLast.ron", { target: t(PLACEMENTS[props.ronTarget]) }),
        placement: t(PLACEMENTS[props.placementTarget])
    });

    for (let i = 1; i < props.riichis.length; i++) {
        if (props.riichis[i] > 0) {
            question = t("allLast.riichiQuestion", {
                player: t(PLACEMENTS[i]),
                action: props.tsumo ? t("allLast.tsumo") : t("allLast.ron", { target: t(PLACEMENTS[props.ronTarget]) }),
                placement: t(PLACEMENTS[props.placementTarget])
            });
            break;
        }
    }

    return (
        <div className="rt-question">
            <p className="rt-question__text">{question}</p>
            <ScoreInput
                onScoreSubmit={props.onScoreSubmit}
                tsumo={props.tsumo}
                ronTarget={props.ronTarget}
                placementTarget={props.placementTarget}
                index={props.index}
                riichis={props.riichis}
                maxFu={props.maxFu}
            />
            {props.messages[props.index] ? props.messages[props.index].generateJSX(t, props.showDifferences) : ""}
        </div>
    );
}

export default GyakutenQuestion;