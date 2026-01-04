import { Accessor, createBinding } from "ags";
import AstalNotifd from "gi://AstalNotifd?version=0.1";

class NotificationsClass {
    private _default: AstalNotifd.Notifd;
    private _notifications: Accessor<AstalNotifd.Notification[]>;
    private _defaultTimeout: Accessor<number>;
    private _dontDisturb: Accessor<boolean>;
    private _ignoreTimeout: Accessor<boolean>;

    public constructor() {
        this._default = AstalNotifd.get_default();
        this._notifications = createBinding(this._default, "notifications");
        this._defaultTimeout = createBinding(this._default, "defaultTimeout");
        this._dontDisturb = createBinding(this._default, "dontDisturb");
        this._ignoreTimeout = createBinding(this._default, "ignoreTimeout");
    }

    public get notifications() {
        return this._notifications;
    }

    public get defaultTimeout() {
        return this._defaultTimeout;
    }

    public get dontDisturb() {
        return this._dontDisturb;
    }

    public get ignoreTimeout() {
        return this._ignoreTimeout;
    }
}

export const notificationsService = new NotificationsClass();
