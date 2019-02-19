/**
 * 
 */
'use strict';

const VERSION = '10.0';
var IOC_OBJ ;

const getContent = function(url) {
	  
	  console.log(`getContent ${url}`);
	  return new Promise((resolve, reject) => {
	    
	    const lib = url.startsWith('https') ? require('https') : require('http');
	    const request = lib.get(url, (response) => {
	      // handle http errors
	      if (response.statusCode < 200 || response.statusCode > 299) {
	         reject(new Error('Failed to load page, status code: ' + response.statusCode));
	       }
	      // temporary data holder
	      const body = [];
	      // on every content chunk, push it to the data array
	      response.on('data', (chunk) => body.push(chunk));
	      // we are done, resolve promise with those joined chunks
	      response.on('end', () => resolve(body.join('')));
	    });
	    // handle connection errors of the request
	    request.on('error', (err) => reject(err))
	    })
	};	

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `SessionSpeechlet - ${title}`,
            content: `SessionSpeechlet - ${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------
function getErrResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Err';
    const speechOutput = 'its gone wrong';
    const repromptText = 'do what you gotta';
    const shouldEndSession = true;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}
function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = 'Welcome to Beat The Street for the Bury house hold!!!';
    const repromptText = 'Would you like me to get your scores?';
    const shouldEndSession = true;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Now get out and Beat The Street';
    const shouldEndSession = true;
    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}


/**
 * Sets the color in the session and prepares the speech to reply to the user.
 */
function getBTSScoreIsabelle(intent, session, callback) {
    
    let html = "";
    let err = "";
    getContent(`${IOC_OBJ.TargetEndPoint.host}:${IOC_OBJ.TargetEndPoint.port}${IOC_OBJ.TargetEndPoint.uri}${IOC_OBJ.Players.isabelle}`)
    .then((html) => hndlBTSREsponseIsabelle(intent,session,callback,html))
    .catch((err) => console.error(err));
    console.log('getBTSScore - done');
}

function getBTSScoreParent(intent, session, callback, isabelleData) {
    console.log(`getBTSScoreParent - open`);
    let html = "";
    let err = "";
    getContent(`${IOC_OBJ.TargetEndPoint.host}:${IOC_OBJ.TargetEndPoint.port}${IOC_OBJ.TargetEndPoint.uri}${IOC_OBJ.Players.parent}`)
    .then((html) => hndlBTSREsponseParent(intent,session,callback,isabelleData,html))
    .catch((err) => console.error(err));
    
  
         
    console.log('getBTSScoreParent - done');
}


function hndlBTSREsponseIsabelle  (intent, session, callback, data){
    console.log(`hndlBTSREsponseIsabelle - open ${data}`);
    let jsonData = JSON.parse(data);
    
    getBTSScoreParent(intent, session, callback, jsonData);
     
    console.log('hndlBTSREsponseIsabelle - end');
}

function hndlBTSREsponseParent  (intent, session, callback,isabelleData, data){
    console.log(`hndlBTSREsponseParent - open ${isabelleData} and ${data}`);
    let repromptText = '';
    let sessionAttributes = {};
    let shouldEndSession = true;
    const cardTitle = 'score';
    
    let parentData = JSON.parse(data);
    
    let speechOutput = `Isabelle, you have collected ${isabelleData.TotalPoints} points. Mum & Dad, you have collected ${parentData.TotalPoints} points. You have collected in total, ${parentData.TotalPoints + isabelleData.TotalPoints} for your school.`;
    
    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    console.log('hndlBTSREsponseParent - end');
}


// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);
    console.log('intentRequest');
    console.log(JSON.stringify(intentRequest));
    
    console.log('session');
    console.log(JSON.stringify(session));
    const intent = intentRequest.intent;
    const intentName = 'SCORE'//intentRequest.intent.name ;

    // Dispatch to your skill's intent handlers
    if (intentName === 'SCORE') {
        getBTSScoreIsabelle(intent, session, callback);
    } else if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        getErrResponse(callback);
       // throw new Error('Invalid intent');
        
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`Version:${VERSION} event.session.application.applicationId=${event.session.application.applicationId}`);
        IOC_OBJ = JSON.parse( process.env.AppConfig );
        console.log(`application config ${JSON.stringify(IOC_OBJ)}`);
        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             callback('Invalid Application ID');
        }
        */

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
