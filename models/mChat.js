//var app = require('./index.js');
var cnnDb = require('../connection_controller');    //  controlador conexion
var Logger = require('../error_controller');

var chatMsgSchema = cnnDb.Mongoose.Schema({
   msg_index : Number,
   texto : String,
   perfil_id : String,
   nombre : String,
   created: {type: Date, default: Date.now }
});

var chatSchema = cnnDb.Mongoose.Schema({
  _id : { type : String, index : 1},
  nombre_chat : String,
  profiles_id : [{ _id : cnnDb.ObjectId, nombre : String, img_perfil : String, }],
  mensajes : [chatMsgSchema],
  created : { type : Date, default : Date.now },
  last_msg_index : Number,
  status : Boolean
})

var Chat = cnnDb.Mongoose.model('Chats', chatSchema);
//var Msg = cnnDb.Mongoose.model('ChatMsg', chatMsgSchema);

var saveMsg = function saveMsg(data, next)
{
    // 1º Habría que encontrar la conversación, luego
    // añadir al set de mensajes el nuevo mensaje, sumar ++
    // a la variable last_msg_index y msg_index, para tener un índice
    // sobre el orden de la conversación.

      Chat.findOne({ _id : data.room}, function(err, result)
      {
          if(err) next(err, null);
          else
          {
            var nIndex = result.last_msg_index + 1;
            var fecha = Date.now();
            var nMsg = {
               msg_index : nIndex,
               texto : data.texto,
               perfil_id : data.perfil_id,
               nombre : data.nombre,
               created: fecha
            }
            result.mensajes.push(nMsg);
            result.last_msg_index = nIndex;
            result.save(function(err,result)
            {
                if(err) next(err, null);
                else
                {
                    next(null, 'ok');
                }
            });
          }
      });
}

var createChat = function createChat(data, next)
{
    // Se crea un nuevo documento en la tabla Chats
    // con las id´s de los perfiles participantes. De momento
    // sólo pueden ser 2, pero en el futuro pueden ser más.
    console.dir(data);
    existChat(data._id, function(err, result)
    {
      if(result == null)
      {
         var fecha = Date.now();
         var newChat = new Chat(data);
         var nMsg = {
                    msg_index : 0,
                    texto : 'inicial',
                    perfil_id : data.profiles_id[0]._id,
                    nombre : 'inicial',
                    created: fecha
                 }
         newChat.mensajes.push(nMsg)
         newChat.save(function(err, result2)
         {
           if(err)
           {
              Logger.Log(err,'error');
           }
           else console.log(result2);
           next(null, result2);
         });
      }
      else
      {
         //Devuelve la id del chat al que hay  que marcar como status true
         //xq ya existía previamente
         console.log("hola, entro aquí")
         Chat.update({ _id : result },{ $set : { status : true }},function(err)
         {
            next(null,true);
         });

      }

   });
}

var addPersonToChat = function(data,next)
{
  //Buscar el grupo solicitado primero
  var retErr = null;
  console.dir(data);
  Chat.findById(data._id, function(err, result)
  {
    if(err) retErr = err;
    else {
      result.profiles_id.addToSet(data);
      result.save(function(err)
      {
        if(err) retErr = err;
        next(retErr, 'ok');
      })
    }
    next(retErr,result);
  });

}

var enterChat = function enterChat(data, next)
{
  console.log('resultados para ' + data._id);
  Chat.aggregate({ $match : { $and : [{ _id : data._id },{ status : true }]}},
    { $unwind : '$mensajes'},
    { $sort : { 'mensajes.msg_index' : -1  }},
    { $project : { '_id' : 1, 'last_msg_index' : 1, 'profiles_id' : 1, 'mensajes.msg_index' : 1, 'mensajes.texto' : 1, 'mensajes.perfil_id' : 1, 'mensajes.created' : 1, }},
    { $limit : 15 },
    function(err, resultados)
    {
        if(err) console.log(err);
        else
        {
          next(null,resultados);
        }
    });
}

var deleteChat = function deleteChat(data, next)
{
   console.log("LO QUE HAY EN EL PAQUETE DE deleteChat. EXCLUSIVA!! En breves instantes....");
   console.dir(data);
  Chat.findById(data, function(err, result)
  {

    result.status = false;
    result.save(function(err, result)
    {
      if(err) next(err, null)
      else
      {
        next(null, result);
      }
   });
  })
}

var getListChats = function(data, next)
{
  //console.log(data.profile_id);
  Chat
  .find({ 'profiles_id._id' : { '$in' : [data.profile_id]}, status : true })
  .limit(5)
  .sort('-mensajes.created')
  .select('_id profiles_id mensajes')
  .exec(function(err, results)
  {
    //console.dir(results);
    next(null, results);
  });
}




exports.schMensaje = chatMsgSchema;
exports.mChat = Chat;

exports.SaveMsg = saveMsg;
exports.CreateChat = createChat;
exports.DeleteChat = deleteChat;
exports.EnterChat = enterChat;
exports.GetListChats = getListChats;
exports.AddPersonToChat = addPersonToChat;

exports.ExistChat = function(id, callback)
{
   existChat(id, callback);
}


function existChat(_id,next)
{
   console.log("Esto es existeChat??")
   var id_uno = _id;
   var arrId = id_uno.split('_');
   var id_dos = arrId[1] + '_' + arrId[0];
   Chat.findById({ _id : id_uno },function(err, resultado)
   {
      console.log("Esto es el 1er resultado de existeChat??")
      console.dir(resultado);
      if(resultado != null)
      {
         next(null,resultado._id);
      }
      else
      {
         Chat.findById({ _id : id_uno },function(err, resultado2)
         {
            console.log("Esto es el 2º resultado de existeChat??")
            console.dir(resultado2);
            if(resultado2 != null)
            {
               next(null,resultado2._id);
            }
            else
            {
               next(null,null);
            }
         });
      }
   });
}
