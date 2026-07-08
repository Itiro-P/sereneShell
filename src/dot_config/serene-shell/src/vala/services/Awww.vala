namespace Awww {
    public enum Resize {
        NO, CROP, FIT, STRETCH;

        public string to_string() {
            switch (this) {
                case NO: return "no";
                case CROP: return "crop";
                case FIT: return "fit";
                case STRETCH: return "stretch";
                default: assert_not_reached();
            }
        }
    }

    public enum Filter {
        NEAREST, BILINEAR, CATMULLROM, MITCHELL, LANCZOS3;

        public string to_string() {
            switch (this) {
                case NEAREST: return "Nearest";
                case BILINEAR: return "Bilinear";
                case CATMULLROM: return "CatmullRom";
                case MITCHELL: return "Mitchell";
                case LANCZOS3: return "Lanczos3";
                default: assert_not_reached();
            }
        }
    }

    public enum TransitionType {
        NONE, SIMPLE, FADE, LEFT, RIGHT, TOP, BOTTOM, WIPE, WAVE, GROW, CENTER, ANY, RANDOM;

        public string to_string() {
            switch (this) {
                case NONE: return "none";
                case SIMPLE: return "simple";
                case FADE: return "fade";
                case LEFT: return "left";
                case RIGHT: return "right";
                case TOP: return "top";
                case BOTTOM: return "bottom";
                case WIPE: return "wipe";
                case WAVE: return "wave";
                case GROW: return "grow";
                case CENTER: return "center";
                case ANY: return "any";
                case RANDOM: return "random";
                default: assert_not_reached();
            }
        }
    }

    public enum TransitionPos {
        CENTER, TOP, LEFT, RIGHT, BOTTOM, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT;

        public string to_string() {
            switch (this) {
                case CENTER: return "center";
                case TOP: return "top";
                case LEFT: return "left";
                case RIGHT: return "right";
                case BOTTOM: return "bottom";
                case TOP_LEFT: return "top-left";
                case TOP_RIGHT: return "top-right";
                case BOTTOM_LEFT: return "bottom-left";
                case BOTTOM_RIGHT: return "bottom-right";
                default: assert_not_reached();
            }
        }
    }

    public struct WaveConfig {
        public double x;
        public double y;
    }

    public class ParserOptions : GLib.Object {
        public Resize? resize = null;
        public Filter? filter = null;
        public TransitionType? transition_type = null;
        public TransitionPos? transition_pos = null;
        public string? outputs = null;
        public int transition_step = 0;
        public double transition_duration = 0;
        public double transition_angle = 0;
        public bool invert_y = false;
        public WaveConfig? transition_wave = null;
    }

    public errordomain AwwwError {
        COMMAND_FAILED,
    }

    public class Manager : GLib.Object {
        private static Manager? _default;

        public static Manager get_default() {
            if (_default == null) {
                _default = new Manager();
            }
            return _default;
        }

        private Manager() {}

        private async string run_command(string[] argv) throws Error {
            // Garante terminador NULL, já que arrays vindos de Gee/runtime não vêm terminados
            var null_terminated = new string[argv.length + 1];
            for (int i = 0; i < argv.length; i++) {
                null_terminated[i] = argv[i];
            }
            null_terminated[argv.length] = null;

            var subprocess = new GLib.Subprocess.newv(
                null_terminated,
                GLib.SubprocessFlags.STDOUT_PIPE | GLib.SubprocessFlags.STDERR_PIPE
            );

            string stdout_buf;
            string stderr_buf;
            yield subprocess.communicate_utf8_async(null, null, out stdout_buf, out stderr_buf);

            if (!subprocess.get_successful()) {
                throw new AwwwError.COMMAND_FAILED(
                    "Command failed: %s\n%s".printf(string.joinv(" ", argv), stderr_buf)
                );
            }

            return stdout_buf;
        }

        public async string? check_last_wallpaper(string connector) {
            try {
                var output = yield run_command({"awww", "query", "--json"});

                var parser = new Json.Parser();
                parser.load_from_data(output);

                var root = parser.get_root().get_object();
                if (!root.has_member("")) return null;

                var monitors = root.get_array_member("");
                foreach (var node in monitors.get_elements()) {
                    var obj = node.get_object();
                    if (obj.get_string_member("name") == connector) {
                        if (obj.has_member("displaying")) {
                            var displaying = obj.get_object_member("displaying");
                            if (displaying.has_member("image")) {
                                return displaying.get_string_member("image");
                            }
                        }
                        break;
                    }
                }
                return null;
            } catch (Error e) {
                warning("Failed to get wallpaper: %s", e.message);
                return null;
            }
        }

        public async bool set_wallpaper(string path, ParserOptions options) {
            if (path == "") return false;

            var argv = new Gee.ArrayList<string>();
            argv.add("awww");
            argv.add("img");
            argv.add(path);

            if (options.resize != null) { argv.add("--resize"); argv.add(options.resize.to_string()); }
            if (options.filter != null) { argv.add("-f"); argv.add(options.filter.to_string()); }
            if (options.invert_y) argv.add("--invert-y");
            if (options.transition_angle != 0) {
                argv.add("--transition-angle"); argv.add(options.transition_angle.to_string());
            }
            if (options.transition_duration != 0) {
                argv.add("--transition-duration"); argv.add(options.transition_duration.to_string());
            }
            if (options.transition_pos != null) {
                argv.add("--transition-pos"); argv.add(options.transition_pos.to_string());
            }
            if (options.transition_step != 0) {
                argv.add("--transition-step"); argv.add(options.transition_step.to_string());
            }
            if (options.transition_type != null) {
                argv.add("--transition-type"); argv.add(options.transition_type.to_string());
            }
            if (options.transition_wave != null) {
                argv.add("--transition-wave");
                argv.add("%g,%g".printf(options.transition_wave.x, options.transition_wave.y));
            }
            if (options.outputs != null) { argv.add("--outputs"); argv.add(options.outputs); }

            try {
                yield run_command({ "matugen", "image", path, "--source-color-index", "0" });
                yield run_command(argv.to_array());
                return true;
            } catch (Error e) {
                warning("Failed to process: %s\n%s", e.message, string.joinv(" ", argv.to_array()));
                return false;
            }
        }
    }
}