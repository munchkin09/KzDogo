var cnnDb = require('../connection_controller');    //  controlador conexion
var Err = require('../error_controller');     // controlador errores

var petiSchema = cnnDb.Mongoose.Schema(
  {
     _id : { type : cnnDb.ObjectId, index : true }, /* dependiendo del campo 'tipo' el objectId apunta a la table profiles o groups */
     profile_peticion_id : { type : cnnDb.ObjectId, index : true },
     nombre : { type : String },
     img_perfil : { type : String },
     conversacion_pair : { type : String },
     created : { type : Date, default: Date.now },
     tipo : { type : Number, default: 0 } /* 0 para amistad, 1 para grupo, N para siguientes */
  });

var amigoSchema = cnnDb.Mongoose.Schema(
  {
    _id : { type : cnnDb.ObjectId, index : true },
    amigo_id : { type : cnnDb.ObjectId },
    nombre : { type : String },
    img_perfil : { type : String },
    conversacion_pair : { type : String },
    accepted : { type : Date }
  });

var grupoSchema = cnnDb.Mongoose.Schema(
   {
      _id : { type : String },
      nombre : { type : String },
      img_grupo : { type : String },
      conversacion_pair : { type : String }
      //visible_en_grupo : { type : Boolean } /* true, tu geo-loc se muestra para este grupo */
   });

var profileSchema = cnnDb.Mongoose.Schema(
  {
     nombre_completo : { nombre : String, apellido_uno : String, apellido_dos : String, presentable : String },
     img_perfil : { type : String, default : 'img/default_p.jpg' },
     usr_id : { type : cnnDb.ObjectId },
     genero : String,
     fecha_nac : { type : Date },
     bio : { type : String},
     status : [{ texto : { type : String}, activo : { type : Boolean }, created : { type : Date, default : Date.now }}],
     bio : { type : String },
     created: { type: Date, default: Date.now },
     updated: { type : Date, default: Date.now },
     mascotas : [{ mascota_id : cnnDb.ObjectId, nombre: { type : String }, img_perfil : { type : String }}],
     amigos : [amigoSchema],
     grupos : [grupoSchema],
     peticiones_recibidas : [petiSchema],
     peticiones_enviadas : [petiSchema],
     position : {
            type : { type : String },
            coordinates : { type : [Number], index: { type: '2dsphere', sparse: true } }
         }
  });

var Profile = cnnDb.Mongoose.model('Perfiles', profileSchema);


exports.FindById = function(data, next)
{

   Profile.findById(data.id, data.fields, function(err, result)
   {
       if(err)
       {
         console.log(err);
         Err.Log(err);
       }
       if(result != null)
       {
           next(result);
       }
       else next(null);
  });
}

/*
  data = {
      sender_profile_id : req.user.profile._id,
      sender_nombre: req.user.profile.nombre_completo.nombre + ' ' req.user.profile.nombre_completo.apellido_uno,
      requested_profile_id : req.params.req_prfl,
      requested_nombre : ''
  };
*/

