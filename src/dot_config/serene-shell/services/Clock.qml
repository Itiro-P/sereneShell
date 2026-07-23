pragma Singleton

import Quickshell
import QtQuick

Singleton {
  	id: root

  	readonly property string time: {
    	Qt.formatTime(clock.date, "hh:mm")
  	}

  	readonly property string date: {
    	Qt.formatDate(clock.date, Locale.LongFormat)
  	}

  	SystemClock {
    	id: clock
    	precision: SystemClock.Minutes
	}
}