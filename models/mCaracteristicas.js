var cnnDb = require('../connection_controller');    //  controlador conexion

var caracteristicasSchema = cnnDb.Mongoose.Schema({
   caracteristica : String
});



var Caracteristicas = cnnDb.Mongoose.model('caracteristicas', caracteristicasSchema);


exports.ListarCaracteristicas = function(next)
{
   Caracteristicas.find({},'_id caracteristica',function(err, lstCaracteristicas)
   {
      if(err) next(err,null);
      else
      {
         next(null,lstCaracteristicas);
      }
   });
}
