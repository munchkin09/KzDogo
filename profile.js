var Profile = require('./models/mProfile');
var Chat = require('./models/mChat');
var tmpSession = require('./tmp_session');

var getNewProfile = function(req, res)
{
  res.render('profile/vAddProfile', { title : 'Nuevo Usuario'});
}

var postNewProfile = function(req, res)
{
    // Añadir función de comprobación de duplicidad de mails / profile
    var profile = new Profile.mProfile(
      {
          fbid : String,
          nombre_completo :
          {
              nombre : req.body.nombre,
              apellido_uno : req.body.apellido1,
              apellido_dos : req.body.apellido2
          },
          e_mail : req.body.email,
          password :  req.body.pass,
          mascotas : [ req.body.mascotas ]
      });

    profile.save(function(err)
    {
        if(err) errorController.Print(err, 'function postNewProfile() profile.save');
        console.log("Salvado correctamente");
    });

    //res.json("Creado el usuario:\n" + profile);
    var data = { titulo:"Usuario Salvado Correctamente", usuario:profile };
    res.render('profile/addProfile', data);
}

var getProfile = function(req, res)
{
   var data = {
     id : req.params.id,
     fields : '_id nombre_completo genero mascotas amigos',
   };
   Profile.FindById(data, function(profile)
   {
       if(profile.amigos)
       {
            var resultado = { profile : profile };
            profile.amigos.forEach(function(amigo)
            {
              if(amigo._id == req.user.profile._id)
              {
                console.log('semos amigos, my fliend!');
                resultado.es_amigo = true;
              }
            });
       }
       else
       {

       }
       res.render('profile/index', { titulo : "Perfil de cualquier otro usuario", dataUser : resultado});
   });
}

var getHome = function(req, res)
{
   var data = {
     id : req.user.profile._id,
     fields : '_id nombre_completo genero mascotas amigos peticiones_recibidas peticiones_enviadas',
   };
   Profile.FindById(data, function(profile)
   {
     if(profile != null)
     {
        if(req.xhr) profile.ajax = true;
        else  profile.ajax = false;
        res.render('profile/home', { titulo : "Perfil de tu propiedad", dataUser : profile });
    }
    else
    {
        res.status(501);
        res.end();
    }
   });
}


var getUpdateProfile = function(req, res)
{
   //Tank.find({ size: 'small' }).where('createdDate').gt(oneYearAgo).exec(callback);
   var data = {
     id : req.params.profile,
     fields : '_id nombre_completo'
   };

   Profile.FindById(data, function(profile)
   {
      if(profile)
      {
         res.status(200);
         res.render('profile/vUpdateProfile', { title : 'Actualizar Usuario', data : profile })
         res.end();
      }
      else
      {
         res.status(404);
         res.end();

      }
      //res.sendStatus(404);
   });
}

var putUpdateProfile = function(req, res)
{
   var data = {
     id : req.body.id,
     fields : '_id nombre_completo'
   };
   Profile.FindById(data, function(profile)
   {
      if(profile)
      {
          profile.nombre_completo.nombre = req.body.nombre;
          profile.nombre_completo.apellido_uno = req.body.apellido1;
          profile.nombre_completo.apellido_dos = req.body.apellido1;
          Profile.Update(profile);
      }


      res.status(200);
      res.render('profile/' + result._id, { title : 'Actualizar Usuario', data : result })
      res.end();

      //res.sendStatus(404);
   });

}

var postFriendRequest = function(req, res, next)
{
    /* Aquí nos tiene que llegar un id de Usuario Objetivo(UO), y la id del
     * usuario en sesión.
     * Con estos datos, se incluirá la id del usuario en sesión en
     * el array peticiones_recibidas del UO y viceversa,
     * pero en el array send_request. */

    if(req.body.req_prfl == req.user.profile._id)
    {
      res.json({resultado : null});
    }
    else
    {
      var data = {
          sender_profile_id : req.user.profile._id,
          sender_nombre: req.user.profile.nombre_completo.nombre + ' ' + req.user.profile.nombre_completo.apellido_uno,
          requested_profile_id : req.body.req_prfl,
          requested_nombre : ''
      };
      req.tmp = data;
      Profile.SendFriendRequest(data, function(err, result)
      {
          if(err != null)
          {
             //Algo no ha ido bien durante la ejecución, el Error log debería haber impreso algo
             console.log(err);
             res.json( { resultado : result });
             res.end();
          }
          else
          {
            if(resul == 'ok')
            {
              //Sólo si
              next(req, res);
            }
            else {
              res.json({ resultado : 'no ok' });
              res.end();
            }

          }
      });
    }
}

