// Requires javascript modules:
//      paho-mqtt/1.0.1/mqttws31.js
//
// Requires the following HTML elements:
//      <input id=inputHost>
//      <p id=connDetails></p>
//      <p id=subDetails></p>
//
// Requires the following CSS styles in style.css
//      .connectionInfo : sets fontography for connection info display

var PahoConn = (function() {

    // - + - + - + - + - + - + - + - + - + - + - + - + -
    //   Member variables
	// - + - + - + - + - + - + - + - + - + - + - + - + -
	// ws://192.168.56.201, ws://mr85s7y8ur59.messaging.solace.cloud:20259
	var context = {
	    sess: null,
        hostString: 'localhost',
        hostPort: 8000,
        clientUsername: 'default',
        clientPassword: 'default',
        topic: 'hey',
        sendMsgs: false,
	    color: 'green',
        timerId: -1
	}


    // - + - + - + - + - + - + - + - + - + - + - + - + -
    //   Public Interface UI-invoked functions
    // - + - + - + - + - + - + - + - + - + - + - + - + -
	
	var onConnect = function (ctx) {
		for( var k in ctx ) {
		    context[k] = ctx[k]
		}
		context.urlList = context.hostString
		createSession()
		connectSession()
	}

	var onDisconnect = function () {
		disconnectSession()
		document.getElementById('connDetails').innerHTML = ''
		document.getElementById('subDetails').innerHTML = ''
		clearTimeout(context.timerId) // stops any periodic msg-sender
	}

    var toggleSender = function(cb) {
        context.sendMsgs = cb.checked
    }

	// - + - + - + - + - + - + - + - + - + - + - + - + -
    //   Private internally-invoked functions
	// - + - + - + - + - + - + - + - + - + - + - + - + -

	// STATIC MESSAGE EVENT CALLBACK
	function onMessage(msg) {
		var text = msg.payloadString
		if ( text == null ) {
			text = 'Gak!'
		}
		context.callback( text )
	}

	// STATIC SESSION EVENT CALLBACKS
	function onConnected() {
		// Once a connection has been made, make a subscription and start sending
		console.log( "onConnect" )
		addSub( context.topic )
		schedSend()
	}

	function onConnectionLost(resp) {
		if ( resp.errorCode !== 0 ) {
			console.log( "onConnectionLost:" + resp.errorMessage )
			clearTimeout( context.timerId )
		}
	}

    function schedSend() {
        if( context.sendMsgs && context.sess !== null ) {
            // Send logic
			msg = new Paho.MQTT.Message(context.color)
			msg.destinationName = context.topic
            try {
                context.sess.send( msg )
            }
            catch (error) {
                logError( "Failure publishing msg", error )
            }
        }
        // ALWAYS set timer for recursive call, in case they disable/re-enable sender
        context.timerId = setTimeout( schedSend, 1000 )
    }


    // - + - + - + - + - + - + - + - + - + - + - + - + -
    //   Private Internal functions
    // - + - + - + - + - + - + - + - + - + - + - + - + -
	
	function createSession() {
	    if ( context.sess !== null ) {
	        logMsg( "SKIPPING: Session SEEMS to be already created.")
	        return
	    }
		logMsg( "CONNECTING to URL:" + context.urlList
					+ ",USER:" + context.clientUsername )
		try {
			context.sess = new Paho.MQTT.Client( 
				context.urlList, Number(context.hostPort), context.clientUsername
			)
			context.sess.onConnectionLost = onConnectionLost
			context.sess.onMessageArrived = onMessage
		}
		catch(error) {
			logError( "createSession", error )
		}
	}

	function connectSession() {
		try {
			context.sess.connect( { onSuccess:onConnected } )
		}
		catch(error) {
			logError( "connectSession", error )
		}
	}

	function disconnectSession() {
		try {
			context.sess.disconnect()
			context.sess = null
		}
		catch(error) {
			logError( "disconnectSession", error )
			context.sess = null
		}
	}

	function addSub(sub) {
		logMsg( "SUBSCRIBE: " + sub )
		try {
			context.sess.subscribe( sub )
			document.getElementById('connDetails').innerHTML = 'I am connected to ' + context.urlList
			document.getElementById('subDetails').innerHTML = 'I am subscribed to ' + sub
		}
		catch(error) {
			logError( "addSub", error )
		}
	}


    // - + - + - + - + - + - + - + - + - + - + - + - + -
    //  LOGGING
	// - + - + - + - + - + - + - + - + - + - + - + - + -
	
	function logMsg(msg) {
		console.log(msg)
	}

	function logError(fname, err) {
		// First format and log the error
		var subcodeStr = ( err.subcode==null ? "no subcode" : err.subcode.toString() )

		var msg = "ERROR IN "+fname+"\n"+"Subcode("
			+ subcodeStr  + ") "
			+ "Msg:{" + err.message + "} Reason:{" + err.reason + "}\n"

		logMsg(msg)

		// Then log the stack-trace
		if ( err.stack != null ) {
			logMsg( "STACK:" + err.stack.toString() )
		}
	}


	return {
	    toggleSender : toggleSender,
		onConnect    : onConnect,
		onDisconnect : onDisconnect
	}
})();
