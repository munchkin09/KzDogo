var Notificaciones = require('../notificaciones');
var parseCookie = require('cookie-parser');
var settings = require('../settings');
var error = require('../error_controller');
var tmpSession = require('../tmp_session');

//module.exports = Notif;
exports = module.exports = function(io){
   var notif = io.of('/notif');
    notif.on('connection', function (socket)
    {
      var tuPass = (Math.random() * 100 + Math.random() * 5000).toString();
      tmpSession.global_sockets[tuPass] = { socket_id : socket.id, profile_id : tuPass};
      notif.to(socket.id).emit('churifluri', tmpSession.global_sockets[tuPass]);

      socket.on('weAreOn', function()
      {
          //console.log(tmpSession.global_sockets[socket.id].profile_id);
          console.log('me uno a ' + tmpSession.global_sockets[socket.id].profile_id._id);
          socket.join(tmpSession.global_sockets[socket.id].profile_id._id);
          socket.broadcast.emit('ext_conn', tmpSession.global_sockets[socket.id].profile_id.nombre_completo.nombre + ' se ha conectado ' + String.fromCharCode(9981));
      });

      socket.on('disconnect', function()
      {
          //socket.broadcast.emit('ext_conn', tmpSession.global_sockets[socket.id].profile_id.nombre_completo.nombre + ' se ha desconectado ' + String.fromCharCode(9965));
          tmpSession.global_sockets[socket.id] = '';
          delete tmpSession.global_sockets[socket.id];
          console.log('desconectado también de /notif');
      });

      socket.on('reconnect', function()
      {
          console.log('He reconectado');
          var tuPass = (Math.random() * 100 + Math.random() * 5000).toString();
          tmpSession.global_sockets[tuPass] = { socket_id : socket.id, profile_id : tuPass};
          notif.to(socket.id).emit('churifluri', tmpSession.global_sockets[tuPass]);
      });
    });

    //var notif = io;
    return notif;
}


/*var Notif = function(io)
{
  io
  .of('/notif')
  .on('connection', function (socket)
      {

        socket.on('online_connection', function()
        {
            console.log("conectado a kzndog");
            socket.emit('ok', 'conexión');
        });
        socket.on('ckeckUpdate', function(socket)
            {
              socket.emit('ok', 'la ostia');
            });

      })

  return Notif;
  /*.use(function(socket, next)
  {
    next();
    /*if (socket.handshake.headers.cookie) {

        socket.cookie = socket.handshake.headers.cookie.split(' ');

        socket.sessionID = parseCookie.signedCookies(socket.cookie, 'seorkeiskes');
        console.log(socket.sessionID);
        if (socket.cookie['express.sid'] == socket.sessionID) {
          return next('Cookie is invalid.', false);
        }

      } else {
        return next('No cookie transmitted.', false);
      }
      //next(null, true);
  });

  //return misMetodos;
}

var misMetodos =
{
  socket: '',
  prueba : function(data)
  {
    //console.log(this.socket);
    //this.socket.emit('ok', data);
    //.emit('ok', data);
  },
  otra : function(mas)
  {

  }

}*/
