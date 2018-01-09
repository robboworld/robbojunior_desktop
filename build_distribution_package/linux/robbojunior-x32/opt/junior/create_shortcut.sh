#!/bin/bash

if (( $# > 0 ))
then
   user_desktop=`su $1 xdg-user-dir DESKTOP`
   cp /usr/share/applications/junior.desktop "$user_desktop"
   chown $1: "$user_desktop/junior.desktop"
   chmod 700 "$user_desktop/junior.desktop"
else
   user_desktop=`xdg-user-dir DESKTOP`
   cp /usr/share/applications/junior.desktop "$user_desktop"
   chmod 700 "$user_desktop/junior.desktop"
fi
