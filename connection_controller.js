var mongoose = require('mongoose');
var settings = require('./settings');
var errorController = require('./error_controller');

//mongoose.connect('mongodb://web_writeRead:fdasf354t541e3290dsj838@'+settings.SERVER_DB+':'+settings.MONGO_PORT+'/kzdog', function(err)
mongoose.connect('mongodb://web_writeRead:fdasf354t541e3290dsj838@'+settings.SERVER_DB+':'+settings.MONGO_PORT+'/kzdog', function(err)
{
    if(err){
      errorController.Log(err, "error");
    }else{
      errorController.Log('Connected to mongodb! port: '+settings.MONGO_PORT, "start");
    }
});

exports.Mongoose = mongoose;
exports.ObjectId = mongoose.Schema.Types.ObjectId;
