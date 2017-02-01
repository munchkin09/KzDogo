var Msg = require('../models/mChat');
var tmpSession = require('../tmp_session');

exports = module.exports = function(io)
{
   var chat = io.of('/chat')
    chat.on('connection', function (socket)
    {
      if(tmpSession.global_sockets[socket.id])
      {
        console.log('conectado a /chat');
        socket.join(tmpSession.global_sockets[socket.id].profile_id._id);
        for (var i = 0; i < tmpSession.global_sockets[socket.id].profile_id.amigos.length; i++) {
          var doc = tmpSession.global_sockets[socket.id].profile_id.amigos[i];
          socket.join(doc.conversacion_pair);
        }
        for (var i = 0; i < tmpSession.global_sockets[socket.id].profile_id.grupos.length; i++) {
          var doc = tmpSession.global_sockets[socket.id].profile_id.grupos[i];
          socket.join(doc.conversacion_pair);
        }
      }
      else
      {

      }

      socket.on('chat message', function(data)
      {
          var dt = new Date();
          var datos = {
            texto : data.msg,
            chat_id : data._id,
            perfil_id : data.profile_id,
            nombre : data.name,
            room : data.room
          };
          Msg.SaveMsg(datos, function(err, result)
          {
            if(result == 'ok')
            {
              console.dir(data);
               var fechaSmall = '<small> a las ' + addZero(dt.getHours()) + ':' + addZero(dt.getMinutes()) + '</small>'
               var objRet = {
                              _id : data.profile_id,
                              head : data.name + fechaSmall,
                              body :  "dice: " + data.msg,
                              img : 'img/',
                              fecha : dt,
                              conversacion : data.room,
                              chuli : true
                            }
                            console.dir(objRet);
               chat.to(datos.room).emit('chat_message', objRet);
            }
          });

      });



      socket.on('joinChatRoom', function(conversacion)
      {
          console.log(socket.rooms);
          console.log('Index of ' + conversacion + ' dentro de las rooms es ' + socket.rooms.indexOf(conversacion));
          if(socket.rooms.indexOf(conversacion) >= 0)
          {
            console.log('ya estoy en' + conversacion);
          }
          else if(tmpSession.global_sockets[socket.id])
          {
             console.log("aceptando la petición, me uno a la habitación(PAREADO PROMOCIONADO POR EL PROGRAMADOR DESGANADO)");
            socket.join(conversacion);
            /*var arrIds = conversacion.split('_');
            if(arrIds.indexOf(tmpSession.global_sockets[socket.id]._id) >= 0)
            {
                  /*
                     Este bucle es para comprobar si tienes permisos apra entrar en esta conversación
                     es ahora mismo muy WIP, pero very very WIP, eh??
                  ///
            }**/
          }
          else
          {
             console.log("pim pam pum ,bocata atúm");
            /* Este sería un caso en el que habría
             * que prohibir por completo la ejecución
             * por parte del usuario
             */

          }
          //else
          /*for (var i = 0; i < conversacion.profiles_id.length; i++) {
            if(tmpSession.global_sockets[result.profiles_id[i]._id])
            {
                console.log(tmpSession.global_sockets[result.profiles_id[i]._id]);
                tmpSession.global_sockets[conversacion.profiles_id[i]._id].join(result._id);
            }
          }*/
      });

      socket.on('disconnect', function()
      {
          console.log('desconectado de /chat');
      });

      socket.on('reconnect', function()
      {
          console.log('reconectando a /chat');
          if(tmpSession.global_sockets[socket.id])
            {
              console.log('reconexión en curso /chat');
              socket.join(tmpSession.global_sockets[socket.id].profile_id._id);
              for (var i = 0; i < tmpSession.global_sockets[socket.id].profile_id.amigos.length; i++) {
                var doc = tmpSession.global_sockets[socket.id].profile_id.amigos[i];
                socket.join(doc.conversacion_pair);
              }
            }
      });
    });
    return chat;
}


function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
