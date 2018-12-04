#!/bin/sh

[ -d "node_modules" ] || npm install

node index.js iplist
