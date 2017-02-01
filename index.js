/*
*
*  Links de interés para el proyecto:
*  Cosas de google maps, para añadir rutas y markers:
*  https://developers.google.com/maps/documentation/javascript/examples/
*  Mongoose(nos va a ayudar también con la gestión a BBDD):
*  http://mongoosejs.com/docs/guide.html
*  Express.js, el que se encarga del enrutamiento:
*  http://expressjs.com/4x/api.html
*  Link para implementar notificaciones Push:
*  http://devgirl.org/2013/07/17/tutorial-implement-push-notifications-in-your-phonegap-application/
*
*
*  Respuesta a la cuestión de como añadir items a un json
*  http://stackoverflow.com/questions/4538269/adding-removing-items-from-json-data-with-jquery
*  La solución usa javascript puro, nada de jquery. Cosa que nos viene bien.

*/

var express = require('express'),
    http = require('http'),
    https = require('https');


//make sure you keep this order
var app = express();
var server = http.createServer(app);
var io = require('./socket').listen(server);
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var settings = require('./settings');
var authManager = require('./auth_controller'),
    flash = require('connect-flash');

//Nuestros controladores
var site = require('./site'),
    chat = require('./chat'),
    user = require('./user'),
    map = require('./map'),
    profile = require('./profile'),
    grupo = require('./grupo'),
    mascota = require('./mascota'),
    notificaciones = require('./Notificaciones'),
    errorController = require('./error_controller'),
    tmp_session = require('./tmp_session');

tmp_session.socket_chat = require('./socket_controllers/chat')(io),
tmp_session.socket_notif = require('./socket_controllers/notificaciones')(io);



// Config
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
   secret: 'seorkeiskes',
   resave: false,
   saveUninitialized: true
}));
app.use(authManager.passport.initialize());
app.use(authManager.passport.session());
app.use(flash());


// Middleware que se ejecuta SIEMPRE antes de cada petición
// La podemos usar para control de autentificación y más cosas.
app.use(function (req, res, next)
{
    var path = req._parsedUrl.path;
    var arrUrl = path.split("/");
    if(req.user)  // tiene sesion
    {
        if(req.xhr)
        {
           console.log('es llamada ajax desde '  + req.path );
           /*  */
        }
        // Aquí hay que poner más chicha!
        if(path == "/" || path == "")
        {
           res.render('home',{ title : 'WoooOf wooof, te echábamos de menos! ', dataUser : req.user.profile});
        }
        else
        {
          next();
        }
    }
    else // No tiene sesion
    {
        errorController.Log("/Switching");
        switch(arrUrl[1])
        {
            case 'auth':
               next();
               break;
            case "auth2":
               next();
               break;
            default:
               res.render('index', { title : 'Bienvenido a KznDog' });
               res.end();
               break;
        }
    }
});




/* Conexiones de Autentificación */
/* ----------------------------- */

   /* =============================
    [GET] Handle Login email */
   app.get('/auth/login', function(req, res){
      res.render('index',{title:'Acceso mediante email'})
   });

   /* [POST] Handle Login email */
   app.post('/auth/login', authManager.passport.authenticate('loginLocal', {
      successRedirect: '/home#_=_',
      failureRedirect: '/',
      failureFlash : false
   }));

   /* =============================
    [GET] Registration Page */
   app.get('/auth/signup', function(req, res){
      res.render('user/vAddUser',{title:'Registro mediante email'});
   });

   /* [POST] Handle Registration */
   app.post('/auth/signup', authManager.passport.authenticate('signup', {
      successRedirect: '/home#_=_',
      failureRedirect: '/auth/signup',
      failureFlash : false
   }));

   /* =============================
   [GET] Recovery Password Page */
   app.get('/auth/recoverpass', function(req, res){
      errorController.Log("Recovery-1");
      res.render('user/vRecoverPass',{title:'Lost Password?'});
   });


   /* [POST] Recovery Password Page */
   //app.post('/auth2/sendemail', authManager.sendEmail);

   /*[GET] Email Confirmation Page */
   app.post('/auth2/emailConfirmation', authManager.sendEmail);
   /*
   function(req, res){
      errorController.Log("Recovery-2");
      authManager.sendEmail("jroucher@gmail.com") // aun hay que recoger el input POST
      res.render('user/vEmailConfirmation',{title:'Email Send!'});
   });
   */
   app.get('/logout', function(req, res)
   {
       var socket_id = req.user.socket_id,
           profile_id = req.user.profile._id;
       //settings.socket_notif.emit('ext_conn', req.user.profile.nombre_completo.nombre + ' se ha desconectado');
       var data_poi = {profile_id : req.user.profile._id, coords : [0,0], status : false }
       map.SavePOIWhenOffline(data_poi,function(err, result)
       {
          tmp_session.global_sockets[socket_id] = '';
          tmp_session.global_sockets[profile_id] = '';
          delete tmp_session.global_sockets[socket_id];
          delete tmp_session.global_sockets[profile_id];
          req.logout();
          res.redirect('/');
       });
   });

   /* =============================*/
   /* [GET] Facebook Login */
   app.get('/auth/facebook', authManager.passport.authenticate('facebook', { scope: [ 'public_profile', 'email', 'user_friends' ]}));

   /* [GET] Facebook Login ???? */
   app.get('/auth/fb/cb',
      authManager.passport.authenticate('facebook', { successRedirect: '/home',
                                      failureRedirect: settings.SERVER_URL }));

   /* [GET] HOME */
   app.get('/', site.index);   //Cargamos el site del home

   /* [POST] Upload Profile Picture */
   app.post('/uploadProfilePic', site.UploadPicture);

   /* =============================
    [GET] Zona CHAT*/
   app.get('/chat/:id', chat.EnterChat);     //Cargamos el site del chat

   app.get('/chats', chat.GetChatList);


