var cnnDb = require('../connection_controller');    //  controlador conexion

var notifySchema = cnnDb.Mongoose.Schema({
   _id : { type : cnnDb.ObjectId },
   amigos_nuevos : [{ peticion_amigo_id : { type : cnnDb.ObjectId }, nombre : { type : String} }],
   textos : [{ txt : String, enviado_de : cnnDb.ObjectId/*, url : String  /* Aquí se puede añadir la url donde se puede aceptar la petición */ }],
   perfil_id : String,
   nombre : String,
   created: { type: Date, default: Date.now }
});

var Notificacion = cnnDb.Mongoose.model('Notificaciones', notifySchema);
