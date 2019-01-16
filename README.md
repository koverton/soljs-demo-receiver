# soljs-demo-receiver
Simple Solace PubSub+ Javascript demo page with HTML5 visualization
representing Solace PubSub+ message events.

This package provides a basic animation that executes every
time a Solace message is received. The top-level pages contains a frameset that
can be used to test bridging/routing over two Solace PubSub+ brokers.

The animation is a simple bouncing 'dot' from the Solace logo that provides
a simple visual indication that a message has been received. It does not
display any of the message contents.


## Connecting a browser session

Just enter the hostname or IP-address for your web-socket connection, appending
':<port>' it is something other than standard port 80. Modify any of the
values for msg-VPN, username and password as appropriate.

The page will display text indicating it is connected and subscribed.

## Sending messages to your browser session

Your browser can send messages to itself if you check the box to 'Send messages'.
Or there is a `sendmsg.sh` script for sending messages
on the default topic. The script takes one argument indicating the 
host/IP-address for connectivity, and the rest of the commandline will be the 
text message sent repeatedly, once per second.

The script depends upon the Solace SDKPerf-Java tool, and expects the 
`sdkperf_java.sh` script to be on your user's PATH. If this is not the case, 
either add the tool to your PATH or modify the script to point to the proper 
`sdkperf_java.sh` location.

## Demoing a PubSub+ bridge

Load either of the top-level HTML files into your browser locally 
(`bounceDemo.html`). They do not
need to be served via a webserver. It will display two web-pages in different 
frames. Each page can create a distinct PubSub+ connection and consume messages.

Connect each page to a different PubSub+ broker that you want to bridge 
together and begin sending messages to one of the brokers.

Navigate to the Web-SolAdmin GUI for one of the PubSub+ brokers, select the 
default Msg-VPN and then the 'Bridges' section. Use 'Click-to-Connect' to 
bridge that broker to the other PubSub+ broker and add your default `hey` 
subscription to the bridge.

You should see messages arriving on both web-pages.
