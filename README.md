# soljs-demo-receiver
Simple Solace PubSub+ Javascript demo pages with HTML5 visualizations
representing Solace PubSub+ message events.

This package provides two different basic animations that execute every
time a Solace message is received. The top-level pages contain a frameset that
can be used to test bridging/routing over two Solace PubSub+ brokers.

There are two simple animations: one is a bouncing 'dot' from the Solace logo, 
the other is a silly cartoon bird that displays a speech balloon with the message
text on each new message.

## Default Assumptions

The default implementation assumes you are connecting to the `default` Solace 
Msg-VPN via the `default` client-username. The default implementations also 
currently publish and subscribe to the topic `hey`.

## Connecting a browser session

Just enter the hostname or IP-address for your web-socket connection, appending
':<port>' it is something other than standard port 80.

The page should display text indicating it is connected and subscribed.

## Sending messages to your browser session

There is a `sendmsg.sh` script for sending messages 
on the default topic. The script takes one argument indicating the 
host/IP-address for connectivity, and the rest of the commandline will be the 
text message sent repeatedly, once per second.

The script depends upon the Solace SDKPerf-Java tool, and expects the 
`sdkperf_java.sh` script to be on your user's PATH. If this is not the case, 
either add the tool to your PATH or modify the script to point to the proper 
`sdkperf_java.sh` location.

## Demoing a PubSub+ bridge

Load either of the top-level HTML files into your browser locally 
(`bounceDemo.html` or `squawkDemo.html`). They do not 
need to be served via a webserver. It will display two web-pages in different 
frames. Each page can create a distinct PubSub+ connection and consume messages.

Connect each page to a different PubSub+ broker that you want to bridge 
together and begin sending messages to one of the brokers via the 
`sendmsg.sh` script.

Navigate to the Web-SolAdmin GUI for one of the PubSub+ brokers, select the 
default Msg-VPN and then the 'Bridges' section. Use 'Click-to-Connect' to 
bridge that broker to the other PubSub+ broker and add your default `hey` 
subscription to the bridge.

You should see messages arriving on both web-pages.
