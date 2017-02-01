var formidable = require('formidable'),
   util = require('util'),
   fs = require('fs'),
   path = require('path'),
   user = require('./user'),
   profile = require('./profile'),
   error = require('./error_controller'),
   settings = require('./settings'),
   tmpSession = require('./tmp_session');


// Con esta llamada cargamos el layout básico de la aplicación, la botonera
// y toda la lógica de notificaciones
exports.GetHome = function(req, res)
{
   res.render('home', {title : 'Bienvenido otra vez!', dataUser : req.user.profile });
};

exports.index = function(req, res)
{
  res.render('index', { title: 'KznDog'});
};

// Method POST para subir imágenes
exports.UploadPicture = function(req, res)
{

   var _id = req.user.profile._id;
   var sckt_id = req.user.socket_id;
   form = new formidable.IncomingForm();


   form.on('progress', function(bytesReceived, bytesExpected) {
     var value = Math.round((bytesReceived * 100) / bytesExpected);
     if(value == 100)
     {
       error.Log('Done!', "success");
       tmpSession.socket_notif.in(sckt_id).emit('final', { porcentaje : value});
       tmpSession.socket_notif.in(sckt_id).emit('ext_conn', 'Imagen subida con éxito a nuestros servidores!');
     }
     else
     {
       tmpSession.socket_notif.in(sckt_id).emit('progreso', { porcentaje : value});
     }

     //socket.broadcast(JSON.stringify(progress));
   });
   form.parse(req, function(err, fields, files)
   {
      /*res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.end(util.inspect({fields: fields, files: files}));*/
      // `file` is the name of the <input> field of type `file`
      //process.env.PWD = 'F:\\projects\\node_socket';
      process.env.PWD = process.cwd();

      var old_path = files.filemon.path,
      file_size = files.filemon.size,
      file_ext = files.filemon.name.split('.').pop(),
      index = old_path.lastIndexOf(settings.ubar) + 1,
      file_name = old_path.substr(index);
      error.Log(process.env.PWD + '/public/upload/');
      prev_path = path.join(process.env.PWD, '/public/upload/' + _id + '/');
      ensureExists(prev_path, '0744', function(err)
      {
        if (err) error.Log(err, "error");
        else
        {
          new_path = path.join(prev_path , file_name + '.' + file_ext);
          fs.readFile(old_path, function(err, data)
          {
             if (err) error.Log(err, "error");
             fs.writeFile(new_path, data, function(err)
             {
                if (err) error.Log(err, "error");
                fs.unlink(old_path, function(err)
                {
                   if (err)
                   {
                      error.Log(err, "error");
                      res.status(500);
                      res.json({'success': false});
                   }
                   else
                   {
                      res.status(200);
                      res.json({ success: true, folder : _id +'/'+ file_name + '.' + file_ext });
                   }
                });
             });
          });
        }
      });
   });
}




function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}
