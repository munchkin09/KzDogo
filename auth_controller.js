var settings = require('./settings'),
    Err = require('./error_controller'),
    User = require('./models/mUser'),
    Profile = require('./models/mProfile'),
    POI = require('./models/mMap'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    bCrypt = require('bcryptjs'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    emailTemplate = require('./emailTemplates/emailRecovery');

 /*
 Passport para FaceBook
 -----------------------------------------------------
 */
    passport.use(
       new FacebookStrategy(
          {
              clientID: settings.FB_ClientId,
              clientSecret: settings.FB_Secret,
              callbackURL: settings.SERVER_URL + "/auth/fb/cb"
          },
          callbackFb
       )
    );
/*
Passport para Local
-----------------------------------------------------
*/
passport.use(
   'loginLocal',
   new LocalStrategy({
      passReqToCallback : true
   },
   loginLocal
));
/*
Crear Usuario
-----------------------------------------------------
*/
passport.use('signup', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    findOrCreateUser = function(){
      // find a user in Mongo with provided username
      User.mUser.findOne({'username':username},function(err, user) {
        // In case of any error return
        if (err){
          Err.Log('Error in SignUp: '+err, "error");
          return done(err);
        }
        // already exists
        if (user) {
          Err.Log('User already exists', "warning");
          return done(null, false,
             req.flash('message','User Already Exists'));
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new User.mUser();
          // set the user's local credentials
          newUser.fbid = '';
          newUser.movil = 0;
          newUser.username = req.body.username;
          newUser.password = createHash(password);

          // set the user's local profile
          var newProfile = new Profile.mProfile();
          newProfile.nombre_completo.nombre = req.body.nombre;
          newProfile.nombre_completo.apellido_uno = req.body.apellido1;
          newProfile.nombre_completo.apellido_dos = req.body.apellido2;
          newProfile.nombre_completo.presentable = req.body.nombre + ' ' + req.body.apellido1;
          newProfile.genero = '';
          newProfile.mascotas = [];
          newProfile.amigos = [];
          newProfile.peticiones_recibidas = [];
          newProfile.peticiones_enviadas = [];

          // save the user & profile
          newUser.save(function(err,restUser,statsUser) {
               if (err){
                 Err.Log('Error in Saving user: '+err, "error");
                 throw err;
               }
               Err.Log('User Registration succesful', "success");
               newProfile.usr_id = restUser._id;   // save ID !!!!
               newProfile.save(function(err, restProfile, statsProfile) {
                  if (err){
                     Err.Log('Error in Saving Profile: '+err, "error");
                     throw err;
                  }
                  Err.Log('Profile Registration succesful', "success");
                  var data = {
                     user : restUser,
                     profile : restProfile
                  }
                  /* Aquí habría que crear una llamada a POI.*/
                  var newPOI = {
                     info_poi : { nombre : data.profile.nombre_completo.nombre, info : '', visibilidad : 'public' },
                     tipo_poi : 'PERSONA', //tipo_poi, puede tener valores diferentes.
                     POI_owner : data.profile._id,
                     position : {
                           type : 'Point',
                           coordinates : [0,0]
                        },
                     online : true
                     };
                  POI.SaveNewPOIUser(newPOI,function(err, poi)
                  {
                     if(err) Err.Log(err,'error');
                     else if(!poi) Err.Log('no devuelve nada','warning');
                     else data.poi = poi;
                  });
                  done(null, data);
               });
          });
        }
     });
    };

    // Delay the execution of findOrCreateUser and execute
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  })
);

