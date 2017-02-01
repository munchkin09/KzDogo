var socketio = require('socket.io');
// Para el tema de los mensajes privados y chat grupales:
// http://socket.io/docs/rooms-and-namespaces/#
// http://stackoverflow.com/questions/17476294/how-to-send-a-message-to-a-particular-client-with-socket-io
module.exports.listen = function(server)
{
    var io = socketio.listen(server);
    return io;
}
