import React from 'react';
import { ListGroup } from 'reactstrap';
import HistoryMessage from './HistoryMessage';
import { Collapsible } from './ui';
import { withTranslation } from 'react-i18next';

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
            <Collapsible title={t("history.label")} icon="history" defaultOpen>
                <ListGroup>
                    {history}
                </ListGroup>
            </Collapsible>
        );
    }
}

export default withTranslation()(History);
