import { Accessor, createBinding, createComputed, createState, For, onCleanup, With } from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";

export default class Bluetooth {
    private static _instance: Bluetooth;
    private default: AstalBluetooth.Bluetooth;
    private mainAdapter: Accessor<AstalBluetooth.Adapter>;

    private devices: Accessor<AstalBluetooth.Device[]>;

    private constructor() {
        this.default = AstalBluetooth.get_default();
        this.mainAdapter = createBinding(this.default, 'adapter');

        this.devices = createBinding(this.default, 'devices');
    }

    public static get instance() {
        if(!this._instance) {
            this._instance = new Bluetooth;
        }
        return this._instance;
    }

    private Device(device: AstalBluetooth.Device) {
        const [reveal, setReveal] = createState(false);
        const revealerClick = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
        const handlerRevealer = revealerClick.connect('pressed', () => setReveal(!reveal.get()));

        const isConnected = createBinding(device, 'connected');
        const isPaired = createBinding(device, 'paired');
        const isConnecting = createBinding(device, 'connecting');
        const isBlocked = createBinding(device, 'blocked');
        const batteryPercent = createBinding(device, 'batteryPercentage');

        const state = createComputed([isConnected, isConnecting, isPaired, isBlocked], (connected, connecting, paired, blocked) => {
            if(blocked) return 'Bloqueado';
            if(!paired) return 'Despareado: Parear?';
            if(connecting) return 'Conectando';
            if(paired && !connected) return 'Pareado: Conectar?';
            if(connected) return 'Conectado: Desconectar?';
            return '';
        });

        const actionClick = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
        const actionHandler = actionClick.connect('pressed', () => {
            if(isBlocked.get()) return;
            if (!isPaired.get()) device.pair();
            if(isConnecting.get()) return;
            if(isPaired.get() && !isConnected.get()) device.connect_device(() => {});
            if(isConnected.get()) device.disconnect_device(() => {});
        });

        onCleanup(() => {
            revealerClick.disconnect(handlerRevealer);
            actionClick.disconnect(actionHandler);
        });

        return (
            <box cssClasses={['Device']} orientation={Gtk.Orientation.VERTICAL} $={self => {self.add_controller(revealerClick)} }>
                <box>
                    <image cssClasses={['Icon']} iconName={createBinding(device, 'icon')} />
                    <box orientation={Gtk.Orientation.VERTICAL} cssClasses={['Info']}>
                        <label cssClasses={['Name']} label={createBinding(device, 'name')} />
                        <label cssClasses={['Address']} label={createBinding(device, 'address')} />
                    </box>
                    <label label={batteryPercent.as(bp => `${bp !== -1 ? `${bp}%` : ''}`)} />
                </box>
                <revealer transitionDuration={250} transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN} revealChild={reveal}>
                    <box orientation={Gtk.Orientation.VERTICAL}>
                        <label label={state} $={self => self.add_controller(actionClick)} />
                        <label label={isBlocked.as(ib => ib ? 'Desbloquear?' : 'Bloquear?')} />
                    </box>
                </revealer>
            </box>
        );
    }

    public get BluetoothPanel() {
        return (
            <With value={this.mainAdapter}>
                {adapter => {
                    const isPowered = createBinding(adapter, 'powered');
                    const isDiscovering = createBinding(adapter, 'discovering');
                    const clickTogglePower = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
                    const handlerTogglePower = clickTogglePower.connect('pressed', () => adapter.set_powered(!adapter.get_powered()));

                    onCleanup(() => clickTogglePower.disconnect(handlerTogglePower));

                    return (
                        <box cssClasses={['BluetoothPanel']} orientation={Gtk.Orientation.VERTICAL}>
                            <label cssClasses={['Subtitle', 'PoweredState']} label={isPowered.as(ip => `Bluetooth: ${ip ? '󰂯' : '󰂲'}`)} />
                            <label
                                cssClasses={['TogglePower']}
                                $={self => self.add_controller(clickTogglePower)}
                                label={isPowered.as(ip => ip ? 'Desligar' : 'Ligar')}
                            />
                            <With value={isPowered}>
                                {ip => {
                                    const clickToggleDiscovery = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
                                    const handlerToggleDiscovery = clickToggleDiscovery.connect('pressed', () => {
                                        if(adapter.get_discovering()) adapter.stop_discovery();
                                        else adapter.start_discovery();
                                    });
                                    onCleanup(() => clickToggleDiscovery.disconnect(handlerToggleDiscovery));
                                    return (
                                        ip ? (
                                            <box orientation={Gtk.Orientation.VERTICAL}>
                                                <label
                                                    cssClasses={['ToggleDiscovery']}
                                                    $={self => self.add_controller(clickToggleDiscovery)}
                                                    label={isDiscovering.as(id => id ? 'Parar' : 'Escanear')}
                                                />
                                                <box orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.CENTER}>
                                                    <For each={this.devices} children={d => this.Device(d)} />
                                                </box>
                                            </box>
                                        ) : (
                                            <label
                                                cssClasses={['ToggleDiscovery']}
                                                label={'Habilite o Bluetooth'}
                                            />
                                        )
                                    );
                                }}
                            </With>
                        </box>
                    );
                }}
            </With>
        );
    }
}
