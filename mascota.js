var Mascota = require('./models/mMascota'),
    Profile = require('./models/mProfile'),
    Caracteristica = require('./models/mCaracteristicas'),
    Raza = require('./models/mRazas'),
    Colores = require('./models/mColores')
    Err = require('./error_controller.js');
/*
 * Mascota.schMascota;
 * Mascota.mMascota;
 */

var getMascotas = function(req, res)
{
   /*Mascota.mMascota.find(
      {
         profile_id : req.user.profile._id
      },
      '_id nombre img_perfil',
      function(err, result)
      {
         if(err) console.log(err);

      }
   );*/

}

var getMascota = function(req, res)
{
  var _id = req.params.id;

  Mascota.mMascota.findById(_id, function(err, result)
  {
    if(err) Err.Print(err, 'getMascota - Mascota.mMascota.findById');
    else if(result == null)
    {
        res.status(404);
        res.end();
    }
    res.render('mascota/vModalMascota', { title : result.nombre, dataMascota : result });
  });
}

var postMascota = function(req, res)
{
   Mascota.Save(req, function(err, data, stats)
   {
       if(err) Err.Print(err, 'postMascota - Mascota.Save');
       else if(data == null)
       {
           res.status(404);
           res.end();
       }
       else
       {
           res.json({texto : 'todo ok', resultado : data });
       }
   });
}

var getAddMascotas = function(req , res)
{
   var caracteristicas;
   var razas;
   Caracteristica.ListarCaracteristicas(function(err, result_listado_caracteristicas)
   {
        caracteristicas = result_listado_caracteristicas;
        console.dir(caracteristicas);
        Raza.ListarRazasPorNombre(function(err, result_listado_razas)
        {
           razas = result_listado_razas;
           Colores.ListarColores(function(err, result_lista_colores)
           {
               res.render('mascota/vAddMascota', {title : 'Añade tú mascota', data : { profile_id : req.user.profile._id, lista_colores : result_lista_colores, lista_razas : razas, lista_caract : caracteristicas }});
           });

        });
   });

}

var putMascotas = function(req, res)
{
    var mascota_id = req.body._id;
    //Mascota.mMascota.findById(mascota_id, )
}


exports.GetMascotas = getMascotas;
exports.GetMascota = getMascota;
exports.PutMascotas = putMascotas

exports.GetAddMascotas = getAddMascotas;
exports.PostMascota = postMascota;
