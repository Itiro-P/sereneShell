pragma Singleton
import QtQuick

QtObject {
    // Spacing (escala consistente, tipo 4/8/12/16/24/32)
    readonly property int spacingXs: 4
    readonly property int spacingS: 8
    readonly property int spacingM: 12
    readonly property int spacingL: 16
    readonly property int spacingXl: 24
    readonly property int spacingXxl: 32

    // Radius
    readonly property int radiusS: 6
    readonly property int radiusM: 10
    readonly property int radiusL: 16
    readonly property int radiusFull: 9999   // pills / círculos

    // Padding (interno de botões, chips, etc)
    readonly property int paddingS: 4
    readonly property int paddingM: 10
    readonly property int paddingL: 14
    readonly property int paddingXl: 16

    // Tamanhos de ícone (comum ter vários contextos diferentes)
    readonly property int iconXs: 14
    readonly property int iconS: 18
    readonly property int iconM: 22
    readonly property int iconL: 28
    readonly property int iconXl: 40

    // Alturas de componentes comuns
    readonly property int barHeight: 36
    readonly property int buttonHeight: 34
    readonly property int sliderHeight: 6
    readonly property int sliderHandleSize: 16
    readonly property int switchWidth: 40
    readonly property int switchHeight: 22

    readonly property int popupWidth: 340
    readonly property int quickSettingsWidth: 380
    readonly property int sidebarWidth: 300
    readonly property int imagePreviewWidth: 280
    readonly property int imagePreviewHeight: 160
    
    readonly property int borderThin: 1
    readonly property int borderThick: 2

    readonly property int shadowRadius: 24
    readonly property real shadowOpacity: 0.35
    readonly property int shadowOffsetY: 4

    readonly property int durationFast: 100
    readonly property int durationNormal: 180
    readonly property int durationSlow: 300
    readonly property int easingType: Easing.OutCubic

    readonly property real opacityDisabled: 0.4
    readonly property real opacityHover: 0.08
    readonly property real opacityPressed: 0.16

    readonly property int fontXs: 10
    readonly property int fontS: 12
    readonly property int fontM: 14
    readonly property int fontL: 16
    readonly property int fontXl: 20
    readonly property string fontFamily: "Noto Sans Regular"

}