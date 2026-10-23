/**
 * Глоссарий терминов риичи-маджонга (проверенный).
 * Запись: [категория, японское написание, термин ru, определение ru, термин en, определение en, синонимы для поиска?]
 * Синонимы — варианты написания, которые ищут игроки (Тэмпай/Темпай и т. п.).
 */
export const GLOSSARY_CATEGORIES = ['general', 'hand', 'tiles', 'calls', 'waits', 'efficiency', 'yaku', 'yakuman', 'defense', 'score', 'strategy'];

const RAW = [
    // ---- Общие ----
    ['general', '立直', 'Риичи', 'Объявление готовой (темпай) закрытой руки со ставкой 1000 очков. Даёт яку (+1 хан) и право на ура-дору, но после него руку менять нельзя: только брать и сбрасывать тайл.', 'Riichi', 'Declaring a closed tenpai hand by betting 1,000 points. It is a yaku (+1 han) and earns ura-dora, but afterwards the hand is locked: you only draw and discard.', ['riichi', 'ричи']],
    ['general', '聴牌', 'Тэмпай', 'Состояние руки, когда до выигрыша не хватает одного тайла.', 'Tenpai', 'A hand that is one tile away from winning.', ['темпай', 'tenpai']],
    ['general', '向聴', 'Шантэн', 'Число тайлов, которых не хватает до темпая. 0 — темпай, −1 — готовая выигрышная рука (агари).', 'Shanten', 'The number of tiles a hand needs to reach tenpai. 0 is tenpai, −1 is a complete winning hand.', ['шантен', 'сянтэн', 'shanten']],
    ['general', '一向聴', 'Иишантэн', 'До темпая не хватает одного тайла (шантэн = 1).', 'Iishanten', 'One tile away from tenpai (shanten = 1).', ['ишантэн', 'иишантэн', 'iishanten', '1-shanten']],
    ['general', '二向聴', 'Рянсянтэн', 'Шантэн = 2: до темпая не хватает двух тайлов.', 'Ryanshanten', 'Shanten = 2: two tiles away from tenpai.', ['рянсантэн', 'ryanshanten', '2-shanten']],
    ['general', '和了', 'Агари', 'Победа в раздаче: рон или цумо.', 'Agari', 'Winning the hand, by ron or by tsumo.', ['agari']],
    ['general', '役', 'Яку', 'Комбинация, без которой выигрыш невозможен. Дора и фу — не яку; рука без яку выиграть не может.', 'Yaku', 'A scoring pattern required to win. Dora and fu are not yaku: a hand without a yaku cannot win.', ['yaku']],
    ['general', '振聴', 'Фуритэн', 'Запрет на рон: нельзя выиграть со сброса, если любой из ваших выигрышных тайлов уже есть в ваших сбросах. Временный фуритэн возникает, если вы пропустили выигрышный тайл (до вашего следующего сброса; после риичи — навсегда). Цумо остаётся возможным.', 'Furiten', 'You cannot win by ron if any of your winning tiles is in your own discards. Passing on a winning tile causes temporary furiten (until your next discard; permanent after riichi). Tsumo is still allowed.', ['фуритен', 'furiten']],
    ['general', 'ノーテン', 'Нотэн', 'Рука не в темпае. В конце раздачи без победы (рюкёку) нотэн-игроки платят штраф 3000 очков, делимый с темпай-игроками.', 'Noten', 'A hand that is not in tenpai. When a hand ends in an exhaustive draw, noten players pay a 3,000-point penalty split among tenpai players.', ['нотен', 'noten']],
    ['general', '流局', 'Рюкёку', 'Ничья: стена закончилась без победителя (или раздача прервана досрочно по правилам).', 'Ryuukyoku', 'A drawn hand: the wall runs out with no winner (or the hand is aborted by a rule).', ['рюкёку', 'ryukyoku', 'ничья']],
    ['general', '半荘', 'Ханчан', 'Полная игра: восточный и южный раунды (обычно 8+ раздач).', 'Hanchan', 'A full game: an East round followed by a South round (8+ hands).', ['hanchan']],
    ['general', '東風戦', 'Тонпу-сэн', 'Короткая игра: только восточный раунд.', 'Tonpuusen', 'A short game consisting of the East round only.', ['тонпу', 'tonpu']],
    ['general', 'オーラス', 'Орасу', 'Последняя раздача игры («all last»). Здесь итоговая расстановка очков решает всё, поэтому нужен точный счёт.', 'Orasu (all last)', 'The final hand of the game. Final standings are decided here, so exact scoring matters.', ['orasu', 'all last']],
    ['general', '連荘', 'Рэнчан', 'Дилер остаётся дилером: он выиграл или был в темпае при ничьей. Растёт счётчик хонба.', 'Renchan', 'The dealer keeps the seat after winning or being tenpai at a draw. The honba counter grows.', ['renchan']],
    ['general', '本場', 'Хонба', 'Счётчик повторов раздачи: каждая хонба добавляет победителю по 300 очков (по 100 с каждого проигравшего при цумо).', 'Honba', 'The repeat counter: each honba adds 300 points for the winner (100 from each payer on tsumo).', ['honba']],
    ['general', '供託', 'Кёутаку', 'Палочки риичи на столе (по 1000 очков). Достаются победителю раздачи.', 'Kyoutaku', 'Riichi sticks on the table (1,000 points each). They go to the next winner.', ['kyoutaku']],
    ['general', '飛び', 'Тоби', 'Банкротство: счёт игрока опустился ниже нуля. Во многих правилах игра на этом заканчивается.', 'Tobi', 'Bankruptcy: a player’s score drops below zero. In many rules the game ends there.', ['tobi']],
    ['general', '河', 'Кава', 'Река: ряд сбросов игрока перед ним. Её читают, чтобы понять руки соперников.', 'Kawa', 'The river: a player’s row of discards. It is read to deduce opponents’ hands.', ['река', 'kawa', 'discards']],
    ['general', '門前', 'Мэнзэн', 'Закрытая рука: ни одного чи, пона или открытого кана (закрытый кан не открывает руку).', 'Menzen', 'A closed hand: no chi, pon or open kan (a concealed kan keeps the hand closed).', ['менцзэн', 'menzen', 'закрытая']],

    // ---- Структура руки ----
    ['hand', '面子', 'Мэнцу', 'Готовый блок из трёх тайлов: сюнцу или коцу (кан тоже считается за один блок).', 'Mentsu', 'A completed set of three tiles: a shuntsu or a koutsu (a kan counts as one set too).', ['менцу', 'mentsu', 'set', 'meld']],
    ['hand', '順子', 'Сюнцу', 'Последовательность из трёх подряд идущих тайлов одной масти (например 3-4-5 пин). Из честных тайлов не бывает.', 'Shuntsu', 'A sequence of three consecutive tiles of one suit (e.g. 3-4-5 pin). Honors cannot form one.', ['шунцзу', 'шунцу', 'shuntsu', 'sequence', 'run']],
    ['hand', '刻子', 'Коцу', 'Тройка одинаковых тайлов.', 'Koutsu', 'Three identical tiles.', ['коцзу', 'koutsu', 'triplet']],
    ['hand', '雀頭', 'Дзянто', 'Пара («голова»), две одинаковые тайла, нужная для завершения руки.', 'Jantou', 'The pair (“head”): two identical tiles required to complete a hand.', ['дзанто', 'jantou', 'pair', 'глаза']],
    ['hand', '対子', 'Тоицу', 'Любая пара одинаковых тайлов на руке.', 'Toitsu', 'Any pair of identical tiles in the hand.', ['тойцу', 'toitsu']],
    ['hand', '搭子', 'Тацу', 'Заготовка сюнцу из двух тайлов (например 4-5 или 4-6), которой не хватает одного.', 'Taatsu', 'Two tiles that can become a sequence (e.g. 4-5 or 4-6) with one more tile.', ['taatsu', 'tatsu']],
    ['hand', '浮き牌', 'Укихай', 'Одиночный тайл без связей с остальными. Обычно первый кандидат на сброс.', 'Ukihai', 'An isolated tile with no connection to the rest of the hand, usually the first discard candidate.', ['ukihai', 'floating tile']],

    // ---- Тайлы ----
    ['tiles', '萬子', 'Манзу', 'Масть «иероглифы», тайлы 1–9 ман (M).', 'Manzu', 'The “characters” suit, tiles 1–9 man (M).', ['ман', 'manzu', 'man', 'characters']],
    ['tiles', '筒子', 'Пинзу', 'Масть «круги», тайлы 1–9 пин (P).', 'Pinzu', 'The “circles” suit, tiles 1–9 pin (P).', ['пин', 'pinzu', 'pin', 'circles']],
    ['tiles', '索子', 'Соузу', 'Масть «бамбук», тайлы 1–9 соу (S).', 'Souzu', 'The “bamboo” suit, tiles 1–9 sou (S).', ['соу', 'souzu', 'sou', 'bamboo']],
    ['tiles', '字牌', 'Дзихай', 'Честные тайлы: четыре ветра и три дракона. Сеты из них не образуют последовательностей.', 'Jihai', 'Honor tiles: four winds and three dragons. They never form sequences.', ['honors', 'jihai', 'почётные', 'благородные']],
    ['tiles', '老頭牌', 'Ророхай', 'Терминалы: тайлы 1 и 9 трёх мастей.', 'Rourouhai (terminals)', 'Terminal tiles: the 1s and 9s of the three suits.', ['терминал', 'terminal', 'routouhai']],
    ['tiles', '么九牌', 'Яочухай', 'Тайлы-сироты: терминалы и честные тайлы вместе (нужны для кокуси и чанты).', 'Yaochuuhai', 'Terminals and honors together (needed for kokushi and chanta).', ['yaochuuhai', 'orphans']],
    ['tiles', '中張牌', 'Чунчанхай', 'Простые тайлы: от 2 до 8 в трёх мастях (нужны для таняо).', 'Chunchanhai (simples)', 'Simple tiles: 2 through 8 in the three suits (needed for tanyao).', ['простые', 'simples', 'chunchanhai']],
    ['tiles', '風牌', 'Кадзэхай', 'Ветра: Восток (東), Юг (南), Запад (西), Север (北).', 'Kazehai (winds)', 'The winds: East (東), South (南), West (西), North (北).', ['ветры', 'winds', 'kazehai']],
    ['tiles', '三元牌', 'Сангэнпай', 'Драконы: белый (хаку), зелёный (хацу), красный (чун). Любой пон дракона — якухай.', 'Sangenpai (dragons)', 'The dragons: white (haku), green (hatsu), red (chun). A triplet of any dragon is a yakuhai.', ['драконы', 'dragons', 'хаку', 'хацу', 'чун']],
    ['tiles', '自風', 'Дзикадзэ', 'Личный ветер: соответствует месту игрока (дилер — Восток). Пон личного ветра — якухай.', 'Jikaze (seat wind)', 'The wind of your seat (the dealer is East). A triplet of your seat wind is a yakuhai.', ['личный ветер', 'seat wind', 'jikaze']],
    ['tiles', '場風', 'Бакадзэ', 'Ветер раунда: Восток в восточном раунде, Юг в южном. Пон такого ветра — якухай для всех игроков.', 'Bakaze (round wind)', 'East in the East round, South in the South round. A triplet of it is a yakuhai for everyone.', ['ветер раунда', 'round wind', 'bakaze']],
    ['tiles', '連風牌', 'Рэнфухай', 'Двойной ветер: ветер, который одновременно личный и ветер раунда (например, Восток у дилера в восточном раунде). Пон даёт 2 хана; пара — 4 фу в большинстве правил (в некоторых — 2).', 'Renfuuhai (double wind)', 'A wind that is both your seat wind and the round wind (e.g. East for the dealer in the East round). A triplet gives 2 han; the pair is worth 4 fu in most rules (2 in some).', ['двойной ветер', 'double wind', 'дабутон', 'renfuuhai']],
    ['tiles', 'ドラ', 'Дора', 'Бонусный тайл: каждый такой тайл на руке даёт +1 хан. Это не яку — без яку выиграть нельзя. Дору показывает индикатор: дорой становится следующий за ним тайл.', 'Dora', 'A bonus tile: each one in your hand adds +1 han. It is not a yaku. The dora is the tile after the indicator.', ['dora']],
    ['tiles', '赤ドラ', 'Акадора', 'Красная пятёрка (обычно по одной в каждой масти). +1 хан, как дора.', 'Akadora', 'A red five (usually one per suit). +1 han, like a dora.', ['красная пятёрка', 'aka', 'red five']],
    ['tiles', '裏ドラ', 'Ура-дора', 'Скрытая дора под индикатором: открывается при выигрыше только у игроков, объявивших риичи.', 'Uradora', 'The hidden dora under the indicator, revealed on a win only for players who declared riichi.', ['uradora', 'ура дора']],
    ['tiles', 'カンドラ', 'Кан-дора', 'Дополнительный индикатор доры, открываемый после каждого кана.', 'Kandora', 'An extra dora indicator revealed after each kan.', ['kandora', 'кандора']],

    // ---- Открытия ----
    ['calls', '鳴き', 'Наки', 'Любое открытие: взятие чужого сброса в чи, пон или открытый кан. Рука становится открытой, часть яку теряет ценность или недоступна.', 'Naki (calling)', 'Any call: taking an opponent’s discard for chi, pon or open kan. The hand becomes open and some yaku lose value or become unavailable.', ['naki', 'открытие', 'call']],
    ['calls', 'チー', 'Чи', 'Сбор сюнцу из чужого сброса. Только от игрока слева (того, чей сброс идёт прямо перед вашим ходом).', 'Chi', 'Completing a sequence from a discard. Only from the player to your left.', ['chii', 'chi']],
    ['calls', 'ポン', 'Пон', 'Сбор коцу из чужого сброса от любого игрока.', 'Pon', 'Completing a triplet from a discard by any player.', ['pon']],
    ['calls', 'カン', 'Кан', 'Объявление четвёрки одинаковых тайлов. После кана берётся тайл с конца стены и открывается новая кан-дора.', 'Kan', 'Declaring four identical tiles. You draw a replacement tile from the dead wall and a new kan-dora is revealed.', ['kan']],
    ['calls', '大明槓', 'Дайминкан', 'Открытый кан из чужого сброса: у вас три копии на руке и вы берёте четвёртую.', 'Daiminkan', 'An open kan from a discard: you hold three copies and take the fourth.', ['daiminkan']],
    ['calls', '暗槓', 'Анкан', 'Закрытый кан из четырёх тайлов на руке. Рука остаётся закрытой. Даёт больше фу, чем открытый.', 'Ankan', 'A concealed kan from four tiles in hand. The hand stays closed and the kan is worth more fu.', ['ankan', 'closed kan']],
    ['calls', '加槓', 'Сёминкан', 'Добавленный кан: четвёртая копия присоединяется к уже открытому пону. Другие игроки могут выиграть на этот тайл (чанкан).', 'Shouminkan (added kan)', 'Adding the fourth copy to an open pon. Others can win on that tile (chankan).', ['shouminkan', 'kakan', 'какан', 'added kan']],
    ['calls', 'ロン', 'Рон', 'Выигрыш на чужой сброс. Платит тот, кто сбросил тайл.', 'Ron', 'Winning on an opponent’s discard. The player who discarded pays.', ['ron']],
    ['calls', 'ツモ', 'Цумо', 'Выигрыш на собственный тайл из стены (или после кана). Платят все трое, закрытая рука получает +1 хан (мэнзэн цумо).', 'Tsumo', 'Winning on your own draw (or kan replacement). All three opponents pay, and a closed hand gets +1 han (menzen tsumo).', ['tsumo']],
    ['calls', 'ツモ切り', 'Цумогири', 'Сброс только что взятого тайла без изменений руки. После риичи — единственный вариант.', 'Tsumogiri', 'Discarding the tile you just drew without changing the hand. After riichi it is your only option.', ['tsumogiri']],
    ['calls', '手出し', 'Тэдаси', 'Сброс тайла из руки, а не только что взятого. Выдаёт, что рука изменилась.', 'Tedashi', 'Discarding a tile from your hand rather than the tile just drawn. It signals a hand change.', ['tedashi']],
    ['calls', 'ダマテン', 'Даматэн', 'Игра в темпае без объявления риичи: рука остаётся закрытой, соперники не знают о темпае, но нет бонусов риичи.', 'Damaten', 'Staying in tenpai without declaring riichi: opponents don’t know, but you give up riichi’s bonuses.', ['дамaтен', 'damaten', 'dama']],
    ['calls', '食い断', 'Куитан', 'Таняо на открытой руке. В большинстве современных правил (Тенхо, Маджонг Соул) разрешено.', 'Kuitan', 'Open tanyao. Allowed in most modern rules (Tenhou, Mahjong Soul).', ['kuitan']],
    ['calls', '後付け', 'Атодзуке', 'Открытие руки, в которой яку пока нет и появится позже (например, с последним тайлом). Рискованно: яку может не собраться. В некоторых правилах запрещено.', 'Atozuke', 'Opening a hand that has no yaku yet and hopes to complete one later. Risky: the yaku may never arrive. Banned in some rulesets.', ['atozuke', 'адзуки']],

    // ---- Ожидания ----
    ['waits', '両面', 'Рянмен', 'Двустороннее ожидание на двух тайлах: 4-5 ждёт 3 и 6. Самое сильное: до 8 тайлов.', 'Ryanmen', 'A two-sided wait: 4-5 waits on 3 and 6. Strongest of the basic waits: up to 8 tiles.', ['ryanmen']],
    ['waits', '嵌張', 'Канчан', 'Ожидание в «дырку»: 4-6 ждёт 5. До 4 тайлов.', 'Kanchan', 'A closed (middle) wait: 4-6 waits on 5. Up to 4 tiles.', ['kanchan']],
    ['waits', '辺張', 'Пенчан', 'Краевое ожидание: 1-2 ждёт только 3, 8-9 — только 7. До 4 тайлов.', 'Penchan', 'An edge wait: 1-2 waits only on 3, 8-9 only on 7. Up to 4 tiles.', ['penchan']],
    ['waits', '双碰', 'Сянпон', 'Ожидание на двух парах: одинаковые тайлы любой из них завершают коцу. До 4 тайлов.', 'Shanpon', 'A wait on two pairs: either pair becomes a triplet. Up to 4 tiles.', ['shanpon', 'санпон']],
    ['waits', '単騎', 'Танки', 'Ожидание пары: на руке не хватает одного тайла для пары. До 3 тайлов.', 'Tanki', 'A pair wait: you need one tile to complete the pair. Up to 3 tiles.', ['tanki']],
    ['waits', '延べ単', 'Нобэтан', 'Четыре подряд идущих тайла (2-3-4-5) ждут на обоих краях: 2 или 5 (танки). До 6 тайлов.', 'Nobetan', 'Four consecutive tiles (2-3-4-5) waiting on either end (2 or 5, as a pair wait). Up to 6 tiles.', ['nobetan']],
    ['waits', '三面張', 'Санмэнтян', 'Трёхстороннее ожидание: 2-3-4-5-6 ждёт 1, 4 и 7. До 11 тайлов.', 'Sanmenchan', 'A three-sided wait: 2-3-4-5-6 waits on 1, 4 and 7. Up to 11 tiles.', ['санмэнчан', 'sanmenchan']],
    ['waits', '待ち', 'Мати', 'Любое ожидание — набор тайлов, на которые рука выигрывает.', 'Machi', 'A wait: the set of tiles that complete the hand.', ['machi', 'ожидание', 'wait']],

    // ---- Эффективность ----
    ['efficiency', '受け入れ', 'Уке-ире', 'Число оставшихся тайлов, после взятия которых шантэн руки снижается. Чем больше — тем быстрее рука; считается после выбранного сброса.', 'Ukeire', 'The number of remaining tiles that lower your shanten when drawn. Higher means a faster hand; counted after a given discard.', ['укеире', 'ukeire', 'uke-ire']],
    ['efficiency', '', 'Аут', 'Конкретная оставшаяся копия тайла, нужного руке (для улучшения или выигрыша). Видимые на столе копии не считаются.', 'Out', 'A specific remaining copy of a tile the hand needs. Copies you can already see are not counted.', ['out']],
    ['efficiency', '変化', 'Хэнка', 'Тайл, который сейчас не снижает шантэн, но меняет форму руки к лучшему (лучшее ожидание, больше очков или уке-ире).', 'Henka', 'A tile that doesn’t lower shanten now but improves the hand’s shape (better wait, more value or more ukeire).', ['henka', 'хенка']],
    ['efficiency', '', 'Приоритет шантэна', 'Базовый принцип: сначала снижайте шантэн (максимизируйте уке-ире), и лишь при равенстве выбирайте сброс по ценности, форме и безопасности.', 'Shanten first', 'A basic principle: first reduce shanten (maximize ukeire); only when tied choose by value, shape and safety.', ['приоритет']],
    ['efficiency', '', 'Хэддоресу', 'Рука без пары (headless): четыре блока есть, пары нет. Пару придётся искать отдельно, поэтому уке-ире меньше.', 'Headless', 'A hand with four blocks but no pair. A pair must still be found, so ukeire is lower.', ['headless', 'хэдлесс']],
    ['efficiency', '', 'Куццуки', 'Тайл-«липучка»: тайл, к которому может присоединиться соседний, чтобы образовать нужный блок.', 'Kuttsuki', 'A “sticky” tile that can attach to a neighbouring tile to form a needed block.', ['kuttsuki']],

    // ---- Яку ----
    ['yaku', '立直', 'Риичи (яку)', '1 хан. Только закрытая рука, в темпае, ставка 1000.', 'Riichi (yaku)', '1 han. Closed hand only, in tenpai, 1,000-point bet.', []],
    ['yaku', 'ダブル立直', 'Дабури', 'Двойное риичи: риичи на самом первом сбросе игры (без открытий до этого). 2 хана.', 'Daburii (double riichi)', 'Riichi declared on your very first discard with no calls beforehand. 2 han.', ['дабл риичи', 'double riichi']],
    ['yaku', '一発', 'Иппацу', '1 хан. Выигрыш в течение одного круга после объявления риичи, если никто не открывался.', 'Ippatsu', '1 han. Winning within one go-round after riichi, with no calls in between.', ['ippatsu']],
    ['yaku', '門前清自摸和', 'Мэнзэн цумо', '1 хан. Цумо на закрытой руке.', 'Menzen tsumo', '1 han. Winning by tsumo with a closed hand.', ['menzen tsumo']],
    ['yaku', '断么九', 'Таняо', '1 хан. Рука только из простых тайлов 2–8. Можно и открытой (куитан).', 'Tanyao', '1 han. Only simple tiles 2–8. Can be open (kuitan).', ['танъяо', 'tanyao']],
    ['yaku', '平和', 'Пинфу', '1 хан. Закрытая рука: четыре сюнцу, пара не якухай, ожидание рянмен. Фу: ровно 20 при цумо, 30 при роне.', 'Pinfu', '1 han. Closed hand: four sequences, non-yakuhai pair, ryanmen wait. Exactly 20 fu on tsumo, 30 on ron.', ['pinfu']],
    ['yaku', '役牌', 'Якухай', '1 хан за каждый пон (или кан) драконов, личного ветра и ветра раунда. Пара якухай яку не даёт (только +2 фу).', 'Yakuhai', '1 han per triplet (or kan) of a dragon, seat wind or round wind. A pair gives no yaku (only +2 fu).', ['yakuhai']],
    ['yaku', '一盃口', 'Иипэйко', '1 хан. Закрытая рука с двумя одинаковыми сюнцу одной масти (например 3-4-5 ман ×2).', 'Iipeikou', '1 han. Closed hand with two identical sequences in one suit.', ['иппэйко', 'иппейко', 'iipeikou']],
    ['yaku', '海底摸月', 'Хайтэй', '1 хан. Цумо на самый последний тайл стены.', 'Haitei', '1 han. Winning by tsumo on the last tile of the wall.', ['haitei']],
    ['yaku', '河底撈魚', 'Хотэй', '1 хан. Рон на самый последний сброс в раздаче.', 'Houtei', '1 han. Winning by ron on the last discard of the hand.', ['houtei', 'хотей']],
    ['yaku', '嶺上開花', 'Риншан кайхо', '1 хан. Цумо на тайл, взятый с конца стены после кана.', 'Rinshan kaihou', '1 han. Winning on the replacement tile drawn after a kan.', ['rinshan', 'риншан']],
    ['yaku', '槍槓', 'Чанкан', '1 хан. Рон на тайл, который соперник добавляет к пону, объявляя сёминкан.', 'Chankan', '1 han. Ron on the tile an opponent adds to a pon when declaring shouminkan.', ['chankan']],
    ['yaku', '三色同順', 'Саншоку доудзюн', '2 хана (1 на открытой). Три одинаковых сюнцу в трёх мастях, например 4-5-6 ман, пин и соу.', 'Sanshoku doujun', '2 han (1 if open). The same sequence in all three suits.', ['саншоку', 'sanshoku']],
    ['yaku', '一気通貫', 'Иццу', '2 хана (1 на открытой). 1-2-3, 4-5-6 и 7-8-9 одной масти.', 'Ittsu', '2 han (1 if open). 1-2-3, 4-5-6 and 7-8-9 in one suit.', ['ищу', 'иккицукан', 'ittsu', 'ikkitsuukan']],
    ['yaku', '混全帯么九', 'Чанта', '2 хана (1 на открытой). В каждом блоке и в паре есть терминал или честный тайл; есть хотя бы один сюнцу и хотя бы один честный тайл.', 'Chanta', '2 han (1 if open). Every set and the pair contains a terminal or honor, with at least one sequence and one honor.', ['chanta']],
    ['yaku', '純全帯么九', 'Дзюнчан', '3 хана (2 на открытой). Как чанта, но только терминалы, без честных тайлов.', 'Junchan', '3 han (2 if open). Like chanta, but with terminals only, no honors.', ['джунчан', 'junchan']],
    ['yaku', '対々和', 'Тойтой', '2 хана. Четыре коцу (или кана) и пара. Может быть открытой.', 'Toitoi', '2 han. Four triplets (or kans) and a pair. Can be open.', ['тоитои', 'toitoi']],
    ['yaku', '三暗刻', 'Сананко', '2 хана. Три закрытых коцу. Остальные блоки могут быть открытыми.', 'Sanankou', '2 han. Three concealed triplets. The other set may be open.', ['sanankou']],
    ['yaku', '三色同刻', 'Саншоку доукоу', '2 хана. Одинаковые коцу (например, тройки пятёрок) в трёх мастях.', 'Sanshoku doukou', '2 han. The same triplet in all three suits.', ['sanshoku doukou']],
    ['yaku', '三槓子', 'Санканцу', '2 хана. Три кана в одной руке.', 'Sankantsu', '2 han. Three kans in one hand.', ['sankantsu']],
    ['yaku', '混老頭', 'Хонроуто', '2 хана. Только терминалы и честные тайлы, без сюнцу (по сути тойтой).', 'Honroutou', '2 han. Only terminals and honors; no sequences.', ['honroutou']],
    ['yaku', '小三元', 'Сёсангэн', '2 хана (плюс по 1 за каждый пон дракона). Два пона драконов и пара третьего.', 'Shousangen', '2 han (plus 1 for each dragon triplet). Two dragon triplets and a pair of the third.', ['шосанген', 'shousangen']],
    ['yaku', '七対子', 'Читоицу', '2 хана. Закрытая рука из семи разных пар (одинаковых пар быть не может). Ровно 25 фу.', 'Chiitoitsu', '2 han. A closed hand of seven different pairs. Always 25 fu.', ['chiitoitsu', 'семь пар']],
    ['yaku', '混一色', 'Хонницу', '3 хана (2 на открытой). Одна масть плюс честные тайлы.', 'Honitsu', '3 han (2 if open). One suit plus honors.', ['хоницу', 'honitsu']],
    ['yaku', '二盃口', 'Рянпэйко', '3 хана. Закрытая рука с двумя парами одинаковых сюнцу. Иипэйко при этом не прибавляется.', 'Ryanpeikou', '3 han. Closed hand with two pairs of identical sequences. Iipeikou is not added on top.', ['рянпейко', 'ryanpeikou']],
    ['yaku', '清一色', 'Чиницу', '6 хан (5 на открытой). Вся рука одной масти, без честных тайлов. Это не якуман.', 'Chinitsu', '6 han (5 if open). The whole hand in one suit, no honors. Not a yakuman.', ['chinitsu']],

    // ---- Якуманы ----
    ['yakuman', '国士無双', 'Кокуси мусо', 'Тринадцать сирот: по одному терминалу и честному тайлу каждого вида и ещё один любой из них в паре. Только закрытая. При ожидании на 13 тайлов во многих правилах — двойной якуман.', 'Kokushi musou', 'Thirteen orphans: one of each terminal and honor plus a duplicate of any. Closed only. The 13-sided wait is a double yakuman in many rules.', ['кокуши', 'kokushi', 'thirteen orphans']],
    ['yakuman', '四暗刻', 'Суанко', 'Четыре закрытых коцу. Только закрытая; рон на шанпон делает один из сетов открытым, и это уже сананко, а не суанко. Ожидание танки во многих правилах — двойной якуман.', 'Suuankou', 'Four concealed triplets. Closed only; a ron on a shanpon wait makes one triplet open, so it is only sanankou. The tanki wait is a double yakuman in many rules.', ['suuankou']],
    ['yakuman', '大三元', 'Дайсангэн', 'Три пона (кана) драконов.', 'Daisangen', 'Triplets (or kans) of all three dragons.', ['daisangen']],
    ['yakuman', '小四喜', 'Сёсуси', 'Три пона ветров и пара четвёртого ветра.', 'Shousuushii', 'Three wind triplets and a pair of the fourth wind.', ['шосушин', 'shousuushii']],
    ['yakuman', '大四喜', 'Дайсуси', 'Четыре пона (кана) ветров. Во многих правилах — двойной якуман.', 'Daisuushii', 'Triplets (or kans) of all four winds. A double yakuman in many rules.', ['дайсуш', 'daisuushii']],
    ['yakuman', '緑一色', 'Рюисо', 'Только «зелёные» тайлы: 2, 3, 4, 6, 8 соу и зелёный дракон.', 'Ryuuiisou', 'Only green tiles: 2, 3, 4, 6, 8 sou and the green dragon.', ['рьюисо', 'ryuuiisou', 'all green']],
    ['yakuman', '字一色', 'Цуисо', 'Только честные тайлы.', 'Tsuuiisou', 'Only honor tiles.', ['цуиисо', 'tsuuiisou', 'all honors']],
    ['yakuman', '清老頭', 'Чинроуто', 'Только терминалы (1 и 9 трёх мастей).', 'Chinroutou', 'Only terminals (1s and 9s).', ['чинрото', 'chinroutou', 'all terminals']],
    ['yakuman', '四槓子', 'Суканцу', 'Четыре кана в одной руке.', 'Suukantsu', 'Four kans in one hand.', ['суканцу', 'suukantsu']],
    ['yakuman', '九蓮宝燈', 'Тюрэн потто', 'Девять врат: закрытая рука одной масти 1-1-1-2-3-4-5-6-7-8-9-9-9 плюс ещё любой тайл этой масти.', 'Chuuren poutou', 'Nine gates: a closed single-suit hand 1-1-1-2-3-4-5-6-7-8-9-9-9 plus any extra tile of that suit.', ['chuuren', 'тюренпото', 'nine gates']],
    ['yakuman', '天和', 'Тэнхо', 'Выигрыш дилера на первой раздаче 14 тайлов (на цумо).', 'Tenhou', 'The dealer winning on the initial 14 tiles.', ['tenhou']],
    ['yakuman', '地和', 'Тихо', 'Выигрыш недилера на свой первый тайл, пока никто не открывался.', 'Chiihou', 'A non-dealer winning on their first draw before any call.', ['chiihou']],

    // ---- Защита ----
    ['defense', '現物', 'Гэмбуцу', 'Тайл, который уже есть в сбросах игрока, угрожающего вам (рука в риичи, например). На него он выиграть не может из-за фуритэна, поэтому 100% безопасен против него.', 'Genbutsu', 'A tile already in the threatening player’s own discards. Because of furiten, that player cannot ron on it, so it is 100% safe against them.', ['genbutsu']],
    ['defense', '筋', 'Суджи', 'Тайл на три выше/ниже сброшенного (сброшена 4 — суджи 1 и 7). Безопаснее остальных против рянмена, но не против канчана, шанпона и танки.', 'Suji', 'A tile three away from a discarded one (4 discarded → 1 and 7). Safer against ryanmen but not against kanchan, shanpon or tanki.', ['suji']],
    ['defense', '壁', 'Кабэ', 'Когда на столе видны все четыре копии тайла, ожидания, которым он нужен, невозможны, а соседние тайлы становятся безопаснее.', 'Kabe (wall)', 'When all four copies of a tile are visible, waits that need it cannot exist, making neighbouring tiles safer.', ['kabe', 'кабе', 'wall']],
    ['defense', 'ワンチャンス', 'Ван-чансу', 'Видна ровно одна копия соседнего тайла — шанс ожидания очень мал.', 'One chance', 'Only one copy of the neighbouring tile remains, so the wait is unlikely.', ['one chance']],
    ['defense', 'ベタ降り', 'Бэтаори', 'Полная защита: отказ от своей руки, сбрасываются только самые безопасные тайлы.', 'Betaori', 'Full defence: giving up your hand and discarding only the safest tiles.', ['betaori']],
    ['defense', '回し打ち', 'Маваси', 'Баланс атаки и защиты: продолжать строить руку, сбрасывая менее опасные тайлы.', 'Mawashi', 'Balancing offence and defence: keep building while discarding less dangerous tiles.', ['mawashi']],
    ['defense', '放銃', 'Хоудзю', 'Сброс, на который соперник выигрывает рон; вы платите за всю руку.', 'Houjuu', 'Dealing in: discarding the tile an opponent wins on; you pay for the whole hand.', ['houjuu', 'deal-in', 'deal in']],
    ['defense', '', 'Безопасный тайл', 'Тайл, на который противники, как известно по сбросам и видимым тайлам, не могут выиграть (гэмбуцу — идеально безопасен).', 'Safe tile', 'A tile opponents cannot win on given the visible information (genbutsu is perfectly safe).', ['safe']],

    // ---- Очки ----
    ['score', '飜', 'Хан', 'Единица ценности руки: яку и дора дают ханы.', 'Han', 'The unit of a hand’s value: yaku and dora give han.', ['han']],
    ['score', '符', 'Фу', 'Мелкие очки структуры руки и способа победы (база 20; плюс за сеты, пару, ожидание, цумо/рон). Нужны, когда меньше 5 хан.', 'Fu', 'Minipoints for the hand’s structure and win method (base 20 plus sets, pair, wait, tsumo/ron). Matter below 5 han.', ['fu']],
    ['score', '満貫', 'Манган', '5 хан, а также 4 хана с 40+ фу или 3 хана с 70+ фу (базовые очки 2000). 8000 очков недилеру, 12000 дилеру.', 'Mangan', '5 han, or 4 han at 40+ fu or 3 han at 70+ fu (base points 2,000). 8,000 for a non-dealer, 12,000 for the dealer.', ['mangan']],
    ['score', '跳満', 'Ханэман', '6–7 хан. 12000 недилеру, 18000 дилеру.', 'Haneman', '6–7 han. 12,000 non-dealer, 18,000 dealer.', ['haneman']],
    ['score', '倍満', 'Байман', '8–10 хан. 16000 недилеру, 24000 дилеру.', 'Baiman', '8–10 han. 16,000 non-dealer, 24,000 dealer.', ['baiman']],
    ['score', '三倍満', 'Санбайман', '11–12 хан. 24000 недилеру, 36000 дилеру.', 'Sanbaiman', '11–12 han. 24,000 non-dealer, 36,000 dealer.', ['sanbaiman']],
    ['score', '数え役満', 'Кадзоэ якуман', '13 и более хан без якумана. Платится как якуман: 32000 недилеру, 48000 дилеру.', 'Kazoe yakuman', '13+ han from ordinary yaku and dora. Paid as a yakuman: 32,000 non-dealer, 48,000 dealer.', ['kazoe']],
    ['score', '役満', 'Якуман', 'Высшая рука: 32000 недилеру, 48000 дилеру. Двойной якуман — вдвое больше.', 'Yakuman', 'The top hand: 32,000 non-dealer, 48,000 dealer. A double yakuman pays double.', ['yakuman']],
    ['score', '切り上げ満貫', 'Кириагэ-манган', 'Округление 4 хана 30 фу и 3 хана 60 фу (7700 / 11600) вверх до мангана. Применяется не во всех правилах, поэтому в счётчике это отдельная опция.', 'Kiriage mangan', 'Rounding 4 han 30 fu and 3 han 60 fu up to mangan. Not used in every ruleset, so the counter has it as a separate option.', ['кириагэ', 'kiriage']],
    ['score', '親', 'Дилер (оя)', 'Игрок на Востоке. Выигрывает и платит в полтора раза больше: рон — 6× базовых очков вместо 4×; цумо — каждый платит 2×.', 'Dealer (oya)', 'The East player. Wins and pays 1.5× more: ron is 6× base points instead of 4×; on tsumo each opponent pays 2×.', ['дилер', 'оя', 'oya', 'dealer']],
    ['score', '子', 'Недилер (ко)', 'Остальные три игрока. Рон платится 4× базовых очков; при цумо дилер платит 2×, остальные по 1×.', 'Non-dealer (ko)', 'The other three players. Ron is 4× base points; on tsumo the dealer pays 2× and others 1× each.', ['недилер', 'ко', 'ko', 'non-dealer']],
    ['score', '基本点', 'Базовые очки', 'Хан и фу → базовые очки: фу × 2^(хан + 2), но не больше 2000 до лимитов. Платёж = база ×4 (рон) или ×2 / ×1 (цумо), округляется вверх до 100.', 'Base points', 'Han and fu → base points: fu × 2^(han + 2), capped at 2,000 below the limits. Payment = base × 4 (ron) or × 2 / × 1 (tsumo), rounded up to 100.', ['base points']],

    // ---- Стратегия ----
    ['strategy', '', 'EV (средняя выгода)', 'Среднее значение очков, которое даёт решение, если ситуацию повторять много раз. Критерий выбора сброса: максимизировать EV, а не «сыграть наверняка».', 'EV (expected value)', 'The average point outcome of a decision if repeated many times. Choose the discard with the best EV rather than the one that “feels safe”.', ['ev', 'expected value']],
    ['strategy', '', 'Формальный темпай', 'Дойти до темпая к концу раздачи, чтобы не платить штраф нотэна, даже если выигрыш маловероятен.', 'Formal tenpai', 'Reaching tenpai near the end of the hand just to avoid the noten penalty.', ['formal tenpai']],
    ['strategy', '', 'Чтение сбросов', 'Анализ чужих рек: сброшенные тайлы и момент сброса показывают формы, ожидания и стоимость соперника.', 'Reading discards', 'Analysing opponents’ rivers: which tiles and when reveal their shapes, waits and value.', ['reading']],
    ['strategy', '', 'Перестроение', 'Смена цели руки по ходу раздачи, например переход с пинфу на чиницу или читоицу.', 'Hand reconstruction', 'Changing the target of the hand mid-round, e.g. from pinfu to chinitsu or chiitoitsu.', ['reconstruction']],
    ['strategy', '', 'Догоняющее риичи', 'Риичи, объявленное после того, как противник уже сделал риичи (оба в темпае, нужно решать «push/fold»).', 'Chasing riichi', 'Declaring riichi after an opponent has already declared. Both hands are in tenpai and push/fold matters.', ['chase']],
    ['strategy', '', 'Push / Fold', 'Решение «давить или сбросить»: сравнивайте ценность и скорость руки, ожидание, опасность тайла и положение в игре.', 'Push / Fold', 'The decision to push or fold: compare your hand’s value, speed, wait, tile danger and your standing.', ['push', 'fold', 'давить', 'сбросить']],
    ['strategy', '', 'Разбор партий', 'Анализ прошлых игр для поиска ошибок: в этом приложении — раздел «Разбор».', 'Game review', 'Analysing past games to find mistakes: in this app, the Review section.', ['review']],
];

