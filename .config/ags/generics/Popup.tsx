import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { createState, Accessor, createEffect, Setter, onCleanup } from "ags";
import Graphene from "gi://Graphene?version=1.0";

type PopupProps = JSX.IntrinsicElements["window"] & {
    openGetter: Accessor<boolean>;
    openSetter: Setter<boolean>;
    onHide?: () => void;
    transitionType?: Gtk.RevealerTransitionType;
    transitionDuration?: number;
};

export function Popup({
   transitionType = Gtk.RevealerTransitionType.SLIDE_DOWN,
   transitionDuration = 400,
   halign = Gtk.Align.CENTER,
   valign = Gtk.Align.CENTER,
   children,
   openGetter,
   openSetter,
   onHide,
   ...windowProps
}: PopupProps) {
    let contentBox!: Gtk.Box;

    const [visible, setVisible] = createState(false);
    const [revealed, setRevealed] = createState(false);

    createEffect(() => {
        const isOpen = openGetter();
        setVisible(isOpen);
        setRevealed(isOpen);
    });

    function requestClose() {
        openSetter(false);
        onHide?.();
    }

    return (
        <window
            {...windowProps}
            visible={visible}
            application={app}
            layer={Astal.Layer.OVERLAY}
            keymode={Astal.Keymode.ON_DEMAND}
            $={self => onCleanup(() => self.destroy())}
        >
            <Gtk.EventControllerKey
                onKeyPressed={(_, keyval) => {
                    if (keyval === Gdk.KEY_Escape) requestClose();
                }}
            />

            <Gtk.GestureClick
                exclusive
                onPressed={({ widget }, _, x, y) => {
                    if (!contentBox) return;

                    const [, rect] = contentBox.compute_bounds(widget);
                    const point = new Graphene.Point({ x, y });

                    if (_ && !rect.contains_point(point)) requestClose();
                }}
            />

            <revealer
                revealChild={revealed}
                transitionType={transitionType}
                transitionDuration={transitionDuration}
                halign={halign}
                valign={valign}
                onNotifyChildRevealed={({ childRevealed }) => { if(childRevealed) contentBox?.grab_focus?.() }}
            >
                <box $={self => contentBox = self} children={children} />
            </revealer>
        </window>
    );
}
