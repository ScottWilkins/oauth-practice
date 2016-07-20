## OAuth

A note about this exercise. This is not entirely a "paint by numbers" OAuth exercise. We have left a _little_ room for you to apply the things you already have some experience with:

* routes
* requiring core modules
* middleware
* local environment variables
* deploying to Heroku

What _is_ provided in this exercise is still _way_ friendlier than most OAuth documentation. So, consider this your friendly introduction.

__YOU SHOULD:__

* Read errors in your _server logs_
* Double check environment variables
* Read through the documentation here when you are stuck and see what you missed!
* Google that!

### The basic OAuth2 web flow is:

![](http://41.media.tumblr.com/dc0ed4febc896d5d0589fc2940e52a42/tumblr_mp08klMuDm1qax653o1_1280.jpg)

__Some guiding questions:__

* How does Google / Facebook / LinkedIn etc... communicate with your _local_ web app during development?  Isn't that private (aka not published on the internet)??
* What part of your existing authentication / authorization flows does this replace?
* Why would you want to authenticate with Google / Facebook instead of storing the emails / passwords yourself?

# SET UP

__#1 Create an Express App__

Generate an express app that includes a `.gitignore` file:

```
fork / clone this repo
cd into repo
express --git .
npm install
nodemon
```

Visit http://localhost:3000/ and make sure that the app loads correctly. Then initialize a git repository:

```
git status
git add -A
git commit -m "Initial commit"
git push origin master
```

__#2 Deploy to Heroku__

Create an app on Heroku, deploy to it and verify that your app works on Heroku:

```
heroku apps:create
git push heroku master
heroku open
```

Now that you have a Heroku URL:

1. add your Heroku URL to the README
1. git add, commit and push to Github

__#3 Install and configure dotenv and express-session__

Passport requires that your app have a `req.session` object it can write to. To enable this, install and require `express-session` in `app.js`. In order to keep your secrets safe, you'll need to also install and config `dotenv`. Go to the docs for help with
syntax.

```
npm install dotenv express-session --save
touch .env
echo .env >> .gitignore
```
__#4 In `app.js`, require `express-session` and load dotenv:__

You've seen this a few times now, so I'm going to let you handle adding the
`dotenv` and requiring the `express-session` module.

Using the following commands, add `SESSION_KEY1` and `SESSION_KEY2` to your `.env` and set each value to a randomly generated key:

```sh
echo SESSION_KEY1=$(node -e "require('crypto').randomBytes(48, function(ex, buf) { console.log(buf.toString('hex')) });") >> .env
```
```sh
echo SESSION_KEY2=$(node -e "require('crypto').randomBytes(48, function(ex, buf) { console.log(buf.toString('hex')) });") >> .env
```

Go look in your `.env` file. What happened?


__#5 Add the session middleware to your app:__

```js
// after app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  keys: [process.env.SESSION_KEY1, process.env.SESSION_KEY2],
  secret: 'bam',
  resave: false,
  saveUninitialized: true
 }))
```

Ensure that you app still works locally, then:

1. git add, commit, push to Github
1. deploy to Heroku

__Once you've deployed, be sure to set `SESSION_KEY1` and `SESSION_KEY2` on Heroku__

__EXAMPLE of how to set an environment variable on Heroku:__

```
heroku config:set GITHUB_USERNAME=joesmith
```
Verify that your app still works correctly on Heroku.

__#6 Set a HOST environment variable__

For your app to work both locally and on production, it will need to know what URL it's being served from.  
To do so, add a HOST environment variable to `.env`.

__#1 Set a HOST environment variable locally to your localhost (EXAMPLE: `http://localhost:3000`__

__#2 Set a HOST environment variable on Heroku to your Heroku URL__

NOTE: do _not_ include the trailing slash.  So `https://guarded-inlet-5817.herokuapp.com` instead of `https://guarded-inlet-5817.herokuapp.com/`

There should be nothing to commit at this point.

## Register your LinkedIn Application

1. Login to https://www.linkedin.com/
1. Visit https://www.linkedin.com/developer/apps and create a new app
1. For Logo URL, add your own OR you can past this into your browser and use this one.
You'll have to resize it to be of equal height and width. https://brandfolder.com/galvanize/attachments/suxhof65/galvanize-galvanize-logo-g-only-logo.png?dl=true
1. Under website add your Heroku URL
1. Fill in all other required fields and submit

__On the "Authentication" screen:__

You should see a `Client ID` and `Client Secret`.  Add these to your `.env` file, and set these environment variables on Heroku. Your `.env` file should look like this
(but with real values):

```
SESSION_KEY1=your-secret
SESSION_KEY2=your-secret
HOST=http://localhost:3000
LINKEDIN_CLIENT_ID=your-secret
LINKEDIN_CLIENT_SECRET=your-secret
```
Config those environment variables on Heroku as well.

- Under authorized redirect URLs enter http://localhost:3000/auth/linkedin/callback
- Under authorized redirect URLs enter your Heroku url, plus `/auth/linkedin/callback`

There should be nothing to add to git at this point.

## Install and configure passport w/ the LinkedIn strategy

__#1 Install npm packages `passport` and `passport-linkedin`__

__#2 add the Passport middleware to `app.js`__

```js
// up with the require statements...
var passport = require('passport');

// above app.use('/', routes);
app.use(passport.initialize());
app.use(passport.session());
```

Then tell Passport to use the LinkedIn strategy:

```js
// up with the require statements...
var LinkedInStrategy = require('passport-linkedin').Strategy

// below app.use(passport.session());...
passport.use(new LinkedInStrategy({
    consumerKey: process.env.LINKEDIN_CLIENT_ID,
    consumerSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.HOST + "/auth/linkedin/callback"
  },
  function(token, tokenSecret, profile, done) {
    // To keep the example simple, the user's LinkedIn profile is returned to
    // represent the logged-in user. In a typical application, you would want
    // to associate the LinkedIn account with a user record in your database,
    // and return that user instead (so perform a knex query here later.)
    done(null, profile)
  }
));
```

__Finally, tell Passport how to store the user's information in the session cookie:__

```js
// above app.use('/', routes);...
passport.serializeUser(function(user, done) {
 // later this will be where you selectively send to the browser an identifier for your user, like their primary key from the database, or their ID from linkedin
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  //here is where you will go to the database and get the user each time from it's id, after you set up your db
  done(null, user)
});
```

Run the app locally to make sure that it's still functioning (and isn't throwing any errors).

