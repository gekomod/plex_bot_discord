#!/bin/bash

start() {
    node index.js &
    echo "Discord Bot started."
}

restart() {
    pkill -f DiscordBot.js
    start
}

status() {
    if pgrep -f index.js > /dev/null; then
        echo "Discord Bot is running."
    else
        echo "Discord Bot is not running."
    fi
}

case "$1" in
    start) start ;;
    restart) restart ;;
    status) status ;;
    *) echo "Usage: $0 {start|restart|status}" ;;
esac
