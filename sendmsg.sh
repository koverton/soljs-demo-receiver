#!/bin/bash
cd `dirname $0`

vmr=192.168.56.201
msg=heyheyhey
topic="hey"

echo "$msg" > msg.txt
# curl -X POST -d @msg.txt $URL/TOPIC/$topic -H "content-type: text"
sdkperf_java.sh -cip=$vmr -ptl=$topic -pal=`pwd`/msg.txt -mn=100000
