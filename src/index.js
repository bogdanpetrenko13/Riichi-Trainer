import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import * as serviceWorker from './serviceWorker';
import "./i18n";
import { initAppearance } from './theme';

import MainMenu from './states/MainMenu';

initAppearance();

ReactDOM.render(<MainMenu />, document.getElementById('root'));
// Приложение работает офлайн из APK, service worker не нужен и мешает обновлению.
serviceWorker.unregister();
