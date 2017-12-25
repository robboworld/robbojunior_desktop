#!/bin/bash

user_desktop=`su $1 xdg-user-dir DESKTOP`
rm -f $user_desktop/junior.desktop
