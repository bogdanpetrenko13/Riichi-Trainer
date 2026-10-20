/**
 * Builds a short explanation of a discard, for the review panel.
 * Returns { key, params, lost, gained }: a translation key under `play.insight.*`,
 * its parameters, and tiles worth showing (accepted by the best discard only / by yours only).
 */
export function explainUkeire(chosen, best, chosenTile, bestTile) {
    const sameTile = chosenTile === bestTile;

    if (sameTile || chosen.value === best.value) {
        return { key: sameTile ? 'optimal' : 'equal', params: { count: chosen.value, best: best.value }, lost: [], gained: [] };
    }

    if (chosen.value === 0) {
        // No tile improves the hand after this discard: the discard gives up progress
        return { key: 'stalls', params: { count: chosen.value, best: best.value }, lost: best.tiles.slice(), gained: [] };
    }

    const lost = best.tiles.filter((tile) => !chosen.tiles.includes(tile));
    const gained = chosen.tiles.filter((tile) => !best.tiles.includes(tile));
    const diff = best.value - chosen.value;
    const small = diff / best.value <= 0.1;

    return {
        key: small ? 'close' : 'fewer',
        params: { count: chosen.value, best: best.value, diff: diff },
        lost: lost,
        gained: gained
    };
}

/**
 * Explanation for a defence choice, comparing average safety ratings.
 */
export function explainSafety(chosenRating, bestRating, chosenTile, bestTile) {
    if (chosenTile === bestTile || chosenRating === bestRating) {
        return { key: chosenTile === bestTile ? 'safeOptimal' : 'safeEqual', params: {}, lost: [], gained: [] };
    }
    return { key: 'safeWorse', params: { gap: Math.floor((bestRating - chosenRating) * 10) / 10 }, lost: [], gained: [] };
}
