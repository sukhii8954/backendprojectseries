class ApiResponse {
    constructor(statusCode, data, message = "success")
    {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400  // making the success flag as true if statuscode <400 in frontend as it shows positive response 
        // this line is just a convenient shortcut to determine if a response should be treated as a success based on the HTTP status code
    }
}
export { ApiResponse }