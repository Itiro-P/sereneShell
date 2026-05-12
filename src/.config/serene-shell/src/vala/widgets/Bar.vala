[GtkTemplate(ui="/com/github/itiro-p/serene-shell/widgets/Bar.ui")]
public class Bar : Astal.Window {
    public AstalNiri.Output output { get; construct set; }


    public Bar(Gdk.Monitor monitor) {
        Object(
            application: App.instance,
            namespace : @"bar",
            name: @"bar-$(monitor.get_connector())",
            css_name: "Bar",
            gdkmonitor: monitor
        );

        var niri = AstalNiri.get_default();
        string connector = monitor.get_connector();

        // Caso o Niri mude os outputs dinamicamente (plugar monitor novo)
        niri.notify["outputs"].connect(() => {
            niri.outputs.@foreach((output) => {
                if(output.name == connector) {
                    this.output = output;
                    return;
                }
            });
        });
    }
}