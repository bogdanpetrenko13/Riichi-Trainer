import React from 'react';
import { ListGroup } from './ui/legacy';
import HistoryMessage from './HistoryMessage';
import { Collapsible } from './ui';
import { withTranslation } from '../i18n';

class History extends React.Component {
    render() {
        let history = this.props.history.map((historyObject, index) => {
            return (
                <HistoryMessage
                    key={index - this.props.history.length}
                    concise={this.props.concise}
                    data={historyObject}
                    spoilers={this.props.spoilers}
                    verbose={this.props.verbose}
                />
            );
        });

        let { t } = this.props;

        return (
            <Collapsible title={t("history.label")} icon="history" defaultOpen={!!this.props.defaultOpen}>
                <ListGroup>
                    {history}
                </ListGroup>
            </Collapsible>
        );
    }
}

export default withTranslation()(History);
