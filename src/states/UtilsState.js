import React, { useState } from 'react';
import RandomGameState from '../components/utils/RandomGameState';
import ConvertHand from '../components/utils/ConvertHand';
import { Segmented } from '../components/ui';
import { useTranslation } from '../i18n';

/** Утилиты: два инструмента на вкладках, чтобы не листать длинную страницу. */
function UtilsState() {
    const { t } = useTranslation();
    const [tab, setTab] = useState('convert');

    return (
        <div className="rt-page">
            <Segmented
                role="tablist"
                ariaLabel={t('menu.utils')}
                value={tab}
                onChange={setTab}
                options={[
                    { value: 'convert', label: t('utils.tabConvert') },
                    { value: 'state', label: t('utils.tabState') },
                ]}
            />
            {tab === 'convert' ? <ConvertHand /> : <RandomGameState />}
        </div>
    );
}

export default UtilsState;