## Create the auth and oauth-related routes

Create a new route file for your authentication routes:

```
touch routes/auth.js
```

In `routes/auth.js`, you'll need to add a `route for logging in`, and one for `logging out`. In addition, you'll have to create the `route that LinkedIn will call once the user has authenticated properly`:

__#1 route for logging in__

Add a  GET `/auth/linkedin` route that takes a middleware argument of `passport.authenticate('linkedin')`.

__NOTE:__ This route isn't going to respond with a `redirect` or a `render`. It's only job is to call the middleware function. You won't pass in a `callback` function here.

__IT SHOULD LOOK LIKE THIS:__

`router.get('/auth/linkedin', passport.authenticate('linkedin'));`

What else do you need to add to this route file for this function to work?
If you don't know yet, don't worry, you'll get an error telling you all about it
in a little while. When that happens, check your server logs and see if you can fix it!

__#2 In `auth.js` add a route for logging out__

Write a route that handles a `get` request to `/auth/logout`. For now, just redirect
to `'/'`

__#3 Create the route that LinkedIn will call once the user has authenticated properly:__

The route should be a `GET` request to `/auth/linkedin/callback` that takes a middleware
argument of `passport.authenticate('linkedin', { failureRedirect: '/' })`. Inside the route
you will simply `redirect` to `/`.

_See an above route for help passing in the middleware function. You just did this._

__#4 Back in `app.js`, be sure to require your `auth` routes file__

```js
// up with the require statements...
var authRoutes = require('./routes/auth');

// right after app.use('/', routes);
app.use('/', authRoutes);
```

With this setup, you should be able to login with LinkedIn successfully by visiting the following URL directly:

http://localhost:3000/auth/linkedin

If it's successful, you should be redirected to the homepage. If you check your terminal output, you should see a line in there like:

```
GET /auth/linkedin/callback?oauth_token=78--3f284b63-1aff-4eb5-b710-104bae4f5413&oauth_verifier=07507 302 791.066 ms - 58
```

That indicates that LinkedIn successfully authenticated the user.

__IF EVERYTHING IS WORKING, NOW WOULD BE A GOOD TIME TO ADD and COMMIT!__

## Configure the views

__TASK LIST__

* add a `login with LinkedIn` link (What route should that hit?)
  * The `Login with LinkedIn` link should _not_ be displayed if a user is logged in
* add a `logout` link
  * The `logout` link should _only_ be displayed if a user is logged in
* display the name of the currently logged-in user


__NOTE:__

To do this part, you'll need to access some of the information LinkedIn gave to
you when the user successfully logged in. Check out the chunks of code you added
in `app.js` and `console.log` some of the results to see what you have to work with.


Upon successful login, Passport sets a `req.user` variable.
You can use that object to add middleware that __will set the `user` local
variable for all views__. How could you use this to get all of the above tasks
working?

```js
// right above app.use('/', routes);
app.use(function (req, res, next) {
  res.locals.user = req.user
  next()
})
```

__FINISH THE LOGOUT ROUTE:__

Ok, by now you should have done some exploring to see what the LinkedIn Strategy
is doing, what is being return etc. In your `/auth/logout` route, `console.log`
`req.session` and see what's in there. Recall your experience using `express-session`.
Go to the docs and see if you can figure out what code to add to your `/auth/logout`
route to end the current user session.

You should now be able to login and logout with LinkedIn!!!

1. Git add, commit and push
1. Deploy to Heroku
1. Check that your app works on Heroku

## RESCUE

Checkout the solution branch if you're really stuck.

## IF YOU MADE IT THIS FAR, KEEP GOING!

__#1 Read LinkedIn's API docs to see what else you can do with this authorization.__

* Make an API call to LinkedIn on the user's behalf

Install unirest:

```
npm install unirest --save
```

__#2 Add Postgres and save the user in your database:__

__#3 Use Passport to implement login with Facebook, or some other 3rd party application__

## Resources

- https://developer.linkedin.com/docs/oauth2
- http://passportjs.org/docs
- https://github.com/jaredhanson/passport-linkedin
- https://github.com/jaredhanson/passport-linkedin/blob/master/examples/login/app.js
- https://github.com/jaredhanson/passport-linkedin#configure-strategy
- http://passportjs.org/docs/configure#configure

VIDEO
https://www.youtube.com/watch?v=LRNg4tDtrkE
