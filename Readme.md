# chai aur backend series 
This is a backend project with javascript



<!-- nodemon is a utility -->

# whenever the file save after making changes it automatically restart the server
# It is a dev dependency means it is used during the development phase not during the production phase.

# lecture 8 backend 
<!-- custom api defining classes for 
custom api and reason -->
<!-- custom error -->

<!-- CORS -->
# Allow us to do settings for  cross origin resource sharing - It is a security feature implemented by web browsers that controls how web pages in one domain can request resources from another domain. It’s like a safety gate that prevents potentially harmful cross-origin requests unless explicitly allowed.

<!-- Cookie parser -->
# The cookie-parser npm package is a middleware used in Node.js, specifically with the Express.js framework. Its main function is to parse the cookies attached to the client request object (req.cookies), making it easier to read and work with cookies in server-side applications.

<!-- infor about middlewars and req and res -->

# when someone hit any url then server get request to send response but before that there is something which first check user is authorized to get such response back or not

# example : on hitting url /instagram user first asked : logged in or not ? before receiving data from server 
# that in between check if user is logged in : is middleware

# we can put another middleware or multiple middlewares : like check if user is admin ?
# we can control moving of user from one checking to another check by use "next" (it is like a flag to check)

# ex: (err , req , res , next)   next -> we talking about middleware


# making a wrapper which is generally used so that whenever we need
# to use such wrapper we will pass function in that wrapper and then it will execute our function and return it : making asynHandler in utils

# using cloudinary to upload file  and will learn how to use Multer package in backend for file upload instead of express fileupload

  # Note:- 
    isliked is just a normal flag variable in JS im using here to toggle the like and its value store
    in data field in apiresponse which we return to frontend

    req.params :- is used to identify which resource

    --> req.params from the URL path itself
        for ex:- router.post("/videos/:videoId/like", toggleVideoLike)

        Request URL looks like this with videoId :
           
         POST /videos/64fabc123/like
     

    
      req.body :-   is used to send data to change that resource
      
     --> req.body is extra data sent with the request(usually JSON)

       It used when :-
       
          * creating something 
          * updating content
          * sending form Data
     