export const GLOSSARY = RAW.map((row, index) => ({
    id: index,
    cat: row[0],
    ja: row[1],
    ru: { term: row[2], def: row[3] },
    en: { term: row[4], def: row[5] },
    alt: row[6] || [],
}));

/** Для поиска: нижний регистр, ё → е. */
export function normalize(text) {
    return String(text || '').toLowerCase().replace(/ё/g, 'е');
}

/**
 * Поиск: совпадение в названии/синонимах/японском написании важнее, чем в определении.
 */
export function searchGlossary(entries, query, language) {
    const q = normalize(query).trim();
    if (!q) return entries;

    const scored = [];
    entries.forEach((entry) => {
        const lang = entry[language] || entry.ru;
        const term = normalize(lang.term);
        const alt = entry.alt.map(normalize);
        const other = normalize(entry.ru.term + ' ' + entry.en.term);
        let score = 0;
        if (term === q) score = 100;
        else if (term.startsWith(q)) score = 80;
        else if (alt.some((a) => a === q)) score = 70;
        else if (alt.some((a) => a.startsWith(q)) || other.includes(q)) score = 60;
        else if (term.includes(q) || alt.some((a) => a.includes(q)) || entry.ja.includes(query.trim())) score = 40;
        else if (normalize(lang.def).includes(q)) score = 10;
        if (score) scored.push({ entry, score });
    });

    return scored.sort((a, b) => b.score - a.score || a.entry.id - b.entry.id).map((s) => s.entry);
}
