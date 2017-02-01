var User = require('./models/mUser');
/*
 * User.schUser;
 * User.mUser;
 */

var getNewUser = function(req, res)
{
  res.render('user/vAddUser', { title : 'Nuevo Usuario'});
}

/*var postNewUser = function(req, res)
{
    // Añadir función de comprobación de duplicidad de mails / user
    var user = new User(
    {
      fbid : '',
      e_mail : req.body.email,
      password :  req.body.pass
    });

    user.save(function(err, result)
    {
        if(err) errorController.Print(err, 'function postNewUser() user.save');
        console.log("Salvado correctamente");
    });

    //res.json("Creado el usuario:\n" + user);
    var data = { titulo:"Usuario Salvado Correctamente", usuario : user };
    res.render('user/addUser', data);
}*/

var getUser = function(req, res)
{
   User.mUser.findById(req.params.id,'_id e_mail password', function(err, result)
   {
      if(err) errorController.Print(err, 'function getUser() user.index');
      if(result != null)
      {
         res.status(200);
         res.render('user/index', { titulo : "KznDog Perfil DataModel", data : result });
         res.end();
      }
      //res.sendStatus(404);
   });
}

var getUserFb = function(req, res)
{

   /*User.findById(req.params.id,'_id nombre_completo e_mail', function(err, result)
   {
      if(err) errorController.Print(err, 'function getUser() user.index');
      if(result != null)
      {
         res.status(200);
         res.render('user/index', { titulo : "KznDog Perfil DataModel", data : result });
         res.end();
      }
      //res.sendStatus(404);
  });*/
    res.render('home',{title : 'Esta es tu casa'});
}



var getUpdateUser = function(req, res)
{
   //Tank.find({ size: 'small' }).where('createdDate').gt(oneYearAgo).exec(callback);
   User.mUser.findById(req.params.user, '_id e_mail password', function(err, result)
   {
      if(err) errorController.Print(err, 'function getUpdateUser() user.index');
      if(result != null)
      {
         res.status(200);
         res.render('user/vUpdateUser', { title : 'Actualizar Usuario', data : result })
         res.end();
      }
      //res.sendStatus(404);
   });
}

var putUpdateUser = function(req, res)
{
   var objId = req.body.id;
   User.mUser.findById(objId, function(err, result)
   {
      if(err) errorController.Print(err, 'function putUpdateUser() user.index');
      result.e_mail = req.body.email;
      result.update();
      res.status(200);
      res.render('user/' + result._id, { title : 'Actualizar Usuario', data : result })
      res.end();

      //res.sendStatus(404);
   });
}

var deleteUser = function(req, res)
{
    /* Para poder dar de baja la cuenta */
}

exports.GetNewUser = getNewUser;
//exports.PostNewUser = postNewUser;

exports.GetUser = getUser;
exports.GetUserFb = getUserFb;

exports.GetUpdateUser = getUpdateUser;
exports.PutUpdateUser = putUpdateUser;

exports.DeleteUser = deleteUser;
