var POI = require('./models/mMap');
var Perfil = require('./models/mProfile');
/*
 * POI.schPOI;
 * POI.mPOI;
 */

exports.index = function(req, res){
  res.render('map/home', { title: 'Mapa de prueba', variados : [1,2,3,4,5,6,7] });
};

exports.savePOI = function(req, res)
{
   /*
   var mapPOISchema = cnnDb.Mongoose.Schema(
   {
      info_poi : { nombre : String, info : String, visibilidad : String },
      tipo_poi : String, //tipo_poi, puede tener valores diferentes. Concretamente, GRUPO, PERSONA, POI
      POI_owner : { type : cnnDb.ObjectId },
      position : {
            type : { type : String },
            coordinates : { type : [Number], index: { type: '2dsphere', sparse: true } }
         },
      created: {type: Date, default: Date.now},
      online : { type : Boolean }
   });

   */
   Profile.FindById(req.body.nombre, function(err, result)
   {

   })
   var newPOI = new POI.mPOI({
      info_poi : { nombre : req.body.nombre, info : req.body.prop, visibilidad : 'public' },
      tipo_poi : req.body.type.toUpperCase(), //tipo_poi, puede tener valores diferentes.
      POI_owner : req.body.nombre,
      position : {
            type : req.body.geoType,
            coordinates : req.body.coords
         },
      online : req.body.status
      });

   newPOI.save(function(err)
   {
      if(err) errorController.Log(err, 'error');
      console.log("Salvado correctamente");
   });

   //res.json("Creado el usuario:\n" + user);
   var data = {titulo:"POI Salvado Correctamente", POI : newPOI}

   //Como estas funciones van a ser llamadas asíncronas, responden siempre con JSON
   //console.log(req);
   res.json(data);
   //res.render('user/addUser', data);
}

exports.SavePOIWhenOnline = function(req, res)
{
   /* A esta function hay que pasarle un objeto con los siguientes datos */
   var data_poi = {profile_id : req.user.profile._id, coords : req.body.coords, status : true }
   POI.ActualizarPOIById(data_poi, function(err, result)
   {
      if(err) res.json({status:'no ok'});
      else if(!result) res.json({status : 'no encontrado'});
      else if(result)
      {
         res.json({status : 'ok'});
      }
   });
}

exports.SavePOIWhenOffline = function(data_poi, next)
{

   POI.ActualizarPOIById(data_poi, function(err, result)
      {
         if(err) next(err, null);
         else if(!result) next(null,null);
         else if(result) next(null, result);
      });
}

exports.GetPOIsNearTo = function(req, res)
{
   /*
   * Una vez el usuario ha sido actualizado con su ubicación y su estado en Online true
   * deberíamos mostrar su ubicación a sus amigos y grupos conectados.
   * Esto debería ocurrir del siguiente modo:
   * , se hace el barrido
   * para comprobar la visibilidad de cada uno de los objetos según las config
   * de privacidad puestas en ese momento. Luego, cada uno que sea candidato a
   * ser mostrado, se añade a un array de marcadores que se devolverán al usuario
   * para dibujar su mapa. Y se generará también el POI para otros usuarios que estén conectados.
   */
    if(req.params.tipo == 'MIX')
    {
       status_query = {'online' : true, 'tipo_poi' : 'PERSONA', 'info_poi.visibilidad' : 'public'};
    }
    else if(req.params.tipo == 'POI') //Esta opción, mejor no usarla. Pedir de forma indepediente POI´s y GRUPOS/PERSONAS
    {
      status_query = {'online' : true, 'tipo_poi' :  'POI', 'info_poi.visibilidad' : 'public'};
    }
    /*else
    {
       status_query = {'online' : true, 'tipo_poi' : req.params.tipo, 'info_poi.visibilidad' : 'public'};
    }*/
   var point = { type : "Point", coordinates : [ parseFloat(req.params.lat), parseFloat(req.params.lon) ] }
   // -Se recuperan sus grupos y las _id´s de sus amigos conectados.
   POI.mPOI.geoNear(point, { maxDistance : 10000, spherical : true, query : status_query }, function(err, results, stats) {
      if(results.length > 0)
      {
         /*
          * se hace el barrido
          * para comprobar la visibilidad de cada uno de los objetos según las config
          * de privacidad puestas en ese momento
          */
          /*var amigos = [];
          var grupos = [];
          for (var i = 0; i < req.user.profile.amigos.length; i++)
          {
             amigos.push(req.user.profile.amigos[i].amigo_id);
          }
          for (var i = 0; i < req.user.profile.grupos.length; i++)
          {
             grupos.push(req.user.profile.grupos[i]._id);
          }*/
          var retorno = /*{ amigos: [], grupos : [], desconocidos: [], estaticos: [] }*/results;
          var iAmigos = 0;
          /*for (var i = 0; i < results.length; i++)
          {
             //Este POI es amigo de la persona que se acaba de conectar.
              if( amigos.indexOf(results[i].POI_owner) >= 0)
              {
                 if(results[i].visible_amigos == true)
                 {
                    retorno.amigos.push(results[i]);
                    es_amigo = true;
                    iAmigos++;
                 }
              }

              if(results.grupos)  //Si no es amigo, habría que comprobar si pertenece a algún grupo de los que tengo
              {
                 for (var x = 0; x < results[i].grupos.length; x++)
                 {
                    if(grupos.indexOf(results[i].grupos[x]) >= 0)
                    {
                       if(results[i].grupos[x].visibilidad == true /*&& req.user.profile.grupos[grupos.indexOf(results[i].grupos[x])])
                       {
                         console.log("grupo");
                          retorno.grupos.push(results[i].grupos[x]);
                          if(es_amigo)
                          {
                            retorno.grupos[retorno.grupos.length-1].es_amigo = true;
                          }
                       }
                    }
                 }
              }
              /* Con el código hasta aquí se ha configurado un set de geolocalizaciones
               * de amigos y grupos, teniendo en cuenta la configuración del usuario ajeno
               * al que hace la petición.
               * Lo siguiente sería, si el usuario tiene marcado la visibilidad en false para algún grupo en particular o la opción general marcada a privado
               */
          //}
         res.json(retorno);
      }
      else
      {
         res.json([]);
         res.end();
      }
   });

}

exports.PostSaveRoute = function(req, res)
{
   /*var varRuta = new RUTA({
      POI_owner : req.body.nombre,
      position : {
         type : req.body.geoType,
         coordinates : req.body.coords
      }
   });
   //console.log(route);

   varRuta.save(function(err)
   {
      if(err) errorController.Print(err, 'function saveRoute() map.saveRoute');
      console.log("Salvado correctamente");
   });

   //res.json("Creado el usuario:\n" + user);
   var data = {titulo:"POI Salvado Correctamente", POI : varRuta}

   //Como estas funciones van a ser llamadas asíncronas, responden siempre con JSON
   //console.log(req);
   res.json(data);*/
   //res.render('user/addUser', data);
}
