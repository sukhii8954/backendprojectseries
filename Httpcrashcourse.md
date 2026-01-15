# HTTP headers 
->we can find headers in req and as well as in response 
->different req comes get different req headers 

at the end -> headers are the metadata...

metadata -> key-value sent along with req and response
ex: name : sukh
     key - value

* Req headers -> from client
* Resp headers -> from server
* Representation Headers -> encoding /compression
* payload headers -> data  ( ex- _id , email of user  have to send we ref data as payload)

-> caching , authentication , manage state  

# ** Most common headers **                                                        
· Accept : application/json  (commonly accept json type of data)           
· User-Agent (tells from where data is coming from ex :-diff browser )      
· Authorization: (need to send auth token in JWT style in )                 
·Content - Type (images , pdf etc)
· Cookie  (like an object: consist of time till we keep signed in user , unique code etc)
. Cache - Control (when to make data expire ex:- making it expire after 3600sec )


 # ** CORS **
     Access - Control - Allow - Origin  (allowing different origins from where request can come )
     Access - Control - Allow - Credentials  (controlling which credentials are allowed)
     Access - Control - Allow - method (example :- allowing GET method only not POST method )


# ** Security **

Cross-Origin - Embedder - Policy
Cross - Origin-Openes - Policy
Content Policy - Security - 1
X-XSS - Protection


# HTTP methods:-
Basic set of operations that can be used to interact
with server

. GET : retrieve a resource
· HEAD : No message body (response headers only)
· OPTIONS : What operations are available
· TRACE : loopback test (get same data)
· DELETE : remove a resource
· PUT " replace a resource
· POST : interact with resource (mostly add example:- to add new user , new category , new product etc)
· PATCH : change part of a resource


# HTTP Status Code
· 1XX Informational
· IXX Success
· 3xx Redirection
· 4xx Client error
· 5xx Server error


100 Continue            |        
102 Processing          |       400 Bad request
------------------------|       401 Unauthorized
200 Ok                          402 Payment required *(payment related request)
201 created                     404 Not Found  (client trying to access res which not available now)
201 accepted  
----------------------------------------------------------
                                500 Internal Server Error  ( when server gets down sometimes)
307 temporary redirect *        507 Gateway time Out
308 permanent redirect *

