// Requires javascript modules:
//      solclient-full.js
//
// Requires the following HTML elements:
//      <input id=inputHost>
//      <p id=connDetails></p>
//      <p id=subDetails></p>
//
// Requires the following CSS styles in style.css
//      .connectionInfo : sets fontography for connection info display

var SolConn = (function() {

    // - + - + - + - + - + - + - + - + - + - + - + - + -
    //   Member variables
	// - + - + - + - + - + - + - + - + - + - + - + - + -
	// ws://192.168.56.201, ws://mr85s7y8ur59.messaging.solace.cloud:20259
	var context = {
	    urlList: [ 'ws://192.168.56.201','ws://192.168.56.202' ],
	    sess: null,
        hostString: 'localhost',
        msgVpnName: 'default',
        clientUsername: 'default',
        clientPassword: 'default',
        topic: 'hey',
        sendMsgs: false,
        timerId: -1
	}


    // - + - + - + - + - + - + - + - + - + - + - + - + -
    //   Public Interface UI-invoked functions
    // - + - + - + - + - + - + - + - + - + - + - + - + -
	
	var onConnect = function (ctx) {
		for( var k in ctx ) {
		    context[k] = ctx[k]
		}

		var factoryProps = new solace.SolclientFactoryProperties()
		factoryProps.logLevel = solace.LogLevel.DEBUG
		solace.SolclientFactory.init( factoryProps )

		connectSolace( context.hostString )
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
	
	function connectSolace(destUrl) {
		context.urlList = destUrl.split(',')
		createSession()
		connectSession()
	}

	// STATIC MESSAGE EVENT CALLBACK
	function onMessage(sess, msg) {
		var container = msg.getSdtContainer()
		var text = null
		if ( container != null ) {
			text = container.getValue()
		}
		else {
			text = msg.getBinaryAttachment()
		}
		if ( text == null ) {
			text = 'Gak!'
		}
		context.callback( text )
	}

	// STATIC SESSION EVENT CALLBACK
	function onSessionEvt(session, evt) {
		logMsg( 'session event: ' + JSON.stringify(evt) )
		if ( evt.sessionEventCode == solace.SessionEventCode.UP_NOTICE ) {
			addSub( context.topic )
			schedSend()
		}
		else if ( evt.sessionEventCode == solace.SessionEventCode.DOWN_NOTICE ) {
		clearTimeout(context.timerId)
		}
	}

    function schedSend() {
        if( context.sendMsgs && context.sess !== null ) {
            // Send logic
            var msg = solace.SolclientFactory.createMessage()
            msg.setDestination( solace.SolclientFactory.createTopicDestination(context.topic) )
            try {
                context.sess.send( msg )
                logMsg( 'Message published.' )
            } catch (error) {
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
					+ ",VPN:" + context.msgVpnName
					+ ",USER:" + context.clientUsername )
		try {
			context.sess = solace.SolclientFactory.createSession( {
                url: context.urlList,
                userName: context.clientUsername,
                vpnName: context.msgVpnName,
                password: context.clientPassword,
                generateReceiveTimestamps: true,
                reapplySubscriptions: true
			},
            new solace.MessageRxCBInfo(onMessage),
            new solace.SessionEventCBInfo(onSessionEvt) )
		}
		catch(error) {
			logError( "createSession", error )
		}
	}

	function connectSession() {
		try {
			context.sess.connect()
		}
		catch(error) {
			logError( "connectSession", error )
		}
	}

	function disconnectSession() {
		try {
			context.sess.disconnect()
			context.sess.dispose()
			context.sess = null
		}
		catch(error) {
			logError( "disconnectSession", error )
		}
	}

	function addSub(sub) {
		logMsg( "SUBSCRIBE: " + sub )
		try {
			var topic = solace.SolclientFactory.createTopic(sub)
			context.sess.subscribe( topic, true, sub, 3000 )
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
