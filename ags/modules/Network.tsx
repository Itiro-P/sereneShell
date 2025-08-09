import { Accessor, createBinding, createComputed, With } from "ags";
import AstalNetwork from "gi://AstalNetwork?version=0.1";
import NM from "gi://NM?version=1.0";

class NetworkClass {
    private default: AstalNetwork.Network;
    private wifi: Accessor<AstalNetwork.Wifi>;
    private wired: Accessor<AstalNetwork.Wired>;

    public constructor() {
        this.default = AstalNetwork.get_default();
        this.wifi = createBinding(this.default, "wifi");
        this.wired = createBinding(this.default, "wired");
    }

    private formatState(state: NM.ActiveConnectionState) {
        switch(state) {
            case NM.ActiveConnectionState.ACTIVATED:
                return 'Conectado';
            case NM.ActiveConnectionState.ACTIVATING:
                return 'Conectando';
            case NM.ActiveConnectionState.DEACTIVATED:
                return 'Desconectado';
            case NM.ActiveConnectionState.DEACTIVATING:
                return 'Desconectando';
            case NM.ActiveConnectionState.UNKNOWN:
                return 'Desconhecido/Erro';
            default:
                return 'Desconhecido/Erro';
        }
    }

    public get WifiIndicator() {
        return (
            <With value={this.wifi}>
                {
                    wifi => {
                        const activeConnection = createBinding(wifi, 'activeConnection');
                        const connectionState = activeConnection.as(ac => ac !== null ? ac.state: NM.ActiveConnectionState.UNKNOWN);
                        const iconName = createBinding(wifi, 'iconName');
                        const labelStrength = createComputed([createBinding(wifi, 'strength'), createBinding(wifi, 'ssid')], (i, s) => `${s} ${i}%`);
                        return (
                            <box cssClasses={["WifiIndicator"]} tooltipMarkup={connectionState.as(cs => this.formatState(cs))}>
                                <image iconName={iconName} />
                                <label
                                    visible={connectionState.as(cs => cs === NM.ActiveConnectionState.ACTIVATED || cs === NM.ActiveConnectionState.ACTIVATING)}
                                    label={labelStrength}
                                />
                            </box>
                        );
                    }
                }
            </With>
        );
    }

    public get WiredIndicator() {
        return (
            <With value={this.wired}>
                {
                    wired => {
                        const iconName = createBinding(wired, 'iconName');
                        return (
                            <box cssClasses={["WifiIndicator"]}>
                                <image iconName={iconName} />
                            </box>
                        );
                    }
                }
            </With>
        );
    }
}

const network = new NetworkClass;

export default network;
