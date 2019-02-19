# BeatTheStreet_UK
UK version of beat the street game.




AWS Lambda function, for use on Alexa platform. Using Node.js 8.10

index.js - this is the lambda function.

When installing, set the following environment var:
environment variblae 'AppConfig'

value = { 		"TargetEndPoint" : { 
                      "host" : "https://beatthestreet.me", 				
                      "port" : 443, 				
                      "uri"  : "/api/CheckCard", 				
                      "usr"  : "", 				
                      "pwd"  : "", 				
                      "debug": false 			
                      }, 		
                   "Players" :  { 				
                      "<players name>" :"?schemeId=63&cardnumber=<cardno.>&_=1537337103397", 				
                      <players name>" : "?schemeId=63&cardnumber=<cardno.>&_=1537337103397" 			} 	
        }
                        
Besure to set the <playersname> and the <cardno>.
  
  
  
Alexa Skills Portal : https://developer.amazon.com/alexa/
Invocation Name: beat the street
Interfaces:  default 
Endpoint: AWS LAMBDA - put your skill id in the relevant regions.
Intents: Standard
         SCORE
            Utterances: 'how are we doing', 'score', 'score please','what are my scores'
            
JSON: {
    "interactionModel": {
        "languageModel": {
            "invocationName": "beat the street",
            "intents": [
                {
                    "name": "AMAZON.FallbackIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.CancelIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.HelpIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.StopIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.NavigateHomeIntent",
                    "samples": []
                },
                {
                    "name": "SCORE",
                    "slots": [],
                    "samples": [
                        "how are we doing",
                        "score",
                        "scores please",
                        "what are my scores"
                    ]
                }
            ],
            "types": []
        }
    }
}
