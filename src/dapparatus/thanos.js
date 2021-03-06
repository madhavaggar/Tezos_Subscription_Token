import React, { Component } from 'react';
import deepmerge from 'deepmerge';
import logo from '../thanos.png';
import eth from '../tezos.png';
import Scaler from './scaler.js';
import Blockies from 'react-blockies';
import { TezosToolkit } from '@taquito/taquito';
import { TezBridgeWallet } from '@taquito/tezbridge-wallet';

let interval;
let defaultConfig = {};
defaultConfig.DEBUG = false;
defaultConfig.POLLINTERVAL = 191;
defaultConfig.showBalance = true;
defaultConfig.hideNetworks = ['Mainnet'];
defaultConfig.accountCutoff = 36;
defaultConfig.outerBoxStyle = {
    float: 'right'
};
defaultConfig.ETHPRECISION = 10;
defaultConfig.boxStyle = {
    paddingRight: 75,
    marginTop: 0,
    paddingTop: 0,
    zIndex: 10,
    textAlign: 'right',
    width: 300
};
defaultConfig.boxStyleBefore = {
    zIndex: 9999,
    marginTop: 3,
    paddingTop: 7,
    zIndex: 10,
    color: '#666666',
    textAlign: 'right',
    width: 450
};
defaultConfig.textStyle = {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666666'
};
defaultConfig.warningStyle = {
    fontWeight: 'bold',
    fontSize: 24
};
defaultConfig.blockieStyle = {
    size: 6,
    top: 10,
    right: 15
};
defaultConfig.requiredNetwork = [
    "carthagenet"
];
class Thanos extends Component {
    constructor(props) {
        super(props);
        let config = defaultConfig;
        if (props.config) {
            config = deepmerge(config, props.config);
            if (props.config.requiredNetwork && props.config.requiredNetwork[0] != "") {
                config.requiredNetwork = props.config.requiredNetwork;
            }
        }
        this.state = {
            status: 'loading',
            account: null,
            tzstats: '',
            config: config,
            hasRequestedAccess: false,
        };
    }
    componentDidUpdate() {
        if (this.props.config) {
            const requiredNetwork = this.props.config.requiredNetwork;
            let config = this.state.config;
            if (requiredNetwork && requiredNetwork[0] != "" && config.requiredNetwork != requiredNetwork) {
                config.requiredNetwork = requiredNetwork;
                this.setState({ config: config });
            }
        }
    }
    componentDidMount() {
        interval = setInterval(
            this.checkThanos.bind(this),
            this.state.config.POLLINTERVAL
        );
        this.checkThanos();
    }
    componentWillUnmount() {
        clearInterval(interval);
    }


    checkThanos = async () => {
        if (!this.state.hasRequestedAccess) { // Prevent multiple prompts
            if (this.state.config.DEBUG) console.log('THANOS - requesting access from user...');
            this.setState({ hasRequestedAccess: true }, () => {
                this.props.onUpdate(this.state);
            });
            try {
                const Tezos = new TezosToolkit();
                Tezos.setProvider({ rpc: 'https://api.tez.ie/rpc/carthagenet' });
                
                const wallet = await new TezBridgeWallet();
                await wallet.setHost("https://api.tez.ie/rpc/carthagenet")
                await Tezos.setWalletProvider(wallet);
                var accountPkh = await wallet.getPKH();
                
                console.log("Checking why its zero",Tezos.rpc)

                var balance = await Tezos.tz.getBalance(accountPkh);
                if (balance) {
                    if (typeof balance == 'string') {
                        balance = parseFloat(balance) / 1000000;
                    } else {
                        balance = balance.toNumber() / 1000000;
                    }
                }
                let tzstats = 'https://carthagenet.tzstats.com/';
                if (this.state.config.DEBUG)
                    console.log('Thanos - TzStats', balance);
                if (
                    this.state.status != 'ready' ||
                    this.state.balance != balance
                ) {
                    let update = {
                        status: 'ready',
                        balance: balance,
                        Tezos: Tezos,
                        tzstats: tzstats,
                        account: accountPkh
                    };
                    this.setState(update, () => {
                        this.props.onUpdate(this.state);
                    });
                }
            } catch (e) {
                console.log(e);
            }
        }
    }


    render() {
        let thanos = 'loading.';
        if (this.props.config.hide) {
            thanos = [];
        }
        else if (this.state.status == 'loading') {
            thanos = (
                <a target="_blank" href="https://thanoswallet.com/">
                    <span style={this.state.config.textStyle}>loading...</span>
                    <img
                        style={{ maxHeight: 45, padding: 5, verticalAlign: 'middle' }}
                        src={logo}
                    />
                </a>
            );
        } else if (this.state.status == 'ready') {
            let requiredNetworkText = '';
            for (let n in this.state.config.requiredNetwork) {
                if (this.state.config.requiredNetwork[n] != 'unknown' && this.state.config.requiredNetwork[n] != '') {
                    if (requiredNetworkText != '') requiredNetworkText += 'or ';
                    requiredNetworkText += this.state.config.requiredNetwork[n] + ' ';
                }
            }
            let balance = '';
            if (this.state.config.showBalance) {
                balance =
                Math.round(this.state.balance * this.state.config.ETHPRECISION) /
                this.state.config.ETHPRECISION;
            }

            const ln = this.state.account.length;
            let displayName = `${this.state.account.slice(0, 7)}...${this.state.account.slice(ln - 4, ln)}`;

            thanos = (
                <div style={this.state.config.boxStyle}>
                    <a
                        target="_blank"
                        href={this.state.tzstats + this.state.account}
                    >
                        <div>
                            <span style={this.state.config.textStyle}>{displayName}</span>
                        </div>
                        <div>
                            <span style={this.state.config.textStyle}>
                                <img
                                    style={{
                                        maxHeight: 24,
                                        padding: 2,
                                        verticalAlign: 'middle',
                                        marginTop: -4
                                    }}
                                    src={eth}
                                />
                                {balance}
                            </span>
                        </div>
                        <div
                            style={{
                                position: 'absolute',
                                right: this.state.config.blockieStyle.right,
                                top: this.state.config.blockieStyle.top
                            }}
                            onClick={this.clickBlockie}
                        >
                            <Blockies
                                seed={this.state.account}
                                scale={this.state.config.blockieStyle.size}
                            />
                        </div>
                    </a>
                </div>
            );
        } else {
            thanos = 'error unknown state: ' + this.state.status;
        }

        return (
            <div style={this.state.config.outerBoxStyle}>
                <Scaler config={{ origin: 'top right', adjustedZoom: 1.5 }}>
                    {thanos}
                </Scaler>
            </div>
        );

    }
}
export default Thanos;
