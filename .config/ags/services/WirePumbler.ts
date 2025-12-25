import { Accessor, createBinding } from "ags";
import AstalWp from "gi://AstalWp?version=0.1";

class WirePumblerClass {
    private _default: AstalWp.Wp;
    private _defaultSpeaker: Accessor<AstalWp.Endpoint>;
    private _defaultMicrophone: Accessor<AstalWp.Endpoint>;
    private _devices: Accessor<AstalWp.Device[]>;
    private _nodes: Accessor<AstalWp.Node[]>;
    private _audio: Accessor<AstalWp.Audio>;
    private _video: Accessor<AstalWp.Video>;

    public constructor() {
        this._default = AstalWp.get_default();
        this._defaultSpeaker = createBinding(this._default, "defaultSpeaker");
        this._defaultMicrophone = createBinding(this._default, "defaultMicrophone");
        this._devices = createBinding(this._default, "devices");
        this._nodes = createBinding(this._default, "nodes");
        this._audio = createBinding(this._default, "audio");
        this._video = createBinding(this._default, "video");
    }

    public get defaultSpeaker() {
        return this._defaultSpeaker;
    }

    public get defaultMicrophone() {
        return this._defaultMicrophone;
    }

    public get devices() {
        return this._devices;
    }

    public get nodes() {
        return this._nodes;
    }

    public get audio() {
        return this._audio;
    }

    public get video() {
        return this._video;
    }
}

export const wirePumblerService = new WirePumblerClass();
