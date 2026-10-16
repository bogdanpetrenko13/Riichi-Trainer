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
import { AppBar, BottomNav, Button, Icon, Modal, ToastHost } from '../components/ui';

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
};

/** Пункты нижней навигации: id совпадает с номером состояния, кроме «Ещё». */
const NAV_STATES = [STATES.UKEIRE, STATES.DEFENSE, STATES.REPLAY, STATES.SOUTH_FOUR];

class MainMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: 0,
            moreOpen: false
        }

        this.onSetActivePage = this.onSetActivePage.bind(this);
        this.onNavSelect = this.onNavSelect.bind(this);
        this.closeMore = this.closeMore.bind(this);
    }

    onSetActivePage(index) {
        this.setState({
            active: index,
            moreOpen: false
        });

        window.scrollTo(0, 0);
    }

    onNavSelect(id) {
        if (id === 'more') {
            this.setState({ moreOpen: true });
        } else {
            this.onSetActivePage(id);
        }
    }

    closeMore() {
        this.setState({ moreOpen: false });
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
            default: return t("menu.trainer");
        }
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
            default:
                return <UkeireQuiz />;
        }
    }

    render() {
        let { t } = this.props;
        let active = this.state.active;

        let items = [
            { id: STATES.UKEIRE, label: t("menu.trainer"), icon: "target" },
            { id: STATES.DEFENSE, label: t("menu.defense"), icon: "shield" },
            { id: STATES.REPLAY, label: t("menu.analyzer"), icon: "search" },
            { id: STATES.SOUTH_FOUR, label: t("menu.allLast"), icon: "barChart" },
            { id: 'more', label: t("app.more"), icon: "more" },
        ];

        let moreLinks = [
            { id: STATES.EXPLORER, label: t("menu.explorer"), icon: "layers" },
            { id: STATES.SHANTEN, label: t("menu.shanten"), icon: "compass" },
            { id: STATES.UTILS, label: t("menu.utils"), icon: "wrench" },
            { id: STATES.SETTINGS, label: t("app.settings"), icon: "sliders" },
            { id: STATES.HELP, label: t("app.help"), icon: "help" },
            { id: STATES.ABOUT, label: t("app.about"), icon: "info" },
        ];

        let activeNav = NAV_STATES.indexOf(active) > -1 ? active : 'more';

        return (
            <div className="rt-app">
                <AppBar
                    title={this.getTitle()}
                    left={<Icon name="tile" size={24} className="rt-brand" />}
                    right={<Button variant="ghost" icon="sliders" aria-label={t("app.settings")} onClick={() => this.onSetActivePage(STATES.SETTINGS)} />}
                />
                <main className="rt-main">
                    {this.renderPage()}
                </main>
                <BottomNav items={items} activeId={activeNav} onSelect={this.onNavSelect} ariaLabel={t("app.navLabel")} />
                <Modal open={this.state.moreOpen} onClose={this.closeMore} title={t("app.moreTitle")}>
                    <ul className="rt-more-list">
                        {moreLinks.map((link) => (
                            <li key={link.id}>
                                <button
                                    type="button"
                                    className="rt-lang"
                                    aria-current={active === link.id ? 'page' : undefined}
                                    onClick={() => this.onSetActivePage(link.id)}
                                >
                                    <span className="rt-row"><Icon name={link.icon} size={20} />{link.label}</span>
                                    <Icon name="chevronRight" size={18} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </Modal>
                <ToastHost />
            </div>
        );
    }
}

export default withTranslation()(MainMenu);
