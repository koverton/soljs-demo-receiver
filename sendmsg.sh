#!/bin/bash
cd `dirname $0`

if [ "$#" -lt 2 ]; then
	echo "	USAGE: $0 <host-port> text ..."
	echo "		<host-port> in the form 192.168.1.100:55555"
	echo "		<text> arbitrary sequence of text to be sent"
	echo ""
	exit 1
fi
vmr=$1
msg=${@:2}
topic="hey"

echo "$msg" > msg.txt
# curl -X POST -d @msg.txt $URL/TOPIC/$topic -H "content-type: text"
sdkperf_java.sh -cip=$vmr -ptl=$topic -pal=`pwd`/msg.txt -mn=1000 -pto
