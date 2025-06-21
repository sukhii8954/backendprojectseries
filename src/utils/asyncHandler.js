// method 1:
// promises method : envoking promise manually
const asyncHandlerprom = (requestHandler) => {
    (req, res, next) => {   // return new fn: express middleware style
    Promise
    .resolve(requestHandler(req, res, next)) // Runs the original async fn and wraps it inside 
    .catch((err) => next(err)); // if async fn throws err it get in this catch - central error handler
  };
};

export { asyncHandler };

// higher order func: which accepts other func as a parameter
// const {asyncHandler} = (fn) => () => {}
// const {asyncHandler} = (fn) => async () => {}  // making it async
// above func can also be written as:
// const {asyncHandler} = (fn) => {() => {}}
//  : just passsing another callback function within another function

// Method 2:
// Wrapper written below:
//  extracting req,res and next from passed function:

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next); // executing function which we pass in this
  } catch (error) {
    // passing response and status : error code if user has passed or hard code ex: 500
    //  passing json response -> success flag to help frontend : false or true
    res.status(error.code || 500).json({
      success: false,
      message: error.message, // error msg passed
    });
  }
};
