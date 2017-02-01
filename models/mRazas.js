var cnnDb = require('../connection_controller');    //  controlador conexion

var razasSchema = cnnDb.Mongoose.Schema({
   raza : { type :String, index: 1}
});

var Razas = cnnDb.Mongoose.model('razas', razasSchema);


exports.ListarRazasPorNombre = function(next)
{
   Razas.find({},'raza', function(err, lstRazas)
   {
      if(err) console.log(err);
      else
      {
         var list = [];
         for (var i = 0; i < lstRazas.length; i++) {
            list[i] = lstRazas[i].raza
         }
         next(null, list);
      }
   });
}
