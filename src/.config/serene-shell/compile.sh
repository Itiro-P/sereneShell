#!/bin/bash

meson setup build --wipe --prefix "$(pwd)/result"
meson install -C build