import { onCleanup } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app";

function Entry({ bind, action }: { bind: string, action: string }) {
    return (
        <box cssClasses={['Entry']} overflow={Gtk.Overflow.HIDDEN} homogeneous>
            <label cssClasses={["Bind"]} label={bind} />
            <label cssClasses={["Action"]} label={action} />
        </box>
    );
}

export default function Cheatsheet({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {

    return (
        <window
            name='Cheatsheet'
            layer={Astal.Layer.OVERLAY}
            gdkmonitor={gdkmonitor}
            application={app}
            $={(self) => onCleanup(() => self.destroy())}
        >
            <box cssClasses={['Cheatsheet']} orientation={Gtk.Orientation.VERTICAL}>
                <label cssClasses={['Title']} label={'Cheatsheet'} />
                <box cssClasses={['Half']} homogeneous>
                    <box cssClasses={['Section']} orientation={Gtk.Orientation.VERTICAL}>
                        <label cssClasses={["Subtitle"]} label={"Gestão de Clientes"} />
                        <box orientation={Gtk.Orientation.VERTICAL}>
                            <Entry bind="SUPER + P" action="Fixar cliente" />
                            <Entry bind="SUPER + Q" action="Fechar programa" />
                            <Entry bind="SUPER + V" action="Flutuar a tela" />
                            <Entry bind="SUPER + F" action="Forçar tela cheia" />
                            <Entry bind="SUPER + J" action="Dividir em Dwindle" />
                            <Entry bind="SUPER + " action="Mover foco para janela acima" />
                            <Entry bind="SUPER + " action="Mover foco para janela abaixo" />
                            <Entry bind="SUPER + " action="Mover foco para janela à esquerda" />
                            <Entry bind="SUPER + " action="Mover foco para janela à direita" />
                        </box>
                    </box>
                    <box cssClasses={['Section']} orientation={Gtk.Orientation.VERTICAL}>
                        <label cssClasses={["Subtitle"]} label={"Gestão de Workspaces"} />
                        <box orientation={Gtk.Orientation.VERTICAL}>
                            <Entry bind="CTRL + SUPER + " action="Ir para Workspace à esquerda" />
                            <Entry bind="CTRL + SUPER + " action="Ir para Workspace à direita" />
                            <Entry bind="CTRL + SHIFT + SUPER + " action="Mover para Workspace à esquerda" />
                            <Entry bind="CTRL + SHIFT + SUPER + " action="Mover para Workspace à direita" />
                            <Entry bind="SUPER + S" action="Ir para Workspace especial" />
                            <Entry bind="SUPER + SHIFT + S" action="Mover para workspace especial" />
                        </box>
                    </box>
                </box>
                <box cssClasses={['Half']} homogeneous>
                    <box cssClasses={['Section']} orientation={Gtk.Orientation.VERTICAL}>
                        <label cssClasses={["Subtitle"]} label={"Programas padrão"} />
                        <box orientation={Gtk.Orientation.VERTICAL}>
                            <Entry bind="SUPER + Enter" action="Terminal" />
                            <Entry bind="SUPER + R" action="Lançador de aplicativos" />
                            <Entry bind="SUPER + E" action="Abrir Gerenciador de Arquivos" />
                            <Entry bind="SUPER + D" action="Abrir/Fechar Dock" />
                            <Entry bind="SUPER + C" action="Abrir/Fechar Cheatsheet" />
                            <Entry bind="SUPER + ESC" action="Abrir/fechar Wlogout" />
                        </box>
                    </box>
                    <box cssClasses={['Section']} orientation={Gtk.Orientation.VERTICAL}>
                        <label cssClasses={["Subtitle"]} label={"Outros"} />
                        <box orientation={Gtk.Orientation.VERTICAL}>
                            <Entry bind="PRINT" action="Capturar tela" />
                            <Entry bind="SUPER + PRINT" action="Capturar região" />
                            <Entry bind="SUPER + M" action="Fechar sessão" />
                            <Entry bind="SUPER + L" action="Bloquear a tela" />
                        </box>
                    </box>
                </box>
            </box>
        </window>
    );
}