app.get('/home', site.GetHome);

// Registro nuevo usuario
app.get('/newUser', user.GetNewUser);
//app.post('/newUser', user.PostNewUser);


app.get('/user/:id', user.GetUser);
// Modificaciones de usuarios
app.get('/updateUser/:user', user.GetUpdateUser);
app.put('/updateUser', user.PutUpdateUser);

app.get('/profile/:id', profile.GetProfile);
app.get('/profile', profile.GetHome);

// Modificaciones de usuarios
app.get('/updateProfile/:profile', profile.GetUpdateProfile);
app.put('/updateProfile', profile.PutUpdateProfile);

app.get('/profilesList', profile.GetListOfProfiles);

// Map
app.get('/map', map.index);
app.post('/savePOI', map.savePOI);
app.put('/POIupdate', map.SavePOIWhenOnline);
app.get('/getPOIs/:lat/:lon/:tipo', map.GetPOIsNearTo);
app.post('/saveRoute', map.PostSaveRoute);
/*app.get('/newPOI', map.setNewPOI);
app.delete('/deletePOI', map.removePOI);*/

app.get('/getMascota/:id', mascota.GetMascota);
app.get('/getAddMascotas', mascota.GetAddMascotas);
app.post('/postMascota', mascota.PostMascota);

app.get('/getFriendsList/:formato', profile.GetFriendList);
app.get('/getProfilesList/:formato', profile.GetListOfProfiles);

app.post('/friend_request', profile.PostFriendRequest, function(req, res)
{
  var data = { txt : req.user.profile.nombre_completo.nombre + ' te ha enviado una petición', dirigido_a : req.tmp.requested_profile_id, enviado_de : req.user.profile._id };
  /* Todo esto podría convertirse en un middleware Notificaciones, para englobar todas las posibles llamadas a cuestiones de notificar usuarios. */
  if(tmp_session.global_sockets.indexOf(req.tmp.requested_profile_id) != -1)
  {
    tmp_session.socket_notif.in(req.tmp.requested_profile_id).emit('notif', data.txt);
  }
  else
  {
    /* Si el usuario no está conectado(como parece ser), se tendría que almacenar el aviso en bbdd */
    notificaciones.SaveNotif(data, function(err, resul)
    {
      res.json({ resultado : 'ok' });
    });
  }
  res.json({ resultado : 'ok' });
});
app.put('/friend_request', profile.PutFriendRequest);

app.put('/delete_friend', profile.PutDeleteFriend);

app.get('/new_group', grupo.GetCrearGrupo);

app.post('/post_new_group',grupo.PostCrearGrupo);

app.put('/put_action_group', grupo.PutAccionGrupo);

app.put('/leave_group', profile.LeaveGroup);

/**********************************/
/******** NOTIFICACIONES **********/
/**********************************/

/* Estas funciones son las encargadas de unir
   la sesión de Socket con la sesion de Express
   así podemos emitir tanto señales personalizadas
   como emitir a listas completas de los amigos de los
   usuarios
*/

//Este función es una llamada Ajax en el login de un nuevo usuario
//Se ejecuta para unir la sesion de Socket con la de express, usando una
//variable Math.Random como clave intermedia(para evitar 'exponer' de más algun dato)
app.put('/authsocket', function(req, res)
{
  var suPass = req.body.profile_id;
  //socket_notif.emit('milagro','lo llamo!');
  if(tmp_session.global_sockets[suPass])
  {

    tmp_session.global_sockets[tmp_session.global_sockets[suPass].socket_id] = tmp_session.global_sockets[suPass];
    tmp_session.global_sockets[tmp_session.global_sockets[suPass].socket_id].profile_id = req.user.profile;
    tmp_session.global_sockets[req.user.profile._id] = tmp_session.global_sockets[tmp_session.global_sockets[suPass].socket_id];
    req.user.socket_id = tmp_session.global_sockets[suPass].socket_id;

    tmp_session.global_sockets[suPass] = {};
    delete tmp_session.global_sockets[suPass];
    //settings.socket_notif.emit('ext_conn',  req.user.profile.nombre_completo.nombre + ' se ha conectado');
    //settings.global_sockets[req.user.profile._id].broadcast.emit('ok', req.user.profile.nombre_completo.nombre + ' se ha conectado');
    res.json({ status : 'ok!!!!', script : '/js/auChat.js' });
    //res.end();
  }
  else if(tmp_session.global_sockets[req.user.socket_id])
  {
      res.json('ok!!!! antiguo');
  }
  else res.json('no ok');

  res.end();
});

/***************************************/
/********* FIN NOTIFICACIONES **********/
/***************************************/


if(!module.parent)
{
    server.listen(settings.SERVER_PORT);
    //https.createServer(options, app).listen(443);
    errorController.Log('Express started on port ' + settings.SERVER_PORT, "start");
}

module.exports = app;
