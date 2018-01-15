var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");


var userSchema = new mongoose.Schema({
	username: String,
	password:String
});


//Be sure to add this line... this will add all passport methods to our UserSchema so we can handle login and etc.
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);  