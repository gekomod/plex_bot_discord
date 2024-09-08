#!/bin/bash

LOGFILE="bot.log"

function start {
    echo "Starting Discord Bot..." >> $LOGFILE
    node index.js >> $LOGFILE 2>&1 &
    echo $! > bot.pid
}

function restart {
    echo "Restarting Discord Bot..." >> $LOGFILE
    kill $(cat bot.pid)
    start
}

function status {
    if [ -f bot.pid ]; then
        echo "Bot is running with PID: $(cat bot.pid)" >> $LOGFILE
    else
        echo "Bot is not running." >> $LOGFILE
    fi
}

function save {
    echo "Saving information..." >> $LOGFILE
}

case "$1" in
    start)
        start
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    save)
        save
        ;;
    *)
        echo "Usage: $0 {start|restart|status|save}"
        exit 1
        ;;
esac
