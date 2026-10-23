import { calculateBasicPoints } from './ScoreCalculation';

/**
 * Счётчик очков: фу и выплаты.
 * Правила: стандартный риичи (Тенхо / Маджонг Соул): двойной ветер в паре даёт 4 фу,
 * кириагэ-манган (4 хана 30 фу, 3 хана 60 фу) включается отдельно.
 */

/** Фу за сет: [на руке (закрытый), из сброса (открытый)] */
export const MELD_FU = {
    simpleTriplet: [4, 2],
    terminalTriplet: [8, 4],
    simpleKan: [16, 8],
    terminalKan: [32, 16],
};

export const WAITS = ['ryanmen', 'kanchan', 'penchan', 'tanki', 'shanpon'];

export function emptyMelds() {
    return { simpleTriplet: [0, 0], terminalTriplet: [0, 0], simpleKan: [0, 0], terminalKan: [0, 0] };
}

/**
 * Считает фу.
 * input: { winType: 'ron'|'tsumo', open, pinfu, chiitoitsu, melds, pair: 0|2|4, wait }
 * Возвращает { fu, parts } — parts описывает вклад каждой строки (для разбора).
 */
export function calculateFu(input) {
    const { winType, open = false, pinfu = false, chiitoitsu = false, melds = emptyMelds(), pair = 0, wait = 'ryanmen' } = input;

    if (chiitoitsu && !open) return { fu: 25, parts: [{ key: 'chiitoitsu', fu: 25 }] };
    if (pinfu && !open) {
        const fu = winType === 'ron' ? 30 : 20;
        return { fu, parts: [{ key: winType === 'ron' ? 'pinfuRon' : 'pinfuTsumo', fu }] };
    }

    const parts = [{ key: 'base', fu: 20 }];
    if (winType === 'ron' && !open) parts.push({ key: 'closedRon', fu: 10 });
    if (winType === 'tsumo') parts.push({ key: 'tsumo', fu: 2 });
    Object.keys(MELD_FU).forEach((kind) => {
        [0, 1].forEach((index) => {
            const count = (melds[kind] && melds[kind][index]) || 0;
            if (count > 0) parts.push({ key: kind, closed: index === 0, count, fu: MELD_FU[kind][index] * count });
        });
    });
    if (pair > 0) parts.push({ key: pair === 4 ? 'doubleWindPair' : 'yakuhaiPair', fu: pair });
    if (wait === 'kanchan' || wait === 'penchan' || wait === 'tanki') parts.push({ key: 'wait', fu: 2 });

    let fu = Math.ceil(parts.reduce((sum, part) => sum + part.fu, 0) / 10) * 10;
    if (open && fu < 30) fu = 30;
    return { fu, parts };
}

const roundUp = (x) => Math.ceil(x / 100) * 100;

/** Название лимита: null | mangan | haneman | baiman | sanbaiman | kazoe | yakuman */
export function limitName(han, fu, yakuman, kiriage) {
    if (yakuman > 0) return 'yakuman';
    if (han <= 0) return null;
    if (han >= 13) return 'kazoe';
    if (han >= 11) return 'sanbaiman';
    if (han >= 8) return 'baiman';
    if (han >= 6) return 'haneman';
    if (han >= 5) return 'mangan';
    if (fu * Math.pow(2, han + 2) >= 2000) return 'mangan';
    if (kiriage && ((han === 4 && fu === 30) || (han === 3 && fu === 60))) return 'mangan';
    return null;
}

/**
 * Выплаты.
 * Возвращает { base, limit, ron, fromDealer, fromOthers, total }:
 *   рон — ron; цумо — fromDealer (платит дилер; для дилера-победителя платят все по fromDealer) и fromOthers.
 */
export function calculatePayment({ han, fu, dealer = false, tsumo = false, kiriage = false, yakuman = 0 }) {
    const limit = limitName(han, fu, yakuman, kiriage);
    if (yakuman <= 0 && han <= 0) return { base: 0, limit: null, ron: 0, fromDealer: 0, fromOthers: 0, total: 0 };

    let base = calculateBasicPoints(han, fu, yakuman);
    if (limit === 'mangan' && base < 2000) base = 2000;

    if (!tsumo) {
        const ron = roundUp(base * (dealer ? 6 : 4));
        return { base, limit, ron, fromDealer: 0, fromOthers: 0, total: ron };
    }
    if (dealer) {
        const each = roundUp(base * 2);
        return { base, limit, ron: 0, fromDealer: each, fromOthers: each, total: each * 3 };
    }
    const fromDealer = roundUp(base * 2);
    const fromOthers = roundUp(base);
    return { base, limit, ron: 0, fromDealer, fromOthers, total: fromDealer + fromOthers * 2 };
}
