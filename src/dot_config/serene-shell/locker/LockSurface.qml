import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import Quickshell.Wayland
import QtQuick.Effects

import qs.services
import qs.styles

Rectangle {
	id: root
	required property LockContext context
	readonly property ColorGroup colors: Window.active ? palette.active : palette.inactive

	color: "transparent"

	Image {
		id: bgImage
		anchors.fill: parent
		source: "file://" + Colors.image
		fillMode: Image.PreserveAspectCrop
		asynchronous: true
		cache: true
		visible: false
	}
	
	MultiEffect {
		anchors.fill: bgImage
		source: bgImage
		blurEnabled: true
		blur: 0.6
		blurMax: 32
		brightness: -0.2
	}

	Label {
		id: timeLabel
		anchors {
			horizontalCenter: parent.horizontalCenter
			top: parent.top
			topMargin: 100
		}

		renderType: Text.NativeRendering
		font.pointSize: 80

		text: Clock.time
	}

	Label {
		id: dateLabel
		anchors {
			horizontalCenter: parent.horizontalCenter
			top: timeLabel.top
			topMargin: 120
		}

		renderType: Text.NativeRendering
		font.pointSize: 24

		text: Clock.date
	}

	ColumnLayout {
		anchors {
			horizontalCenter: parent.horizontalCenter
			top: parent.verticalCenter
		}

		RowLayout {
			TextField {
				id: passwordBox

				implicitWidth: 400
				padding: 10

				focus: true
				enabled: !root.context.unlockInProgress
				echoMode: TextInput.Password
				inputMethodHints: Qt.ImhSensitiveData

				color: Colors.md3.on_surface
				placeholderTextColor: Colors.md3.on_surface_variant
				selectionColor: Colors.md3.primary
				selectedTextColor: Colors.md3.on_primary

				renderType: Text.NativeRendering

				background: Rectangle {
					radius: Metrics.radiusS
					color: Colors.md3.surface_container_highest
					border.color: passwordBox.activeFocus
						? Colors.md3.primary
						: Colors.md3.outline
					border.width: passwordBox.activeFocus ? 2 : 1

					Behavior on border.color {
						ColorAnimation { duration: 100 }
					}
				}

				// Update the text in the context when the text in the box changes.
				onTextChanged: root.context.currentText = this.text;

				// Try to unlock when enter is pressed.
				onAccepted: root.context.tryUnlock();

				// Update the text in the box to match the text in the context.
				// This makes sure multiple monitors have the same text.
				Connections {
					target: root.context

					function onCurrentTextChanged() {
						passwordBox.text = root.context.currentText;
					}
				}
			}

			StyledButton {
				text: "Unlock"
				padding: 10

				// don't steal focus from the text box
				focusPolicy: Qt.NoFocus

				enabled: !root.context.unlockInProgress && root.context.currentText !== "";
				onClicked: root.context.tryUnlock();
			}
		}

		Label {
			visible: root.context.showFailure
			text: "Incorrect password"
		}
	}
}
