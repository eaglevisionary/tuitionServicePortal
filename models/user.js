var mongoose=require("mongoose");
//mongoose.connect("mongodb://localhost/yelpcamp");
var passportLocalMongoose=require('passport-local-mongoose');
var UserSchema= new mongoose.Schema({
    username:String,
    password:String,
  /*  email_id:String,
    phone_no:Number,
    first_name:String,
    last_name:String*/


});
UserSchema.plugin(passportLocalMongoose);
module.exports= mongoose.model("User",UserSchema);
