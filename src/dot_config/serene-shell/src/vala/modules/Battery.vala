[GtkTemplate(ui="/com/github/itiro-p/serene-shell/modules/Battery.ui")]
public class Battery: Gtk.Box {
    public string battery_visible { get; set; }
    public string battery_label { get; set; }
    public string battery_icon { get; set; }
    public string battery_tooltip { get; set; }
    public bool reveal_child_battery { get; set; default = false; }

    construct {
        var bat = AstalBattery.get_default();
        bat.bind_property("is-present", this, "battery-visible", BindingFlags.SYNC_CREATE);
        bat.bind_property("icon-name", this, "battery-icon", BindingFlags.SYNC_CREATE);
        bat.bind_property("percentage", this, "battery-label", BindingFlags.SYNC_CREATE, (_, src, ref target) => {
            target.set_string(@"$(Math.floor(bat.percentage * 100))%");
            return true;
        }, null);
    }

    [GtkCallback]
    private void on_hover_enter() {
        this.reveal_child_battery = true;
    }

    [GtkCallback]
    private void on_hover_leave() {
        this.reveal_child_battery = false;
    }
}