/*
Validar Usuario Local
-----------------------------------------------------
*/
function loginLocal(req, username, password, done) {
   // check in mongo if a user with username exists or not
   User.mUser.findOne({ 'username' :  username },
   function(err, user, statUser) {
      // In case of any error, return using the done method
      if (err)
         return done(err);

      // Username does not exist, log error & redirect back
      if (user == null)
      {
        Err.Log('User Not Found with username '+username, "warning");
        return done(null, false);
      }

      // User exists but wrong password, log the error
      if (!isValidPassword(user, password))
      {
         Err.Log('Invalid Password', "warning");
         return done(null, false);
      }
      // User and password both match, return user from
      // done method which will be treated like success
      Profile.mProfile.findOne({ 'usr_id' :  user._id },
      function(err, profile, statProfile) {
         // In case of any error, return using the done method
         if (err)
            return done(err);
         if (profile == null)
         {
           Err.Log('User Not Found with username '+username, "error");
           return done(null, false);
         }

         var data = {
           user : user,
           profile : profile
         }
         done(null, data);
         /*var data_poi = {profile_id : data.profile._id ,coords : [0,0], status : true }
          POI.ActualizarPOIById(data_poi,function(err, result)
          {

          });*/
      });
   });
}
/*
Validar Usuario FaceBook
-----------------------------------------------------
*/
function callbackFb(accessToken, refreshToken, profile, done)
{
    /*
     *
     * Aquí tenemos que comprobar si con este accessToken y esta
     * info de perfil existe ya alguien, o es un usuario nuevo.
     *
     */
    var fbProfile = profile;
    console.dir(fbProfile);
    User.mUser.findOne({ fbid: fbProfile.id }, function (err, usr)
    {

        if(err) Err.Log(err, 'error');
        if(usr == null)
        {

           var mail = fbProfile.emails ? fbProfile.emails[0].value : '';
            user = new User.mUser(
            {
                fbid : fbProfile.id,
                username : mail,
                password :  createHash(fbProfile.id)
            });
            user.save(function(err, user)
            {
                if(err) Err.Log(err, 'error');
                else
                {
                    var name = checkNameValidator(fbProfile.name);
                    var profile = new Profile.mProfile(
                        {
                           nombre_completo :
                           {
                              nombre : name.givenName,
                              apellido_uno : name.familyName,
                              apellido_dos : name.middleName,
                              presentable : name.name
                           },
                           usr_id : user._id,
                           genero : fbProfile.gender,
                           mascotas : [],
                           amigos : [],
                           peticiones_recibidas : [],
                           peticiones_enviadas : []
                        });
                    profile.save(function(err, profile)
                    {
                       if(err) Err.Print(err, 'function auth Profile.save');
                       else
                       {
                          console.log("Usuario nuevo!");
                          var data = { user : usr, profile : profile};
                          /* Aquí habría que crear una llamada a POI.*/
                          var newPOI = new POI.mPOI({
                              info_poi : { nombre : data.profile.nombre_completo.nombre, info : '', visibilidad : 'public' },
                              tipo_poi : 'PERSONA', //tipo_poi, puede tener valores diferentes.
                              POI_owner : data.profile._id,
                              position : {
                                    type : 'Point',
                                    coordinates : [0,0]
                                 },
                              online : true
                              });
                          POI.SaveNewPOIUser(newPOI,function(err, poi)
                          {
                              if(err) Err.Log(err,'error');
                              else if(!poi) Err.Log('no devuelve nada','warning');
                              else data.poi = poi;
                          });
                          done(null, data);
                       }
                    });
                }
            });
        }
        else
        {
           Profile.mProfile.findOne({ usr_id : usr._id }, function(err, profile)
           {
             if(err) Err.Print(err, 'function auth Profile.findOne() ');
             else
             {
                console.log("Usuario antiguo!");
                var data = { user : usr, profile : profile};
                done(null, data);
             }
          });

        }
  });
}

/*
Recuperar el Password Local
-----------------------------------------------------
*/
exports.sendEmail = function(req, res){
   var email = req.body.email;
   Err.Log('eMail recibido:   ' + email);
   var email = req.body.email;
   Err.Log('Enviando email....');

   User.mUser.findOne({'username':email},function(err, user) {
     // In case of any error return
     if (err){
       Err.Log('Error Searching this email: '+err, "error");
       return done(err);
     }
     // already exists
     if (user == null) {
         Err.Log('User not exists', "warning");
         return done(null, false);   //Falta el return bien hecho a la pagina de recuperacion de pass con un mensaje de error "user no existe"
            req.flash('message','User not Exists');

     } else {
         Err.Log('User find!', "success");

         var mailOptions = {
            from: 'KznDog ✔ <KznDog@ruchomolamucho.com>', // sender address
            to: email, // list of receivers
            subject: emailTemplate.Subject,
            text: emailTemplate.Body + "\n\n\t" + emailTemplate.Sign,
            html: emailTemplate.Body + "\n\n\t" + emailTemplate.Sign + '<b>KznDog ✔</b>' // html body
         };
         Err.Log('EMAIL_USER: ' + settings.EMAIL_USER);
         Err.Log('EMAIL_PASS: ' + settings.EMAIL_PASSWORD);

         var transporter = nodemailer.createTransport(smtpTransport({
             host: settings.SERVER_URL,
             port: settings.EMAIL_PORT,
             ignoreTLS : true,
         }));

         Err.Log('Enviando email....' + JSON.stringify(transporter,null,4));

         var token = generateToken();
         transporter.sendMail(mailOptions, function(error, info){
            if(error){
               Err.Log(error,"error");
            }else{
               Err.Log("ACIERTO!","success");
            }
         });
         Err.Log('eMail enviado!\n\t con destinatario: ' + email);

         // falta enviar la url con un token, que expire y todo eso
         res.render('index',{title:'recuperado el pass'});
      }
   });
}

/*
Funciones Auxiliares
-----------------------------------------------------
*/
var createHash = function(password){
   return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}

passport.serializeUser(function(user, done) {
done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

exports.passport = passport;

function generateToken() {
    var buf = new Buffer(16);
    for (var i = 0; i < buf.length; i++) {
        buf[i] = Math.floor(Math.random() * 256);
    }
    var id = buf.toString('base64');
    return id;
}
/*
 *
 * objName es un objeto con la
 * misma configuracion que retorno,
 * excepto el atributo name
 *
 */
function checkNameValidator(objName)
{
   var retorno =
   {
      givenName : objName.givenName,
      familyName : '',
      middleName : '',
      name : ''
   }
   retorno.familyName = (objName.familyName != '') ? objName.familyName : objName.middleName;
   retorno.middleName = (objName.middleName != '') ? objName.middleName : '';
   retorno.name = retorno.givenName + ' ' + retorno.familyName;
   return retorno;
}
