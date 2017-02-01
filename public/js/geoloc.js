var geo_options = {
       enableHighAccuracy: true,
       maximumAge        : 30000,
       timeout           : 27000
    },
   data = [],
   wp,
   mp_point_1 = [],
   x,
   map,
   mapOptions,
   geoLoc = { lat : 0, lon : 0, accu : 0, inicial : true},
   coords;

$(document).on('click', '#addPOI', function(e)
{
   //alert("POI add");
   e.preventDefault();

   if(geoLoc.accu <= 34)
   {
      navigator.geolocation.getCurrentPosition(showPosition, errorMapHandler);
   }
   $.ajax({
      async: true,
      dataType: "json",
      success: function (data, textStatus)
      {
         //alert("ok");
      },
      type: "post",
      url: "/savePOI",
      data : { nombre : "Carlos", type : "POI", geoType : "Point", coords : [geoLoc.lat, geoLoc.lon], prop : "Me cagüen sos!" }
   });
});

$(document).on('click','#loadPOIs', function(e)
{
   //alert("POI add");
   e.preventDefault();
   updatePOISet();
});

$(document).on('click','#recRoute', function(e)
{
   e.preventDefault();
   //navigator.geolocation.getCurrentPosition(showPosition, errorHandler);
   //mp_point_1.push([geoLoc.lat,geoLoc.lon]);
   //console.log(mp_point_1.toSource());
   //wp  = navigator.geolocation.watchPosition(recPosition);

   //alert("POI add");
   /*$.ajax(
   {
      async: true,
      dataType: "json",
      success: function (data, textStatus)
      {
         data.forEach(function(item, index, data)
            {
               geoLoc.lat = item.obj.position.coordinates[0];
               geoLoc.lon = item.obj.position.coordinates[1];
               setMarkers(map);
            });
      },
      type: "get",
      url: "/getPOIs/" + geoLoc.lat + "/" + geoLoc.lon
   });*/
});


$(document).on('click','#stopRoute', function()
{
   e.preventDefault();
   /*navigator.geolocation.clearWatch(wp);
   //alert(data);
   data.forEach(function(item, index, data)
   {
      geoLoc.lat = item.obj.position.coordinates[0];
      geoLoc.lon = item.obj.position.coordinates[1];
      setMarkers(map);
   });*/
   //alert("POI add");
   /*$.ajax(
      {
      async: true,
      dataType: "json",
      success: function (data, textStatus)
      {

      },
      type: "post",
      url: "/saveRoute",
      data : { nombre : "Carlos", type : "Route", geoType : "MultiLineString", coords : data.toSource(), prop : "Una rústica ruta guf guf!" }
   });*/
});




function map_initialize(config)
{

   mapOptions = {
      center: new google.maps.LatLng(config.lat, config.lon),
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
   };
   //alert(geoLoc.lat + " " + geoLoc.lon);
   var confMarker = { img : 'img/youPOI.png', nombre : 'Tú'}
   if(typeof map == 'object')
   {
      setMarkers(map,geoLoc.lat,geoLoc.lon,confMarker);
   }else
   {
      map = new google.maps.Map(document.getElementById("map_canvas"),
         mapOptions);
         setMarkers(map,geoLoc.lat,geoLoc.lon,confMarker);
         send_coords(config.lat,config.lon, true);
   }

}

function setMarkers(map,lat,lon,config)
{
   // Add markers to the map
   // Origins, anchor positions and coordinates of the marker
   // increase in the X direction to the right and in
   // the Y direction down.

   var image = {
      url: config.img,
      // This marker is 20 pixels wide by 32 pixels tall.
      size: new google.maps.Size(32, 32),
      // The origin for this image is 0,0.
      origin: new google.maps.Point(0,0),
      // The anchor for this image is the base of the flagpole at 0,32.
      anchor: new google.maps.Point(0, 32)
   };


   var myLatLng = new google.maps.LatLng(lat, lon);
   var marker = new google.maps.Marker({
      position: myLatLng,
      map: map,
      icon: image,
      title: config.nombre,
      zIndex: 0
   });

}


function errorMapHandler(error) {
  var geo_options = {
    enableHighAccuracy: false,
    maximumAge        : 30000,
    timeout           : 27000
  };
  navigator.geolocation.getCurrentPosition(showPositionInicial, errorMapHandlerLow, geo_options);
}

function errorMapHandlerLow(error) {
   alert('Attempt to get location failed: ' + error.message);
}


function showPosition(position)
{

   geoLoc.lat = parseFloat(position.coords.latitude);
   geoLoc.lon = parseFloat(position.coords.longitude);
   geoLoc.accu = parseFloat(position.coords.accuracy);
   //alert(geoLoc.accu)
   //descomentar para que se pinte el punto inicial en el mapa de google maps
   //map_initialize(geoLoc);
}

function showPositionInicial(position)
{

   geoLoc.lat = parseFloat(position.coords.latitude);
   geoLoc.lon = parseFloat(position.coords.longitude);
   geoLoc.accu = parseFloat(position.coords.accuracy);
   //alert(geoLoc.accu)
   //descomentar para que se pinte el punto inicial en el mapa de google maps
   map_initialize(geoLoc);
   setTimeout(loadStaticPOI(),1200);
   setInterval(updatePOISet(), 20000);
}

function recPosition(position)
{
   /*mp_point_1.push([parseFloat(position.coords.latitude), parseFloat(position.coords.longitude)]);
   data.push(mp_point_1);
   mp_point_1.splice(0,1);*/
   if(geoLoc.lat != position.coords.latitude & geoLoc.lon != position.coords.longitude)
   {

   }
}

function failRecord(err)
{
   alert(err.message);
}

function send_coords(lat,lon, status)
{
   $.ajax({
      async: true,
      dataType: "json",
      success: function (data, textStatus)
      {
         //alert("ok");
      },
      type: "put",
      url: "/POIupdate",
      data : { profile : profile_id, coords : [geoLoc.lat, geoLoc.lon], status : status }
   });
}

function updatePOISet()
{
   $.ajax(
   {
      async: true,
      dataType: "json",
      success: function (data, textStatus)
      {
         data.forEach(function(item, index, arr)
            {
              console.dir(item);
               if(item.obj.POI_owner != profile_id)
               {
                  var config = {img : '', nombre : ''};
                  switch(item.obj.tipo_poi)
                  {
                     case 'PERSONA':
                        config.img = 'img/dogPOI.png'
                        break;
                     case 'GRUPO':
                        config.img = 'img/groupPOI.png'
                        break;
                     case 'POI':
                        config.img = 'img/dogPOI.png'
                        break;
                     default:
                        config.img = 'img/youPOI.png'
                        break;
                  }
                  setMarkers(map,item.obj.position.coordinates[0],item.obj.position.coordinates[1],config);
               }
            });
      },
      type: "get",
      url: "/getPOIs/" + geoLoc.lat + "/" + geoLoc.lon + "/MIX"
   });
}

function loadStaticPOI()
{
   $.ajax(
   {
      async: true,
      dataType: "json",
      success: function (data, textStatus)
      {
         var config = {img : '/img/dogPOI.png', nombre : ''};
         data.forEach(function(item, index, arr)
            {

               config.nombre = item.obj.info_poi.nombre;
               setMarkers(map,item.obj.position.coordinates[0],item.obj.position.coordinates[1],config);
            });
      },
      type: "get",
      url: "/getPOIs/" + geoLoc.lat + "/" + geoLoc.lon + "/POI"
   });
}


notif.on('addPOI',function(data)
{

});

notif.on('updatePOI',function(data)
{

});

notif.on('removePOI',function(data)
{

});
