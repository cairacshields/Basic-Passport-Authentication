var mongoose              = require("mongoose"),
	express               = require("express"),
	User				  = require("./models/user"), 
	bodyParser            = require("body-parser"),
	passport              = require("passport"),
	LocalStrategy         = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	expressSessions       = require("express-session"),
	app		              = express();


//Connect to DB
mongoose.connect("mongodb://localhost/auth_demo");


//Setup App configurations
app.set("view engine", "ejs");
app.use(expressSessions({secret:"I am the greatest", resave:false, saveUninitialized:false}));
app.use(bodyParser.urlencoded({extended:true})); 
app.use(passport.initialize());
app.use(passport.session());

//Set up LocalStrategy, serialization and deserialization using passport
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser ());
passport.deserializeUser(User.deserializeUser());




//Start of routes.....

app.get("/", function(req, res){
	res.render("home");
});

//Note that this route has Middleware, the isLoggedIn function will run before the callback function
//This will ensure that the user trying to view "secret" is logged in
app.get("/secret", isLoggedIn ,function(req, res){
	res.render("secret");
});

// =======          AUTH ROUTES            ======


//Register Routes 
	//Show register form
app.get("/register", function(req, res){
	res.render("register");
});

	//Registration logic
app.post("/register", function(req, res){
	//Remember, all the form data is stored in req.body, so we need to have body-parser 
	//Now we can get the form data and begin creating a new user using passport.js

	// ** Note that we are using the User model to call a passport function called '.register'
	// ** We then start by adding a NEW user to the DB but ONLY passing in the username
	// ** This is for security reasons, and then we pass in the password as the second parameter
	// ** Lastly, we use a callback function to see if there was an error 
	// ** If there was no error, we go on to authenticate the newly signed up user.
	User.register(new User({username: req.body.username}), req.body.password, function(error, user){
		if(error){
			console.log(error);
			//If there is an error, we are going to stop the process by using the 'return' statement and showing the register form again
			return res.render("register");
		} 
		//The below code will log the new user in and then take them somewhere.
		passport.authenticate("local")(req, res, function(){
			res.redirect("/secret");
		});

	});
});

//Login routes

	//Show login form
app.get("/login", function(req, res){
	res.render("login");
});

	//Login logic
		// ** Note that we are using Middleware (code that runs before the final callback)
app.post("/login", passport.authenticate("local", 
	{
		//If the sign in is a success redirect to "/secret"
		successRedirect:"/secret",
		//If the sign in is NOT a sucess, redirect to the "/login" route
		failureRedirect:"/login"
	}),
	
	function(req, res){
  
});


//Logout routes

	//** No form is needed to handle user logouts

app.get("/logout", function(req, res){

	//in order to log a user out, we can simply use the below line of code
	req.logout();
	//Then bring the user back to the login page
	res.redirect("/login");
});




// ******** MIDDLEWARE SECTION ********

	//The below function will be middleware for checking if a user is logged in or not
	//We will need to call this middleware on the '/secret' route, to be sure that 
	// ONLY user who are logged in can view the page 
	//Notice that all middleware function have the same 3 parameters 'req, res, and next'
	//the 'next' parameter is handled by express and is used to call the next function
function isLoggedIn(req, res, next){
	//So we first check if the user is currently logged in using the passport function 'isAuthenticated()'
	if(req.isAuthenticated()){
		//if the user is logged in, we will call 'next()' which calls the next function in line
		return next();
	}
	//if the user is NOT logged in, we will redirect them to the login page
	res.redirect("/login");
}





// ********* END OF MIDDLEWARE SECTION *********


app.get("*", function(req, res){
	res.send("Welcome to NOTHING!");
});

app.listen(3000, function(){
	console.log("I am known as the server and I have started");
});
