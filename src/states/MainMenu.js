import React from 'react';
import UkeireQuiz from "./UkeireQuiz";
import ReplayAnalysis from "./ReplayAnalysis";
import UtilsState from "./UtilsState";
import HandExplorer from "./HandExplorer";
import Shanten from './Shanten';
import SouthFourQuiz from './SouthFourQuiz';
import { withTranslation } from '../i18n';
import DefenseState from './DefenseState';
import AppSettings from '../screens/AppSettings';
import Help from '../screens/Help';
import About from '../screens/About';
import Home from '../screens/Home';
import { getLastState, setLastState } from '../progress';
import Glossary from '../screens/Glossary';
import ScoreCounter from '../screens/ScoreCounter';
import { AppBar, BottomNav, Button, Icon, ToastHost } from '../components/ui';

const STATES = {
    UKEIRE: 0,
    REPLAY: 1,
    UTILS: 2,
    EXPLORER: 3,
    SOUTH_FOUR: 4,
    DEFENSE: 5,
    SHANTEN: 6,
    SETTINGS: 7,
    HELP: 8,
    ABOUT: 9,
    HOME: 10,
    GLOSSARY: 11,
    COUNTER: 12,
};

/** Screens that count as exercises (shown on the home screen, remembered for «Continue»). */
const EXERCISES = [STATES.UKEIRE, STATES.DEFENSE, STATES.SOUTH_FOUR, STATES.REPLAY, STATES.EXPLORER, STATES.SHANTEN, STATES.UTILS];

/** Разделы верхнего уровня (нижняя навигация). Всё остальное — внутри «Тренера». */
const SECTIONS = [STATES.HOME, STATES.GLOSSARY, STATES.COUNTER];

class MainMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: STATES.HOME
        }

        this.onSetActivePage = this.onSetActivePage.bind(this);
    }

    onSetActivePage(index) {
        if (EXERCISES.indexOf(index) > -1) setLastState(index);

        this.setState({
            active: index
        });

        window.scrollTo(0, 0);
    }

    changeLanguage(newLanguage) {
        let { i18n } = this.props;
        i18n.changeLanguage(newLanguage);
    }

    getTitle() {
        let { t } = this.props;
        switch (this.state.active) {
            case STATES.REPLAY: return t("menu.analyzer");
            case STATES.UTILS: return t("menu.utils");
            case STATES.EXPLORER: return t("menu.explorer");
            case STATES.SOUTH_FOUR: return t("menu.allLast");
            case STATES.DEFENSE: return t("menu.defense");
            case STATES.SHANTEN: return t("menu.shanten");
            case STATES.SETTINGS: return t("app.settings");
            case STATES.HELP: return t("app.help");
            case STATES.ABOUT: return t("app.about");
            case STATES.GLOSSARY: return t("menu.glossary");
            case STATES.COUNTER: return t("menu.counter");
            case STATES.HOME: return t("app.name");
            default: return t("menu.trainer");
        }
    }

    getExercises() {
        let { t } = this.props;
        return [
            { id: STATES.UKEIRE, label: t("menu.trainer"), icon: "target" },
            { id: STATES.DEFENSE, label: t("menu.defense"), icon: "shield" },
            { id: STATES.SOUTH_FOUR, label: t("menu.allLast"), icon: "barChart" },
            { id: STATES.REPLAY, label: t("menu.analyzer"), icon: "search" },
            { id: STATES.EXPLORER, label: t("menu.explorer"), icon: "layers" },
            { id: STATES.SHANTEN, label: t("menu.shanten"), icon: "compass" },
            { id: STATES.UTILS, label: t("menu.utils"), icon: "wrench" },
        ];
    }

    renderPage() {
        switch (this.state.active) {
            case STATES.UKEIRE:
                return <UkeireQuiz />;
            case STATES.REPLAY:
                return <ReplayAnalysis />;
            case STATES.UTILS:
                return <UtilsState />;
            case STATES.EXPLORER:
                return <HandExplorer />;
            case STATES.SOUTH_FOUR:
                return <SouthFourQuiz />;
            case STATES.DEFENSE:
                return <DefenseState />;
            case STATES.SHANTEN:
                return <Shanten />;
            case STATES.SETTINGS:
                return <AppSettings />;
            case STATES.HELP:
                return <Help />;
            case STATES.ABOUT:
                return <About />;
            case STATES.GLOSSARY:
                return <Glossary />;
            case STATES.COUNTER:
                return <ScoreCounter />;
            case STATES.HOME:
                return <Home exercises={this.getExercises()} lastId={getLastState()} onOpen={this.onSetActivePage} helpId={STATES.HELP} aboutId={STATES.ABOUT} />;
            default:
                return <UkeireQuiz />;
        }
    }

    render() {
        let { t } = this.props;
        let active = this.state.active;

        let items = [
            { id: STATES.HOME, label: t("app.navTrainer"), icon: "target" },
            { id: STATES.GLOSSARY, label: t("app.navGlossary"), icon: "book" },
            { id: STATES.COUNTER, label: t("app.navCounter"), icon: "calculator" },
        ];

        // Любой экран тренера (упражнения, настройки, справка) подсвечивает «Тренер».
        let activeNav = active === STATES.GLOSSARY || active === STATES.COUNTER ? active : STATES.HOME;
        let isSection = SECTIONS.indexOf(active) > -1;

        return (
            <div className="rt-app">
                <AppBar
                    title={this.getTitle()}
                    left={isSection
                        ? <Icon name="tile" size={24} className="rt-brand" />
                        : <Button variant="ghost" icon="chevronLeft" aria-label={t("home.back")} onClick={() => this.onSetActivePage(STATES.HOME)} />}
                    right={<Button variant="ghost" icon="sliders" aria-label={t("app.settings")} onClick={() => this.onSetActivePage(STATES.SETTINGS)} />}
                />
                <main className="rt-main">
                    {this.renderPage()}
                </main>
                <BottomNav items={items} activeId={activeNav} onSelect={this.onSetActivePage} ariaLabel={t("app.navLabel")} />
                <ToastHost />
            </div>
        );
    }
}

export default withTranslation()(MainMenu);
