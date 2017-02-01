var Grupos = require('./models/mGrupos'),
   Chat = require('./models/mChat'),
   Perfil = require('./models/mProfile'),
   Error = require('./error_controller');

 /* Acciones de:
 - Ver grupo
 - Crear grupo
 - Buscar grupo
 - Unirse a grupo
 - Gestionar grupo
 - Abandonar grupo
 - Activar / desactivar geoloc de grupo
 - Compartir ubicación con grupo
 */

var getGrupo = function(req, res)
{

}

var getCrearGrupo = function(req, res)
{
   res.render('grupo/vCrearGrupo',{ title : 'Nuevo grupo' });
}

var postCrearGrupo = function(req, res)
{
   /*
   var integrantes_schema = cnnDb.Mongoose.Schema({
      _id : cnnDb.ObjectId,
      nombre : { type : String }

   });
   var groupSchema = cnnDb.Mongoose.Schema(
   {
   _id : { type : String, index : 1},
   nombre : { type : String },
   admin_data : [integrantes_schema],
   integrantes : [integrantes_schema],
   created: {type: Date, default: Date.now},
   es_privado : { type : Boolean } /* false para grupo público */

   var esPrivado = (req.body.public_private == 'on') ? true : false;
   var dataNuevoGrupo = {
      _id : '',
      conversation_pair : '',
      nombre : req.body.nombre_grupo,
      admin_data : [{ _id : req.user.profile._id, nombre : req.user.profile.nombre_completo.presentable }],
      integrantes :[{ _id : req.user.profile._id, nombre : req.user.profile.nombre_completo.presentable }],
      peticiones : [],
      es_privado : esPrivado
   };
   var dataNuevoChat = [];
   //console.dir(req.body.integrantes);
   for (var i = 0; i < req.body.peticiones.length; i++)
   {
      /*
       * Ponemos los nombre de usuarios en el array de peticiones
       * para que se unan al grupo.
       */
      var arrPeticiones = req.body.peticiones[i].split('/');

      /* Este objeto lleva la id y el nombre de la persona a la que queremos añadir al grupo */
      var nPeticion = { _id : arrPeticiones[0], nombre : arrPeticiones[1]};
      dataNuevoGrupo.peticiones.push(nPeticion);
      nPeticion.img_perfil = 'img/default.jpg';
      dataNuevoChat.push(nPeticion);
   }

   Grupos.CrearGrupo(dataNuevoGrupo, function(err, resultado)
   {
      if(err)
      {
         Error.Log(err,'error');
         res.status(501);
      }
      else
      {
        console.log("grupos creado");
         // Una vez creado el grupo, empezamos las rutinas para:
         // - Generar la petición en el perfil de los integrantes.
         // - Generar la sala de chat con las id´s de algunos participantes y la id de grupo
         var dataRequests = { nombre_grupo : dataNuevoGrupo.nombre, admin_id : dataNuevoGrupo.admin_data[0]._id, grupo_id : resultado._id, peticiones : dataNuevoGrupo.peticiones, cnvrstn_pr : resultado.conversation_pair };
         /*var petiSchema = {
                 _id : { type : cnnDb.ObjectId, index : true }, /* dependiendo del campo 'tipo' el objectId apunta a la table profiles o groups
                 profile_peticion_id : { type : cnnDb.ObjectId, index : true },
                 nombre : dataNuevoGrupo.nombre,
                 img_perfil : '',
                 conversacion_pair : dataRequests.admin_id + ' ' + dataRequests.grupo_id,
                 tipo : 1 /* 0 para amistad, 1 para grupo, N para siguientes
              };*/
         Perfil.SendGroupRequest(dataRequests, function(err, result)
         {
           console.log("Peticiones enviadas");
           dataNuevoChat.push({ _id : dataRequests.admin_id, nombre : req.user.profile.nombre_completo.presentable, img_perfil : req.user.profile.img_perfil })
            var nuevoChat = new Chat.mChat({
              _id : dataRequests.admin_id + '_' + dataRequests.grupo_id,
              nombre_chat : dataNuevoGrupo.nombre,
              profiles_id : dataNuevoChat,
              mensajes : [],
              last_msg_index : 0,
              status : true
            });
            Chat.CreateChat(nuevoChat,function(err,result2)
            {
              console.log("Chat creado");
                console.dir(err);
                console.dir(result2);
               res.json({ status : 'ok', data : resultado});
               res.end();
            });
         });
      }

   });
}

var getFindGrupo = function(req, res)
{
   // Esta función debería entregar una vista con info del grupo que se ha solicitado
}


var putAccionGrupo = function(req, res)
{
   //Aquí podemos generar el algoritmo para aceptar o denegar la petición de unirse al grupo.
   var data = { id : req.body.id, response : req.body.response, profile_id : req.user.profile._id }
   Perfil.ActionGroupRequest(data, function(err, resultado)
   {
     if(err)
     {

     }
     else {
       if(req.body.response == true)
       {
         var data = { _id : req.user.profile._id, nombre : req.user.profile.nombre_completo.presentable, img_perfil : 'img/default.jpg'};
         Chat.AddPersonToChat(data,function(err, resultado2)
         {
            res.json({status : 'ok'});
            res.end();
         });
       }
     }


   });
}

var putAdministrarGrupo = function(req, res)
{
   // Con esta función actualizamos algunos datos del grupo, como su nombre
}

exports.GetGrupo = getGrupo;
exports.GetCrearGrupo = getCrearGrupo;
exports.PostCrearGrupo = postCrearGrupo;
exports.GetFindGrupo = getFindGrupo;
//exports.PutFindGrupo = putFindGrupo;
exports.PutAccionGrupo = putAccionGrupo;
exports.PutAdministrarGrupo = putAdministrarGrupo;
