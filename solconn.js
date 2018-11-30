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
	var urlList = [ 'ws://192.168.56.201','ws://192.168.56.202' ]
	var context = null
	var sess = null


    // - + - + - + - + - + - + - + - + - + - + - + - + -
    //   Public Interface UI-invoked functions
    // - + - + - + - + - + - + - + - + - + - + - + - + -
	
	var onConnect = function (ctx) {
		context = ctx
		var factoryProps = new solace.SolclientFactoryProperties()
		factoryProps.logLevel = solace.LogLevel.DEBUG
		solace.SolclientFactory.init(factoryProps)

		connectSolace( context.hostString )
	}

	var onDisconnect = function () {
		disconnectSession()
		document.getElementById('connDetails').innerHTML = ''
		document.getElementById('subDetails').innerHTML = ''
	}

	// - + - + - + - + - + - + - + - + - + - + - + - + -
    //   Private internally-invoked functions
	// - + - + - + - + - + - + - + - + - + - + - + - + -
	
	function connectSolace(destUrl) {
		urlList = destUrl.split(',')
		createSession()
		connectSession()
	}

	// STATIC MESSAGE EVENT CALLBACK
	function message_cb(sess, msg) {
		var container = msg.getSdtContainer()
		var text = null
		if (container != null) {
			text = container.getValue()
		}
		else {
			text = msg.getBinaryAttachment()
		}
		if (text == null) {
			text = 'Gak!'
		}
		context.callback( text )
	}

	// STATIC SESSION EVENT CALLBACK
	function session_cb(session, evt) {
		log_msg('session event: ' + JSON.stringify(evt))
		log_msg('ses = ' + sess)
		log_msg('session = ' + session)
		if (evt.sessionEventCode == solace.SessionEventCode.UP_NOTICE ) {
			addSub(context.topic)
		}
	}


    // - + - + - + - + - + - + - + - + - + - + - + - + -
    //   Private Internal functions
    // - + - + - + - + - + - + - + - + - + - + - + - + -
	
	function createSession() {
		var props = new solace.SessionProperties()
		props.url = urlList // [ 'ws://192.168.56.201','ws://192.168.56.202' ]
		props.userName = context.clientUsername
		props.vpnName  = context.msgVpnName
		props.password = context.clientPassword
		props.generateReceiveTimestamps = true
		props.reapplySubscriptions = true
		log_msg("CONNECTING to URL:" + props.url 
					+ ",VPN:" + props.vpnName 
					+ ",USER:" + props.userName)
		try {
			sess = solace.SolclientFactory.createSession(props,
							new solace.MessageRxCBInfo(message_cb),
							new solace.SessionEventCBInfo(session_cb))
		}
		catch(error) {
			log_error("createSession", error)
		}
	}

	function connectSession() {
		try {
			sess.connect()
		}
		catch(error) {
			log_error("connectSession", error)
		}
	}

	function disconnectSession() {
		try {
			sess.disconnect()
			sess.dispose()
			sess = null;
		}
		catch(error) {
			log_error("disconnectSession", error)
		}
	}

	function addSub(sub) {
		log_msg("SUBSCRIBE: " + sub)
		try {
			var topic = solace.SolclientFactory.createTopic(sub)
			sess.subscribe(topic, true, sub, 3000)
			document.getElementById('connDetails').innerHTML = 'I am connected to ' + urlList
			document.getElementById('subDetails').innerHTML = 'I am subscribed to ' + sub
		}
		catch(error) {
			log_error("addSub", error)
		}
	}


    // - + - + - + - + - + - + - + - + - + - + - + - + -
    //  LOGGING
	// - + - + - + - + - + - + - + - + - + - + - + - + -
	
	function log_msg(msg) {
		console.log(msg)
	}

	function log_error(fname, err) {
		// First format and log the error
		var subcode_str = (err.subcode==null ? "no subcode" : err.subcode.toString());
		var msg = "ERROR IN "+fname+"\n"+"Subcode("
			+ subcode_str  + ") "
			+ "Msg:{" + err.message + "} Reason:{" + err.reason + "}\n";
		log_msg(msg);
		// Then log the stack-trace
		if (err.stack != null) {
			log_msg("STACK:"+err.stack.toString());
		}
	}


	return {
		onConnect    : onConnect,
		onDisconnect : onDisconnect
	}
})();
