var mongoose=require("mongoose");

//mongoose.connect("mongodb://localhost/yelpcamp");

//Schema set up:
var DiscussionSchema=new mongoose.Schema({
  subject:String,
  grade:Number,
  title:String,
  discussion:String,
  author:String,
  comments:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Comment"
    }
  ]
});

module.exports=mongoose.model("Discussion",DiscussionSchema);
