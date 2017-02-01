var cnnDb = require('../connection_controller');    //  controlador conexion

var colorSchema = cnnDb.Mongoose.Schema({
   color : String
});



var Colores = cnnDb.Mongoose.model('colores', colorSchema);

exports.ListarColores = function(next)
{
   Colores.find({},'_id color',function(err, lstColores)
   {
      if(err) next(err,null);
      else
      {
         var list = [];
         for (var i = 0; i < lstColores.length; i++) {
            list[i] = lstColores[i].color
         }
         next(null, list);
         //next(null,lstColores);
      }
   });
}
