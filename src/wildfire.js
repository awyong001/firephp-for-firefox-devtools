
const EVENTS = require("eventemitter2");


var API = module.exports = new EVENTS();
API.console = console;
API.BROWSER = browser;
API.WILDFIRE = require("wildfire-for-js");

const REQUEST_OBSERVER = require("./adapters/http-request-observer").for(API);
const RESPONSE_OBSERVER = require("./adapters/http-response-observer").for(API);



API.on.chromeLoggerMessage = function (message) {
    
//    console.log("Chrome Logger LOG MESSAGE ::", message);

    API.emit("message.chromelogger", message);
}
    
API.on.insightMessage = function (message) {

//    console.log("LOG MESSAGE to insightMessage ::", message);

    API.emit("message.insight", message);
    
//		console.log("DECODED", JSON.parse(message.getMeta()), message.getData());
//consoleWidget1.loader.callApi("console.log.firephp", [JSON.parse(message.getMeta()), message.getData()]);
}
API.on.firePHPMessage = function (message) {

//    console.log("LOG MESSAGE to firePHPMessage ::", message);

//    console.log("DECODED", message.getMeta(), message.getData());

    API.emit("message.firephp", message);

    //console.log("DECODED", JSON.parse(message.getMeta() || "{}"), message.getData());

        
//var encoder = ENCODER.Encoder();
//var og = encoder.encode(message.getData(), {}, {});
//consoleWidget1.loader.callApi("console.log.firephp", [JSON.parse(message.getMeta()), og]);
}
API.on.transport = function (info) {

    API.emit("message.transport", info);
    
//console.log("make backend request", JSON.stringify(info, null, 4));

/*
var jqxhr = JQUERY.ajax({
"method": "POST",
"url": info.url,
crossDomain: true,
headers: info.headers,
data: {
payload: JSON.stringify(info.payload)
}
}).done(function (data) {

//console.log("SUCCESS DATA", data);

RECEIVERS_EXPORTS.parseReceived(data);


}).fail(function (jqXHR, textStatus) {

console.error("REQUEST ERROR", jqXHR, textStatus);
});
*/
}



function isEnabled () {
    return true;
}


var httpHeaderChannel = API.httpHeaderChannel = API.WILDFIRE.HttpHeaderChannel({
    "enableTransport": false,
    onError: function (err) {
        console.error("HttpHeaderChannel error:", err);
        API.emit("error", err);
    }
});
httpHeaderChannel.setNoReceiverCallback(function(id) {
    API.console.error("trying to log to unknown receiver (extension): " + id);
});


// TODO: Load dynamically
require("./receivers/firephp").for(API);
require("./receivers/insight").for(API);


var announceDispatcher = API.WILDFIRE.Dispatcher();
announceDispatcher.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/announce/0.1.0');
announceDispatcher.setChannel(httpHeaderChannel);

function getAnnounceMessageForRequest (request) {

    if (!getAnnounceMessageForRequest._forHostnames) {
        getAnnounceMessageForRequest._forHostnames = {};
    }
    var cache = getAnnounceMessageForRequest._forHostnames;

    // TODO: Don't just use `request.hostname` for cache.
    // TODO: If config changes this announceMessage needs to be reset

    if (cache[request.hostname]) {
        return cache[request.hostname];
    }

    cache[request.hostname] = new API.WILDFIRE.Message();
    cache[request.hostname].setData(JSON.stringify({
        // TODO: Populate crypto-based key
        "authkey": "mykey",
        "receivers": httpHeaderChannel.receivers.map(function (receiver) {
            return receiver.getId();
        })
    }));

    return cache[request.hostname];
}

REQUEST_OBSERVER.register(function (request) {
    if (!isEnabled()) return;

    var headers = {};
    request.headers.forEach(function (header) {
        headers[header.name] = header.value;
    });

    if (!headers["User-Agent"].match(/\sFirePHP\/([\.|\d]*)\s?/)) {
        request.setRequestHeader("User-Agent", headers["User-Agent"] + " FirePHP/0.5");
    }

/*        

    // NOTE: Do NOT set this header. This only works with FirePHPCore 0.3.2 and most users are using
    //       FirePHPCore 0.3.1. If someone does not want their user-agent modified they should use FirePHP 1.0 with DeveloperCompanion
    //       and disable the 'extensions.devcomp.firePHPCoreCompatibility' option.
    // request.httpChannel.setRequestHeader("X-FirePHP-Version", "0.4", false);

    var announceMessage = getAnnounceMessageForRequest(request);
    if (announceMessage) {
        // dispatch announce message
        announceDispatcher.dispatch(announceMessage);

        // flush channel
        httpHeaderChannel.flush({
            setMessagePart: function(name, value) {
                request.httpChannel.setRequestHeader(name, value, false);
            },
            getMessagePart: function(name) {
                if (request.httpChannel.getRequestHeader) {
                    return null;
                }
                // HACK: Do not use exception for flow control
                try {
                    return request.httpChannel.getRequestHeader(name);
                } catch (err) {
                    return null;
                }
            }
        });
    } else {
        // TODO: Use a proper unique ID + counter.
        request.httpChannel.setRequestHeader("x-request-id", ""+(new Date().getTime()) + "" + Math.floor(Math.random()*1000+1), false);
    }

    // API.console.log("REQUEST", request);
*/
});

API.on("http.response", function (response) {
    if (!isEnabled()) return;

console.log("RESPONSE IN EXTENSION2345!!!", response);

    var chromeLoggerMessage = response.headers.filter(function (header) {
        return (header.name === "X-ChromeLogger-Data");
    });
    if (chromeLoggerMessage.length > 0) {
        chromeLoggerMessage.forEach(function (header) {
            try {

                // @see https://craig.is/writing/chrome-logger/techspecs
                var message = decodeURIComponent(escape(atob(header.value)));
                message = JSON.parse(message);
                
                API.on.chromeLoggerMessage(message);
            } catch (err) {
                console.error("header", header);
                console.error("Error processing message:", err);
            }
        });
    } else {

    //dump("RESPONSE IN EXTENSION2", response);
    //console.log("RESPONSE IN EXTENSION4", response);
        httpHeaderChannel.parseReceived(response.headers, {
            "id": response.request.id,
            "url": response.request.url,
            "hostname": response.request.hostname,
            "port": response.request.port,
            "method": response.request.method,
            "status": response.status,
            "contentType": response.contentType,
            "requestHeaders": response.request.headers
        });
    }

});
