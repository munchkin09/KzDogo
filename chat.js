var errorController = require('./error_controller'); // controlador errores
var Chat = require('./models/mChat');
var tmpSession = require('./tmp_session');
/*
 * Msg.schMensaje = chatMsgSchema;
 * Msg.mMensaje = Msg;
 */

var getChatList = function(req, res)
{
    /* Función para generar una vista con las charlas */
    var data = { profile_id : req.user.profile._id }
    Chat.GetListChats(data, function(err, result)
    {
      if(err) res.end();
      else
      {
          res.render('chat/vConversaciones', { dataConversaciones : result, dataUser : req.user.profile })
      }
    })
}

var enterChat = function(req, res)
{
   /* Aquí hay que recuperar el historial para una conversación concreta
    * si la conversación no existiera, se debería ejecutar la función
    * CreateChat del modelo de datos
    */
    console.log(req.params.id);
    Chat.EnterChat({ _id : req.params.id }, function(err, result)
    {
       console.log(result.length)
        if(err) res.json({resultado : 'no ok'});
        else if(result.length > 0)
        {
            var container = { _id : result[0]._id, mensajes : [], profiles_id : result[0].profiles_id, last_msg_index : result[0].last_msg_index };
            var msg=[];
            var i = 0;

            result.forEach(function(doc)
            {
              if(doc.msg_index != 0)
              {
                msg[i] = doc.mensajes;
                if(doc.mensajes.perfil_id == result[0].profiles_id[0]._id) msg[i].nombre = result[0].profiles_id[0].nombre;
                else msg[i].nombre = result[0].profiles_id[1].nombre;
                i++
              }

            });
            container.mensajes = msg;
            res.render('chat/vConversacion', { dataConversacion : container, dataUser : req.user.profile });
        }
        else
        {
          res.status()
        }
    });
}

var createChat = function(req, res)
{
   // Esta función todavía no se usa. Seguramente sea para crear
   // más los chats grupales que para las sesiones de chat privadas

   /* Tenemos que preparar un paquete de datos del siguiente modo
   {
    nombre_chat : String,
    profiles_id : [{ _id : cnnDb.ObjectId, nombre : String, img_perfil : String, }],
    mensajes : [chatMsgSchema],
    created : { type : Date, default : Date.now },
    last_msg_index : Number
  }
  Este es el prototipo de dato de los integrantes de la conversación, lo que iría
  dentro de profiles_id.
  { _id : cnnDb.ObjectId, nombre : String, img_perfil : String, }
  */
  var prfl = req.user.profile;
  var owner_profile = { _id : prfl._id, nombre : prfl.nombre_completo.nombre + ' ' + prfl.nombre_completo.apellido_uno, img_perfil : '' };
  var other_profile = { _id : req.body.profile_id, nombre : req.body.nombre, img_perfil : req.body.img_perfil };
  var data = { nombre_chat : '', profiles_id : [owner_profile, other_profile], mensajes : [], last_msg_index : 0 };
  Chat.CreateChat(data, function(err, result)
  {
      //Falta la lógica para volver a la vista que corresponda, o lo que haga falta.
  });
}

var saveMsg =  function(data)
{
   /*{
     texto : String,
     perfil_id : String,
     nombre : String,
     created: {type: Date, default: Date.now }
   }*/
   /*Msg.Save(data, function(result)
   {
      if(result)
      {
          console.log("hola");
      }

   });*/
}

exports.GetChatList = getChatList;
exports.EnterChat = enterChat;
exports.CreateChat = createChat;
//exports.SaveMsg = saveMsg;
