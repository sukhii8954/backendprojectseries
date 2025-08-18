import mongoose, { Schema } from "mongoose";

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
    fullname: {
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