var cnnDb = require('../connection_controller');    //  controlador conexion
var errorController = require('../error_controller');     // controlador errores

var mapPOISchema = cnnDb.Mongoose.Schema(
   {
      info_poi : { nombre : String, info : String, visibilidad : String },
      tipo_poi : String, //tipo_poi, puede tener valores diferentes. Concretamente, PERSONA ó POI
      POI_owner : { type : cnnDb.ObjectId, index : 1 },
      position : {
            type : { type : String },
            coordinates : { type : [Number], index: { type: '2dsphere', sparse: true } }
         },
      created: {type: Date, default: Date.now},
      grupos : [{ grupo_id : {type: cnnDb.ObjectId}, visibilidad : { type : Boolean} }],
      para_amigos : { type : Boolean },
      online : { type : Boolean }
});

/*var mapRouteSchema = cnnDb.Mongoose.Schema(
   {
      POI_owner : { type : String },
      position : {
         type : { type : String },
         coordinates :  { type : [Number]}
      },
      created: {type: Date, default: Date.now}
  });*/

//mapRouteSchema.index({ position: '2dsphere' });

var POI = cnnDb.Mongoose.model('mapPOI', mapPOISchema, 'mappois');
//var RUTA = cnnDb.Mongoose.model('route', mapRouteSchema, 'mappois');

//mapPOISchema.index({ position : '2dsphere' });


exports.SaveNewPOIUser = function(data_poi, next)
{
   var new_poi = new POI(data_poi);
   new_poi.save(data_poi, function(err,result)
   {
      /* Peligro, esta llamada es cuando un usuario nuevo ha sido creado. */
      if(err) next(err,null);
      else if(!result) next(null,null);
      else if(result) next(null, result);
   });
}

exports.ConseguirPOIById = function(data_poi, next)
{
   POI.findOne({POI_owner : data_poi.profile_id },function(err, result)
   {
      if(err) next(err,null);
      else if(!result) next(null, null);
      else if(result) next(null, result);
   })
}

exports.ActualizarPOIById = function(data_poi, next)
{
   POI.update({ POI_owner : data_poi.profile_id },{ $set : { 'position.coordinates' : data_poi.coords, online : data_poi.status }}, function(err, result)
   {
      if(err) next(err,null);
      else if(!result) next(null, null);
      else if(result) next(null, result);
   });
}



exports.schPOI = mapPOISchema;
exports.mPOI = POI;
