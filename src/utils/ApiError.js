class ApiError extends Error {   // Error is the inbuilt class of node api errors
    
    constructor(
        statusCode,
        message = "something went wrong",
        errors= [],  // if want to give multiple errors
        stack = "" // error stack else keep empty
     ){

        // overriding details we get actual in api errors
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false   // we sending api errors not response so making flag false
        this.errors = errors


        if(stack) {  // to keep the trace in which files there is a problem
           this.stack = stack;
        } else{
            Error.captureStackTrace(this,this.constructor)
        }
     }
}


export {ApiError}