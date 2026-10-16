import React from 'react';
import { Button } from './ui';
import { convertHandToTenhouString } from '../scripts/HandConversions';
import { withTranslation } from '../i18n';

class CopyButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lastCopy: "Never copied."
        }
    }

    onClick() {
        const el = document.createElement('textarea');
        el.value = convertHandToTenhouString(this.props.hand);
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        const selected =
            document.getSelection().rangeCount > 0
                ? document.getSelection().getRangeAt(0)
                : false;
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        if (selected) {
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(selected);
        }

        this.setState({
            lastCopy: convertHandToTenhouString(this.props.hand)
        });
    }

    render() {
        let hasCopied = false;
        if (this.props.hand) {
            hasCopied = this.state.lastCopy === convertHandToTenhouString(this.props.hand);
        }

        let { t } = this.props;

        return (
            <Button variant={hasCopied ? "success" : "secondary"} icon={hasCopied ? "check" : "copy"} onClick={() => this.onClick()}>
                {hasCopied ? t("trainer.copied") : t("trainer.copyHand")}
            </Button>
        );
    }
}

export default withTranslation()(CopyButton);