exports.SendFriendRequest = function(data, next)
{
    var chain_id = new cnnDb.Mongoose.Types.ObjectId;
    var dtCreation = Date.now();
    var cnvrstn_pr = (data.sender_profile_id.toString() > data.requested_profile_id.toString()) ? data.sender_profile_id + '_' + data.requested_profile_id : data.requested_profile_id + '_' + data.sender_profile_id;
    console.log('El pair vale: ' + cnvrstn_pr)
    var peti_profile_requested = { _id : chain_id, profile_peticion_id : data.sender_profile_id, conversacion_pair : cnvrstn_pr, nombre : data.sender_nombre, img_perfil : '', created : dtCreation },
        peti_profile_sender = { _id : chain_id, profile_peticion_id : data.requested_profile_id, conversacion_pair : cnvrstn_pr, nombre: '', img_perfil : '', created : dtCreation };
        // peti_profile_requested es la petición que se guardará en peticiones_recibidas de la persona que NO ha generado la acción de añadir amigo.
        // peti_profile_sender es la petición que se guardará en el profile de la persona que HA GENERADO la acción de añadir amigo.
    // 1º Buscamos el profile al que queremos añadir como amigo
    // Buscamos para actualizarlo con el objeto peti_profile_requested
    Profile.findById(peti_profile_sender.profile_peticion_id,'nombre_completo img_perfil peticiones_recibidas',
    function(err,result)
    {
        if(err != null)
        {
            console.log(err);
            next('Send Request Error controlado 1',null);
        }
        else
        {
            peti_profile_sender.nombre = result.nombre_completo.nombre + ' ' + result.nombre_completo.apellido_uno;

            // Guardamos la primera parte de la petición, la del perfil ajeno al
            // solicitante, así podemos tener el nombre del otro usuario aprovechando la query.
            result.peticiones_recibidas.addToSet(peti_profile_requested);
            result.save(function(err, result)
            {
                if(err)
                {
                    Err.Log(err);
                    next(err,null);
                }
                else
                {
                    Profile.findById(peti_profile_requested.profile_peticion_id, 'nombre_completo peticiones_enviadas', function(err, result2)
                    {
                        if(err != null)
                        {
                            Err.Log('Send Request Error controlado 2', 'error');
                            next(err,null);
                        }
                        else
                        {
                            result2.peticiones_enviadas.addToSet(peti_profile_sender);
                            result2.save(function(err, result)
                            {
                                if(err)
                                {
                                    Err.Log(err, 'error');
                                }
                                else
                                {
                                    next(null, 'ok');
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

exports.SendGroupRequest = function(data, next)
{
   /* data contiene un array con las invitaciones que hay que mandar a las personas que queremos dentro del grupo */
   //var dataRequests = { nombre_grupo : dataNuevoGrupo.nombre, admin_id : dataNuevoGrupo.admin_data[0]._id, grupo_id : resultado._id, peticiones : dataNuevoGrupo.peticiones };
   var dtCreation = new Date();
   var todoOk = 0;
   Profile.findOne({ _id : data.admin_id},function(err, result)
   {
     if(err)
     {
       Error.Log(err,'error');
       next(err,null);
     }
     else
     {
       result.grupos.addToSet({_id : data.grupo_id,
      nombre : data.nombre_grupo,
      img_grupo : '',
      conversacion_pair : data.cnvrstn_pr});
      result.save(function(err)
      {
        if(err)
        {
          Error.Log(err,'error');
          next(err,null);
        }
        else
        {
          for (var i = 0; i < data.peticiones.length; i++)
          {
             var peti_profile_requested = { _id : data.grupo_id, profile_peticion_id : data.sender_profile_id, conversacion_pair : data.cnvrstn_pr, nombre : data.nombre_grupo, img_perfil : '', created : dtCreation, tipo : 1 };
             Profile.findById(data.peticiones[i]._id, function(err, resultado)
             {
                resultado.peticiones_recibidas.addToSet(peti_profile_requested);
                resultado.save(function(err,resul)
                {
                   if(err)
                   {
                      Error.Log(err,'error');
                      next(err,null);
                   }
                   else
                   {
                      todoOk++;
                   }
                });
             });
           }
           console.log("arg!");
           next(null,'ok');
          }
        });
      }
   });
   //next(null,null);
}

exports.ActionFriendRequest = function(data, next)
{
    // Nos llega la _id común para una petición de amistad
    // nos dará dos resultados de profile, uno con esa _id en
    // peticiones de amistad, y otro con esa _id en peticiones enviadas
    //
    /*
    var data = {
          action : respuesta,               //  si el usuario acepta o declina la petición de amistad
          request_id : req.body.id,         //la _id de la petición común que tiene 2 usuarios, cada uno en su array peticiones_enviadas y peticiones_recibidas
          this_id : req.user.profile._id    //es la id del usuario que acaba de contestar la petición de amistad
     };
     */
     var resultado = '';
     var retErr = '';
     Profile.find({ '$or' :[{ 'peticiones_enviadas._id' : data.request_id },{ 'peticiones_recibidas._id' : data.request_id }]},function(err,results)
     {
       /*

       if(results[0].peticiones_recibidas.id(data.request_id))
       {
         var doc_peticionado = results[0].peticiones_recibidas.id(data.request_id);
         var doc_peticionador = results[1].peticiones_enviadas.id(data.request_id);
         results[1].peticiones_enviadas.id(data.request_id).remove();
         results[0].peticiones_recibidas.id(data.request_id).remove();
       }
       else
       {
         var doc_peticionado = results[1].peticiones_recibidas.id(data.request_id);
         var doc_peticionador = results[0].peticiones_enviadas.id(data.request_id);
       }

       */
       var fecha = Date.now();
       var resultado = { _id : '', profiles_id : []};
       for (var i = 0; i < results.length; i++)
       {
         var PRFL = results[i];

         if(PRFL.peticiones_recibidas.id(data.request_id))
         {
           var doc = PRFL.peticiones_recibidas.id(data.request_id);
           var cnvrst_pr = doc.conversacion_pair;
           PRFL.peticiones_recibidas.id(data.request_id).remove();
         }
         else
         {
           var doc = PRFL.peticiones_enviadas.id(data.request_id);
           var cnvrst_pr = doc.conversacion_pair;
           PRFL.peticiones_enviadas.id(data.request_id).remove();
         }
         if(data.action == true)
         {
           var amigo = { _id : doc.profile_peticion_id, amigo_id : doc.profile_peticion_id, nombre : doc.nombre, conversacion_pair : cnvrst_pr, accepted : fecha };
           resultado._id = cnvrst_pr;
           resultado.profiles_id[i] = amigo;
           PRFL.amigos.addToSet(amigo);
         }

         PRFL.save(function(err, data)
         {
           if(err) retErr = err;
           /*console.log('salvado correctamente');
           console.log(data);*/
         });
       }
       next(retErr, resultado);
     });

}

exports.ActionGroupRequest = function(data, next)
{
    /*var data = {
            action : respuesta,               //  si el usuario acepta o declina la petición de amistad
            request_id : req.body.id,         //la _id de la petición común que tiene 2 usuarios, cada uno en su array peticiones_enviadas y peticiones_recibidas
            this_id : req.user.profile._id    //es la id del usuario que acaba de contestar la petición de amistad
       };
     */
       var resultado = '';
       var retErr = null;
       Profile.findOne({ '$and' :[{ 'peticiones_recibidas._id' : data.id },{'_id' : data.profile_id } ] },function(err,result)
       {
         var PRFL = result;
         var resultado = { _id : '', grupo : []};
         if(data.response == 'true')
         {
           //console.dir(PRFL);
           var fecha = Date.now();
           var doc = PRFL.peticiones_recibidas.id(data.id);
           console.dir(doc);
           var cnvrst_pr = doc.conversacion_pair;
           var grupo = { _id : doc._id, nombre : doc.nombre, conversacion_pair : cnvrst_pr};
           PRFL.peticiones_recibidas.id(data.id).remove();
           PRFL.grupos.addToSet(grupo);
           console.dir(PRFL);
           PRFL.save(function(err, data)
           {
             console.dir(err);
             if(err) retErr = err;
             resultado._id = cnvrst_pr;
             resultado.grupo = grupo;
             next(retErr, resultado);
           });
         }
         else {
           PRFL.peticiones_recibidas.id(data.id).remove();
           PRFL.save(function(err, data)
           {
             if(err) retErr = err;
             next(retErr, 'borrado');
           });
         }
       });
}

var deleteFriend = function deleteFriend(data, next)
{
  /* 1º se busca el perfil de la persona que vamos a*/
  var perfil_a_borrar_id = data.profile_id,
      perfil_borrador = data.this_id,
      retorno;
      Profile.findById(perfil_a_borrar_id, function(err, result)
      {
        retorno = (result.amigos.id(perfil_borrador)).conversacion_pair
        //Con esto eliminamos nuestro perfil del listado de amigos de la otra persona.
        result.amigos.id(perfil_borrador).remove()
        result.save(function(err,result2)
        {
            if(err) next(err, null);
            else
            {
              Profile.findById(perfil_borrador, function(err, result)
              {
                  if(err) next(err,null);
                  else
                  {
                    result.amigos.id(perfil_a_borrar_id).remove();
                    result.save(function(err, result)
                    {
                      if(err) next(err, null);
                      else
                      {
                        //si llega hasta aquí, todo ha ido bien y ambas amistades
                        // han sido borradas correctamente
                        next(null, retorno);
                      }
                    });
                  }
              });
            }
        });
        //next('mal', null);
      });

}

exports.schProfile = profileSchema;
exports.mProfile = Profile;
exports.DeleteFriend = deleteFriend;