var putFriendRequest = function(req, res)
{
    /* Aquí vamos a controlar las respuestas, afirmativas o negativas
     * a las peticiones de amistad. La respuesta será un bool, con el
     * siguiente esquema:
     * - TRUE => Acepta la petición de amistad, se actualiza la bbdd
     * del siguiente modo: Añade el ObjectId del aceptado en la lista
     * de amigos y al mismo tiempo, en el perfil de la otra persona,
     * hace lo mismo.
     * - FALSE => Deniega la petición de amistad, se borran las peticiones
     * y nada más. No se bloqueará posteriores intentos de amistad. */
     var respuesta = (req.body.response == 'true') ? true : false;

     var data = {
          action : respuesta,               //  si el usuario acepta o declina la petición de amistad
          request_id : req.body.id,         //la _id de la petición común que tiene 2 usuarios, cada uno en su array peticiones_enviadas y peticiones_recibidas
          this_id : req.user.profile._id    //es la id del usuario que acaba de contestar la petición de amistad
     };
     Profile.ActionFriendRequest(data, function(err, result)
     {
        if(err)
        {
           console.log(err);
           res.json({ resultado : 'no ok' });
        }
        else
        {
           if(respuesta == true)
           {
              data = {
                _id : result._id,
                nombre_chat : '',
                profiles_id : result.profiles_id,
                mensajes : [],
                last_msg_index : 0,
                status : true
              }
              Chat.CreateChat(data, function(err, result)
              {
                  if(err) res.json({resultado : 'no ok'});
                  else
                  {
                    for (var i = 0; i < data.profiles_id.length; i++) {
                        if(tmpSession.global_sockets[data.profiles_id[i]._id])
                        {
                          tmpSession.socket_notif.in(data.profiles_id[i]._id).emit('notif_amistad', { txt : 'Woof, amigos, woof de ' + data.profiles_id[1].nombre, room : data._id })
                        }
                        else
                        {
                           //Si el usuario no está conectado, habría que implementar aquí el guardar la notificación.
                        }
                    }
                    res.json({ nombre : result });
                  }
              });
           }

        }
     });


}

var putDeleteFriend = function(req, res)
{
    /* Para poder dar de baja un amigo, usaremos esta función */
    var data = {
          profile_id : req.body.id,         //la _id del usuario que vamos a eleminar como amistad
          this_id : req.user.profile._id,    //es la id del usuario que quiere dejar de ser amigo de profile_id
          conversacion : ''
     };
     Profile.DeleteFriend(data,function(err, result)
     {
       if(err)
       {
         errorController.Log(err,'error');
         res.status(501);
         res.end();
       }
       else /* Todo ha ido bien */
       {
         /* Ahora podemos borrar o marcar como inexistente el chat entre ambos usuarios*/
         Chat.DeleteChat(result, function(err, result)
         {
            if(err)
            {
               errorController.Log(err,'error');
               res.status(501);
               res.end();
            }
            else
            {
              res.json({texto : 'todo ok', resultado : result});
            }
         })
       }
     });
}


/* Entrega un listado completo de usuarios de toda la red */
var getListOfProfiles = function(req, res)
{
  Profile.mProfile.find({},function (err,data, stats)
  {
    res.render('profile/vProfileList2', { dataProfiles : data });
    res.end();
  });
}


/* Entrega el listado de amigos/grupos y peticiones de amistad de este ususario */
var getFriendList = function(req, res)
{
   var format = req.params.formato;
  Profile.mProfile.findById(req.user.profile._id, 'peticiones_enviadas peticiones_recibidas amigos grupos',function (err,data, stats)
  {
     switch(format)
     {
        case 'agenda':
           res.render('profile/vAgendaMini', { dataProfiles : data, title : 'Selecciona a tus amigos para el grupo'});
           break;
        case 'default':
        default:
           res.render('profile/vFriendList', { dataProfiles : data});
           break;
     }

  });
}

var leaveGroup = function(req, res)
{
  res.json({ respuesta : 'ok'});
}

exports.GetNewProfile = getNewProfile;
exports.PostNewProfile = postNewProfile;

exports.GetProfile = getProfile;
exports.GetHome = getHome;
//exports.GetProfileFb = getProfileFb;

exports.GetUpdateProfile = getUpdateProfile;
exports.PutUpdateProfile = putUpdateProfile;

exports.PostFriendRequest = postFriendRequest;
exports.PutFriendRequest = putFriendRequest;

exports.PutDeleteFriend = putDeleteFriend;

exports.GetFriendList = getFriendList;
exports.GetListOfProfiles = getListOfProfiles;

exports.LeaveGroup = leaveGroup;
