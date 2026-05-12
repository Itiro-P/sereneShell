class App : Gtk.Application {
    public static App instance;
    private bool active = false;

    public void ensure_types() {
        typeof (Audio).ensure ();
        typeof (Battery).ensure ();
        typeof (Bar).ensure ();
        typeof (BackgroundPlayer).ensure ();
        typeof (Cava).ensure ();
        typeof (Client).ensure ();
        typeof (Clock).ensure ();
        typeof (Mpris).ensure ();
        typeof (QuickSettings).ensure ();
        typeof (Tray).ensure ();
        typeof (Workspace).ensure ();
        typeof (Workspaces).ensure ();
    }

    private const OptionEntry[] options = {
        { "version", 'v', OptionFlags.NONE, OptionArg.NONE, null, "Show version and exit", null },
        { "quit", 'q', OptionFlags.NONE, OptionArg.NONE, null, "quit the application", null },
        { "inspector", 'i', OptionFlags.NONE, OptionArg.NONE, null, "open the GTK inspector", null },
        { "close", 'c', OptionFlags.NONE, OptionArg.STRING_ARRAY, null, "closes a window", null },
        { "show", 's', OptionFlags.NONE, OptionArg.STRING_ARRAY, null, "shows a window", null },
        { "toggle", 't', OptionFlags.NONE, OptionArg.STRING_ARRAY, null, "toggles a window", null },
        { null }
    };

    private void put_window(Astal.Window window, Gdk.Monitor monitor) {
        window.present();
        monitor.invalidate.connect(() => window.destroy());
    }

    public override int command_line(ApplicationCommandLine command_line) {
        this.hold();
        activate();

        VariantDict cmd_options = command_line.get_options_dict();

        if (cmd_options.contains("quit")) {
            quit();
        }

        if (cmd_options.contains("inspector")) {
            Gtk.Window.set_interactive_debugging(true);
        }

        var windows = new HashTable<string, Gtk.Window>(str_hash, str_equal);
        foreach (var win in this.get_windows()) {
            windows.insert(win.name, win);
        }

        foreach (var name in cmd_options.lookup_value("close", VariantType.STRING_ARRAY)?.get_strv()) {
            var win = windows.lookup(name);
            if (win == null) {
                command_line.print("window %s could not be found.\n", name);
            } else {
                win.visible = false;
            }
        }

        foreach (var name in cmd_options.lookup_value("show", VariantType.STRING_ARRAY)?.get_strv()) {
            var win = windows.lookup(name);
            if (win == null) {
                command_line.print("window %s could not be found.\n", name);
            } else {
                win.visible = true;
            }
        }

        foreach (var name in cmd_options.lookup_value("toggle", VariantType.STRING_ARRAY)?.get_strv()) {
            var win = windows.lookup(name);
            if (win == null) {
                command_line.print("window %s could not be found.\n", name);
            } else {
                win.visible = !win.visible;
            }
        }

        command_line.set_exit_status(0);
        command_line.done();
        this.release();
        return 0;
    }

    public override void activate() {
        if(active) return;
        ensure_types();
        base.activate();

        var display = Gdk.Display.get_default();
        Gtk.IconTheme.get_for_display(display)
                .add_resource_path("/com/github/itiro-p/serene-shell/assets");

        var provider = new Gtk.CssProvider();
        provider.load_from_resource("/com/github/itiro-p/serene-shell/styles/style.css");
        Gtk.StyleContext.add_provider_for_display(
            display,
            provider,
            Gtk.STYLE_PROVIDER_PRIORITY_USER
        );

        var mons = display.get_monitors();
        for (var i = 0; i < mons.get_n_items(); ++i) {
            var monitor = (Gdk.Monitor)mons.get_item(i);
            if (monitor != null) {
                put_window(new Bar(monitor), monitor);
                put_window(new BackgroundPlayer(monitor), monitor);
            }
        }

        mons.items_changed.connect((p, r, a) => {
            display.sync();
            for (; a > 0; a--) {
                var monitor = (Gdk.Monitor)mons.get_item(p++);
                put_window(new Bar(monitor), monitor);
                put_window(new BackgroundPlayer(monitor), monitor);
            }
        });

        this.hold();
        active = true;
    }

    construct {
        instance = this;
        flags = ApplicationFlags.HANDLES_COMMAND_LINE;
    }

    static int main(string[] argv) {
        Adw.init();
        var app = (App)Object.@new(
        typeof(App),
        "application-id", "org.serene-shell.serene-shell"
        );
        return app.run(argv);
    }
}
