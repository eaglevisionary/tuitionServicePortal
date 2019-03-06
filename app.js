var express = require('express')
   , http = require('http');
var app        =express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var bodyParser =require("body-parser");
var mongoose=require("mongoose");
var passport=require("passport");
var liveStream=require("./liveStream.js");
LocalStrategy   =require('passport-local');
var Discussion=require("./models/discussion"),
    User=require("./models/user"),
    Comment=require("./models/comment");
  
//var seedDB=require("./seeds");


//seedDB();
mongoose.connect("mongodb://localhost/tut4");
app.use(express.static(__dirname+"/views"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(require('express-session')(
    {
        secret: "First app",
        resave: false,
        saveUninitialized: false
    }
));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());






app.set('port',(process.env.PORT||3000));
server.listen(process.env.PORT||3000,function(){console.log("App has started")});

/*
Campground.create({name:"hill",
description:"huge hill of flowers",
image:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Fuchsia_flower%E3%83%95%E3%82%AF%E3%82%B7%E3%82%A2%E3%81%AE%E8%8A%B17137619.jpg/220px-Fuchsia_flower%E3%83%95%E3%82%AF%E3%82%B7%E3%82%A2%E3%81%AE%E8%8A%B17137619.jpg"}
,
function(err,camp)
{
  if (err){
    console.log(err);
  } else {
      console.log("camp added");
      console.log(camp);
      }
}
);*/
/*
var campgrounds=[
  {name:"cliff",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/White_and_yellow_flower.JPG/220px-White_and_yellow_flower.JPG"}
]*/


app.get("/",function(req,res){
  res.render("landing");
});



app.get("/discussions",isLoggedIn,function(req,res)
{
//get all camps from debug
  Discussion.find({},function(err,allreturned){
    if (err){
      console.log(err);
    } else {

      res.render("index",{discussions:allreturned})

    }
  });

});

app.get("/liveStream",isLoggedIn,function(req,res)
{
  res.render('liveStream');
  liveStream.liveStream(io);
})






app.post("/discussions", isLoggedIn,function(req,res){
var  subject=req.body.subject;
  var grade=req.body.grade;
  var title=req.body.title;
  var discussion=req.body.discussion;

var discuss={subject:subject,title:title,grade:grade,discussion:discussion,author:req.user.username};
Discussion.create(discuss,function(err,d)
{
  if (err){
    console.log(err); // also later, go back to the form and say name cant be blank and stuff
  } else {
      console.log("Discussion added");
      console.log(d);
        res.redirect("/discussions");
      }
}
);


});

app.get("/discussions/new",isLoggedIn,function(req,res){

  res.render("newdiscussion")
});

// this must alwasy come only after campgrounds/new
//called show template
app.get("/discussions/:id",isLoggedIn,function(req,res){
//  Campground.findById(req.params.id,function(err,founditem){
Discussion.findById(req.params.id).populate("comments").exec(function(err,founditem){
    //req has attributes params that contains this id thats given in the url
    if (err){
      console.log(err);
    } else{
      console.log(founditem)
      res.render("show",{d:founditem});
    }

  });

})

app.get("/discussions/:id/comments/new",isLoggedIn,function(req,res){
//find camp by id
Discussion.findById(req.params.id,function(err,founditem){
  if(err){
    console.log(err)
  }
  res.render("newcomment",{discussion:founditem});
});
});

app.post("/discussions/:id/comments",isLoggedIn,function(req,res){
  //lookup using id
  Discussion.findById(req.params.id,function(err,d){
    if(err){
      console.log(err);
      redirect("/discussions");
    }
    else{

      Comment.create({text:req.body.comment,author:req.user.username},function(err,comm){ // this comment is an object we gave in the html file
        if(err){
          console.log(err);
        }else{
          d.comments.push(comm);
          d.save();

            res.redirect('/discussions/'+d._id);

        }
      });



  }
  });
  });

app.get("/courses1",isLoggedIn,function(req,res)
{
  res.render("courses1")
});

app.get("/course-details1",isLoggedIn,function(req,res)
{
  res.render("course-details1")
});

app.get("/profile",isLoggedIn,function(req,res)
{
  res.render("profile")
});

  app.get('/register',function(req,res)
  {
      res.render("register");
  });

  app.post('/register',function(req,res)
  {

      User.register(new User({username: req.body.username}),req.body.password,function(err,user){
      if(err){
          console.log(err);
          res.redirect('/');
      }
      else
      {
          console.log("New User registered");

          passport.authenticate("local")(req,res,function(){
          res.redirect('/mainpage');
      })
  }
  });
  });


/*
app.get('/login',function(req,res)
    {
        res.render("login");
    });*/


// this authenticate is inbuilt. we use it in the starting lines
app.post('/login',passport.authenticate("local", {
            successRedirect: "/mainpage",
            failureRedirect: "/"
        }),function(req,res){});

app.get('/mainpage',isLoggedIn,function(req,res){
  res.render("mainpage");
});


app.get("/logout",isLoggedIn,function(req,res){

  req.logout();
  res.redirect("/");
});

      // to render main page , u need the middleware is logged in
function isLoggedIn(req,res,next)
      {
          if(req.isAuthenticated())
          return next();
          res.redirect("/");
      }



/*
app.listen(process.env.PORT,process.env.IP,function(){

  console.log("yaay");
})
*/
