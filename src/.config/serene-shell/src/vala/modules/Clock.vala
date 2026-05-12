[GtkTemplate(ui="/com/github/itiro-p/serene-shell/modules/Clock.ui")]
public class Clock: Gtk.Box {
    public string clock { get; set; }
    public string date { get; set; }
    public bool reveal_date { get; set; default = false; }
    uint interval;

    private string timeFormatter = "%H:%M";
    private string dateFormatter = "Hoje é: %A, %d de %B de %Y";

    construct {
        clock = new DateTime.now_local().format(this.timeFormatter);
        date = new DateTime.now_local().format(this.dateFormatter);
        interval = Timeout.add(1000, () => {
            clock = new DateTime.now_local().format(this.timeFormatter);
            date = new DateTime.now_local().format(this.dateFormatter);
            return Source.CONTINUE;
        }, Priority.DEFAULT);
    }

    public override void dispose() {
        Source.remove(interval);
        base.dispose();
    }

    [GtkCallback]
    private void on_hover_enter() {
        this.reveal_date = true;
    }

    [GtkCallback]
    private void on_hover_leave() {
        this.reveal_date = false;
    }
}