var cnnDb = require('../connection_controller');    //  controlador conexion
var Logger = require('../error_controller');     // controlador errores

var integrantes_schema = cnnDb.Mongoose.Schema({
   _id : cnnDb.ObjectId,
   nombre : { type : String },
   join_date : { type : Date, default : Date.now }
});

var groupSchema = cnnDb.Mongoose.Schema(
   {
      _id : { type : cnnDb.ObjectId, index : 1},
      conversation_pair : { type : String },
      nombre : { type : String },
      admin_data : [integrantes_schema],
      integrantes : [integrantes_schema],
      peticiones : [integrantes_schema],
      created: {type: Date, default: Date.now},
      es_privado : { type : Boolean } /* false para grupo público */
});

var Grupo = cnnDb.Mongoose.model('Grupos', groupSchema);

var mostrarGrupo = function(data, next)
{
   /* Si se crean filtros de algún tipo este sería el lugar donde aplicarlos
    * y siempre con los datos contenidos en data. Actualmente data sólo lleva
    * una id que corresponde al grupo solicitado
    */
    Grupo.findById(data._id,function(err, resul)
    {
      if(err)
      {
         Logger.Log(err,'error');
         next(err,null);
      }
      else if(resul)
      {
         next(null, resul);
      }
   });
}


var crearGrupo = function(data, next)
{
   var id = new cnnDb.Mongoose.Types.ObjectId;
   data._id = id;
   data.conversation_pair = data.admin_data[0]._id + '_' + id;
   var nGrupo = new Grupo(data);
   nGrupo.save(function(err, resul)
   {
      if(err)
      {
         console.log(err);
         Logger.Log(err,'error');
         next(err,null);
      }
      else if(resul)
      {
         next(null,resul);
      }
   });
}

var insertarUsuarioGrupo = function(data, next)
{

}

var eliminarUsuarioGrupo = function(data, next)
{

}

var encontrarGrupo = function(data, next)
{

}

var gestionarGrupo = function(data, next)
{

}

exports.MostrarGrupo = mostrarGrupo;
exports.CrearGrupo = crearGrupo;
exports.InsertarUsuarioGrupo = insertarUsuarioGrupo;
exports.EliminarUsuarioGrupo = eliminarUsuarioGrupo;
exports.EncontrarGrupo = encontrarGrupo;
exports.GestionarGrupo = gestionarGrupo;
