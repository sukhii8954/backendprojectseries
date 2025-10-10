import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"; // for hashing passwords
import jwt from "jsonwebtoken"; // for creating JWT tokens


//  Note:
// direct encryption is not possible so we take help of hooks of mongoose
// pre hook is used to encrypt the password before saving the user data


const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // to improve search performance for username in database
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true, // to improve search performance for fullname in database
    },

    avatar: {
      type: String, // cloudinary image URL
      required: true,
    },
    coverImage: {
      type: String, // cloudinary image URL
    },

    // this is  dependent on the videos as we store id of videos users will watch in this history as watchHistory
    watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    // KEEPING PASSWORD  as encrypted here
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    // here we gonna talk about the refresh token
    refreshToken: {
      type: String,
    },
  },

  {
    timestamps: true, // to automatically manage createdAt and updatedAt fields
  }
);
// on which event we want to run this function we write in brackets
// we can't use arrow function here as it does have 'this' context in it
// we need  access of written in userSchema so we use normal function
// we using async because it takes time for encryption 
// we using middlerware flag next , so that we can pass this flag forward at the end of this function to have access of next function.

// we only save the password only if there is change in password otherwise don't save the password again

userSchema.pre("save", async function (next) {
  // checking if password is not modified we run next function
  if(!this.isModified("password")) return next();
  
  // if it is modified then we hash the password
  this.password = await bcrypt.hash(this.password, 10); // 10 is the hash rounds
  next(); // call next middleware means :Passes control to the next middleware function so saving can continue.
})

// making custom methods , just like  we get (updateOne , deleteOne)  in types of document middleware

//after methods. we can add many methods of our own also 
// here  we are checking the password with bcrypt
// when this function is called , user will pass string password which is compared to encrypted password

// making our own custom method ex: isPasswordCorrect is a property and writing method in it
userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password , this.password)  // this compare returns true or false 
}

// using jwt sign to generate access token and assigning its expiry date also
userSchema.methods.generateAccessToken =function(){
return jwt.sign(
    {
      _id:this._id,
      email: this.email,
      username:this.username,
      fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}


userSchema.methods.generateRefreshToken =function(){
  return jwt.sign(
    {
      _id:this._id,

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}


export const User = mongoose.model("User", userSchema);

// note:- 
    // refreshToken is a way to keep the user logged in securely without forcing them to log in again every 15 minutes. 
    // (which JWT token forces user to do every 15 minutes as it JWT token expires within 15 mins or an hour).
    // It’s like a backup key stored in the DB to give them new access tokens.
    // Server saves the refresh token in the refreshToken field of your User model.
    // When the user logs out, we delete this refresh token.
    // When the user logs in, we generate a new refresh token and save it in the DB.
    // When the user wants to get a new access token, they send this refresh token to the server.
    // The server checks if it’s valid and not expired, then gives them a new access token.


    // Notes:

    //  bcrypt we used here for hashing the password 
    //  bcrypt is a core node.js library that helps us hash passwords securely.
    // jsonwebtoken is used to create and verify JWT tokens. 
    // It is having 3 main functions:
    // 1) It inject header by default, which contains the algo used and type of token which is JWT.
           // It uses HS256 algorithm by default, and the algoithm is called crytographic alogorithm.

    // 2) It injects payload (fancy name of data) which contains the data we want to store in the token.
    // 3) the signature which is used to verify the token later. 
    // Additional 4th) the most important thing is secret base32 which makes every token unique and secure.
