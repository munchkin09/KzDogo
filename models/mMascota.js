var cnnDb = require('../connection_controller');    //  controlador conexion
var errorController = require('../error_controller');     // controlador errores
var Profile = require('./mProfile');

var mascotaSchema = cnnDb.Mongoose.Schema({
   profile_id : [{ type : cnnDb.ObjectId }],
   nombre : { type : String },
   raza : { type : String },
   edad : { type : Number },
   sexo : { type : String},
   cruzar : { type : String },
   caracter : { type : String },
   img_perfil : { type : String },
   created: { type: Date, default: Date.now },
   updated: { type : Date, default: Date.now }
});

var Mascota = cnnDb.Mongoose.model('Mascotas', mascotaSchema);

exports.schMascota = mascotaSchema;
exports.mMascota = Mascota;


/* Esta función salva una mascota en su colección y luego
   en el array mascotas del profile dueño.                  */
exports.Save = function(req, next)
{
  var mascota = new Mascota(
  {
     nombre : req.body.nombre_mascota,
     raza : req.body.opt_raza,
     edad : req.body.edad,
     sexo : req.body.sexo,
     cruzar : req.body.cruzar,
     caracter : req.body.caract,
     img_perfil : req.body.pathMascotaImg,
  });
  mascota.profile_id.addToSet(req.body.profile_id);
  mascota.save(function(err, result)
  {
    var dataMascota = result;
    if(err)
    {
        next(err, null);
    }
    Profile.mProfile.findById(req.body.profile_id, function(err,result)
    {
      if(err)
      {
        console.log(err);
        next(err,null);
      }
      var tmpMascota = { mascota_id : dataMascota._id, nombre : dataMascota.nombre , img_perfil : dataMascota.img_perfil }
      result.mascotas.addToSet(tmpMascota);
      result.save(function(err, result)
      {
        if(err)
        {
          console.log(err);
          next(err, null);
        }
        //res.json(dataMascota);
        next(null, tmpMascota);
      });
    });
  });
}
