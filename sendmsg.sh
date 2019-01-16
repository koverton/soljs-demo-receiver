#!/bin/bash
cd `dirname $0`

vmr=192.168.56.201
url="http://$vmr"
msg=heyheyhey
topic="hey"

echo "$msg" > msg.txt
# while [ 1 ]; do sleep 1; curl -X POST -d @msg.txt $url/TOPIC/$topic -H "content-type: text"; done
sdkperf_java.sh -cip=$vmr -ptl=$topic -pal=`pwd`/msg.txt -mn=100000
