#!/bin/bash
# tools/try.sh "k e10 ... / K d1 ..." [độ sâu]  -> vẽ bàn và cho máy giải
cd "$(dirname "$0")/.."
F=$(echo "x | $1" | python3 tools/mk.py | cut -f2)
node tools/show.js "$F"; echo "$F"
printf 'x\t%s\n' "$F" > /tmp/try.tsv
python3 tools/probe.py /tmp/try.tsv ${2:-16} | tail -n +2
