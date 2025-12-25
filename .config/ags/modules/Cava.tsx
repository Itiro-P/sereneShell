import { Gtk } from "ags/gtk4";
import Gsk from 'gi://Gsk';
import GObject from 'gi://GObject';
import { Accessor, createEffect } from "ags";
import { cavaService } from "../services";

class CavaWidget extends Gtk.DrawingArea {
    private valuesAccessor: Accessor<number[]>;

    constructor(v: Accessor<number[]>) {
        super();
        this.set_hexpand(true);
        this.set_vexpand(true);
        this.valuesAccessor = v(v => {
            const height = this.get_allocated_height();
            return v.map(i => height * (1 - i));
        });
        createEffect(() => {
            this.valuesAccessor();
            this.queue_draw();
        });
    }

    override vfunc_snapshot(snapshot: Gtk.Snapshot): void {
        if (!this.get_mapped()) return;

        try {
            if (!this.visible) return;

            const width = this.get_allocated_width();
            const height = this.get_allocated_height();

            if (width <= 0 || height <= 0) return;

            const values = this.valuesAccessor.peek();

            if (values.length === 0) return;

            const barWidth = width / (values.length - 1);
            const color = this.parent.get_color();
            const builder = new Gsk.PathBuilder();
            builder.move_to(0, values[0]);
            const invSix = 1 / 6;

            for (let i = 0; i < values.length - 1; i++) {
                const p0x = (i - 1) * barWidth;
                const p0y = values[Math.max(0, i - 1)];
                const p1x = i * barWidth;
                const p1y = values[i];
                const p2x = (i + 1) * barWidth;
                const p2y = values[i + 1];
                const p3x = (i + 2) * barWidth;
                const p3y = values[Math.min(values.length - 1, i + 2)];

                const c1x = p1x + (p2x - p0x) * invSix;
                const c1y = p1y + (p2y - p0y) * invSix;
                const c2x = p2x - (p3x - p1x) * invSix;
                const c2y = p2y - (p3y - p1y) * invSix;

                builder.cubic_to(c1x, c1y, c2x, c2y, p2x, p2y);
            }

            builder.line_to(width, height);
            builder.line_to(0, height);
            builder.close();

            snapshot.append_fill(builder.to_path(), Gsk.FillRule.WINDING, color);
        } catch (error) {
            console.warn("Erro no snapshot do Cava:", error);
        }
    }
}

const _cava = GObject.registerClass({ GTypeName: 'Cava' }, CavaWidget);

export namespace Cava {
    export function Visualizer({ cssClasses }: { cssClasses: string[] }) {
        return (
            <box
                cssClasses={[...cssClasses, "Cava"]}
                overflow={Gtk.Overflow.HIDDEN}
                halign={Gtk.Align.FILL}
            >
                {new _cava(cavaService.values)}
            </box>
        );
    }
}
