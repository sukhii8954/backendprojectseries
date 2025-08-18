class ApiError extends Error {   // Error is the inbuilt class of node api errors
    
    constructor(
        statusCode,
        message = "something went wrong",
        errors= [],  // if want to give multiple errors
        stack = "" // error stack else keep empty
     ){

        // overriding details we get actual in api errors
        super(message)

      //   extra properties attaching to the error obj

        this.statusCode = statusCode
        this.data = null              //is null since this is an error, not a data response
        this.message = message
        this.success = false         // we sending api errors not response so making flag false
        this.errors = errors
      // Note: super() calls parent class construct(of Error class)
      // without this your error wouldn't behave like real error in Node.js


        if(stack) {  // to keep the trace in which files there is a problem
           this.stack = stack;
        } else{
            Error.captureStackTrace(this,this.constructor)
        }
          //   This helps during debugging—so you can 
          // see exactly where the error happened in your app.
     }
}


export {ApiError}