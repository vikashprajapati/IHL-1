var express = require('express')
var router = express.Router()
var passwordhash=require('password-hash');
var User = require('./schema.js').User
var Kiosk = require('./schema.js').Kiosk
var client = require('./fitbit.js')

const redirecthome=(req,res,next)=>{
	if(req.session.user)
	{
		res.redirect('/home');
	}
	else{
		next();
	}
}
const redirectlogin=(req,res,next)=>{
	if(!req.session.user)
	{
		res.redirect('/');
	}
	else{
		next();
	}
}

router.get('/',redirecthome, function(req, res){
	res.render('index', {loggedIn: req.session.user});
})

router.post('/', function(req, res){
	// hanlde signup and login process
	if (req.body.fblinksignup != null){
		var pass=String(req.body.password[0]);
		hashedpassword=passwordhash.generate(pass);
			console.log(req.body.profileUrl);
		User.find({ email: req.body.email }, function(err, user){
			if (err) throw err;

			if (Object.keys(user).length==0){
				userdata=new User({
					first_name:req.body.firstname,
					last_name:req.body.lastname,
					email:req.body.email,
					password:hashedpassword,
					profilepic:req.body.profileUrl,
					fblinked: req.body.fblinksignup,
					bio:'',
					fitbit:{
						access_token: null,
						refresh_token: null
					}
				});

				userdata.save(function(err){
					if(err) throw err;
					console.log("user created");
				});
				req.session.user = [userdata];
				res.redirect('/home');
			}else{
				console.log("user already exist");
			}
		});

	}
	else if(req.body.fblinklogin=="true")
	{
		User.find({email:req.body.email},function(err,user){
			console.log(user);
			if (err) throw err;
			if (Object.keys(user).length==0)
			{console.log("user doessnt exist sign up please");}
			else if( user[0].fblinked!=true){
				User.updateOne({email:req.body.email},{$set:{fblinked:true}},{ upsert: true },function(err){});
				// console.log(user[0]);
				req.session.user=user;
				res.redirect('/home');
			}
			else{
				req.session.user=user;
				console.log(user);
				// console.log(user,"logged in");
				res.redirect('/home');
			}
		})
	}else{
		var emailadd=req.body.email;
		var pass=req.body.password;
		User.find({email:emailadd},function(err,user){
			if (err) console.log(error);
			if(Object.keys(user).length!=0){
				if(passwordhash.verify(pass,user[0].password)==true){
					req.session.user=user;
					res.redirect('/home');
				}
				else{
					console.log("wrong password");
					res.redirect('/');
				}
			}
			else
			{
				console.log("user doesnt exist");
				res.redirect('/');
			}
		})
	}

})

// route for home
router.get('/home',redirectlogin, function(req, res){
	if(req.session.user[0].fitbit.access_token != null){
		Kiosk.find({user_id: req.session.user[0]._id}, function(err, data){
			console.log(data.length)
			res.render('home', {name:req.session.user[0].first_name,
				profileimg:req.session.user[0].profilepic,
				loggedIn: req.session.user,
				kiosk_data: data
			})
		})
	}else{
		res.redirect(client.getAuthorizeUrl('activity heartrate location nutrition profile settings sleep social weight', 'http://localhost:8080/callback'));
	}
})


// route for friends
router.get('/friends', redirectlogin, function(req, res){
	res.render('friends', {loggedIn: req.session.user});
})

// route for challenges
router.get('/challenges', redirectlogin, function(req, res){
	res.render('challenges', {loggedIn: req.session.user});
})

// route for achievements
router.get('/achievements', redirectlogin, function(req, res){
	res.render('achievements', {loggedIn: req.session.user});
})

// route for leaderboard
router.get('/leaderboard', redirectlogin, function(req, res){
	res.render('leaderboard', {loggedIn: req.session.user});
})

// route for settings
router.get('/settings', redirectlogin, function(req, res){
	client.get('/activities/goals/daily.json', req.session.user[0].fitbit.access_token).then(result =>{
			var steps=result[0].goals.steps;
			var calories=result[0].goals.caloriesOut;
			console.log(req.session.user[0].bio);
			client.get('/profile.json', req.session.user[0].fitbit.access_token).then(results =>{
				 var weight=results[0]['user']['weight'];
				 res.render('settings', {
	 				firstname:req.session.user[0].first_name,
	 				lastname:req.session.user[0].last_name,
	 				profileimg:req.session.user[0].profilepic,
	 				steps:steps,
	 				calories:calories,
	 				weight:weight,
	 				bio:req.session.user[0].bio,
	 				loggedIn: req.session.user});
	 			}).catch(err => {
					 console.log(err)
				 })
			}).catch(err => {
				res.render('settings', {
				 firstname:req.session.user[0].first_name,
				 lastname:req.session.user[0].last_name,
				 profileimg:req.session.user[0].profilepic,
				 steps:null,
				 calories:null,
				 weight:null,
				 bio:req.session.user[0].bio,
				 loggedIn: req.session.user});
			 })
		 })

router.post('/settings',function(req,res){
	if (req.body.details!=null){
		if (req.session.user[0].first_name!=req.body.firstName){
			if(req.body.firstName!=''){
			User.updateOne({email:req.session.user[0].email},{$set:{first_name:req.body.firstName}},{ upsert: true },function(err){});
			req.session.user[0].first_name=req.body.firstName;
			}
		}
		if (req.session.user[0].last_name!=req.body.lastName){
			User.updateOne({email:req.session.user[0].email},{$set:{last_name:req.body.lastName}},{ upsert: true },function(err){});
			req.session.user[0].last_name=req.body.lastName;
		}
		if (req.session.user[0].bio!=req.body.bio){
			User.updateOne({email:req.session.user[0].email},{$set:{bio:req.body.bio}},{ upsert: true },function(err){});
			req.session.user[0].bio=req.body.bio;
		}
		if (req.body.new_pass!='') {
			if(passwordhash.verify(req.body.old_pass,req.session.user[0].password)==true){
				User.updateOne({email:req.session.user[0].email},{$set:{password:passwordhash.generate(req.body.new_pass)}},{ upsert: true },function(err){});
			}
		}
	}
	else{
		data = {
			caloriesOut: req.body.calories,
			steps: req.body.steps
		}
		client.post('/activities/goals/daily.json', req.session.user[0].fitbit.access_token, data).then(result => {
			console.log(result)
		}).catch(err =>{
			console.log("not updated");
		});
	}
	res.redirect('/settings');
})

router.get('/logout',function(req,res){
	req.session.user[0].access_token = null
	req.session.user[0].refresh_token = null
	User.updateOne({email: req.session.user[0].email},{$set:{fitbit: {access_token: null, refresh_token: null}}},{ upsert: true },function(err){});
	req.session.destroy();
	res.redirect('/');
});

router.get('/participants',redirectlogin, function(req,res){
	res.render('viewParticipants');
});

// handle the callback from the Fitbit authorization flow
router.get("/callback", (req, res) => {
	// exchange the authorization code we just received for an access token
	client.getAccessToken(req.query.code, 'http://localhost:8080/callback').then(result => {
		req.session.user[0].fitbit.access_token = result.access_token
		req.session.user[0].fitbit.refresh_token = result.refresh_token

		User.updateOne({email: req.session.user[0].email},{$set:{fitbit: {access_token: result.access_token, refresh_token: result.refresh_token}}},{ upsert: true },function(err){});

		res.redirect('/home')
	}).catch(err => {
		res.status(err.status).send(err);
	});
});

module.exports = router;
