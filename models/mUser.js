var cnnDb = require('../connection_controller');    //  controlador conexion
var errorController = require('../error_controller');     // controlador errores

var userSchema = cnnDb.Mongoose.Schema(
{
   fbid : { type : String, index : true },
   movil : { type : Number },
   username : String,
   password : String,
   created: { type: Date, default: Date.now },
   updated: { type : Date, default: Date.now }
});

var User = cnnDb.Mongoose.model('Usuarios', userSchema);


exports.schUser = userSchema;
exports.mUser = User;
