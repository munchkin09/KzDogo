chat.on('chat_message',function(msg)
{
  var resul = chatOrNotify(msg);
  if(resul == '')
  {

  }
  else {
    $('#messages').append(resul);
    $("#messages").scrollTop($("#messages").scrollTop() + 100);
    var obj = { num : 1, bagde : 'chatNotify'}
    notifBagdesController(obj);
  }
});

function chatOrNotify(data)
{
   var divMediaYou = $('<div>', { 'class' : 'media'})
   var divMediaOther = $('<div>', { 'class' : 'media'})
   var linkProfile = $('<a>', { 'href' : 'profile/' + data._id, 'class' : 'lnk_profile'});
   var linkProfile2 = $('<a>', { 'href' : 'profile/' + data._id, 'class' : 'lnk_profile'});
   $('<img>', { 'src' : 'img/default.png', 'class' : 'img-circle img-mascota'}).appendTo(linkProfile);
   $('<img>', { 'src' : 'img/default.png', 'class' : 'img-circle img-mascota'}).appendTo(linkProfile2);
  //var content = "<h4 class='media-heading'>" + data.head + "</h4><p>"+ data.body + "</p>";
  var divBodyRight = $('<div>', { 'class' : 'media-body text-right'});
  var divProfileRight = $('<div>', { 'class' : 'media-right', 'html' : linkProfile2 });
  $('<h4>', { 'class' : 'media-heading', 'html' : data.head}).appendTo(divBodyRight);
  $('<p>', { 'html' : data.body }).appendTo(divBodyRight);
  divBodyRight.appendTo(divMediaOther);
  divProfileRight.appendTo(divMediaOther);

  var divProfileLeft = $('<div>', { 'class' : 'media-left', 'html' : linkProfile });
  var divBodyLeft = $('<div>', { 'class' : 'media-body text-left'});
  $('<h4>', { 'class' : 'media-heading', 'html' : data.head}).appendTo(divBodyLeft);
  $('<p>', { 'html' : data.body }).appendTo(divBodyLeft);
  divProfileLeft.appendTo(divMediaYou);
  divBodyLeft.appendTo(divMediaYou);
  console.dir(data);
  if(!profileId || data.conversacion != conversacion_activa)
  {
    var resul = '';
    var popover = $('#btnNotify').attr('data-content', resul.html()).data('bs.popover');
    popover.setContent();
    popover.$tip.addClass(popover.options.placement);
    $('#btnNotify').popover('toggle');
  }
  /*else if()
  {
    var resul = divMediaOther;
    var popover = $('#btnNotify').attr('data-content', resul.html()).data('bs.popover');
    popover.setContent();
    popover.$tip.addClass(popover.options.placement);
    $('#btnNotify').popover('toggle');

  }*/
  else {
    var resul = (data._id == profileId) ? divMediaYou : divMediaOther;
  }
  return resul;
}

function chatCompose(data)
{
   var divMediaYou = $('<div>', { 'class' : 'media'})
   var divMediaOther = $('<div>', { 'class' : 'media'})
   var linkProfile = $('<a>', { 'href' : 'profile/' + data._id, 'class' : 'lnk_profile'});
   var linkProfile2 = $('<a>', { 'href' : 'profile/' + data._id, 'class' : 'lnk_profile'});
   $('<img>', { 'src' : 'img/default.png', 'class' : 'img-circle img-mascota'}).appendTo(linkProfile);
   $('<img>', { 'src' : 'img/default.png', 'class' : 'img-circle img-mascota'}).appendTo(linkProfile2);
  //var content = "<h4 class='media-heading'>" + data.head + "</h4><p>"+ data.body + "</p>";
  var divBodyRight = $('<div>', { 'class' : 'media-body text-right'});
  var divProfileRight = $('<div>', { 'class' : 'media-right', 'html' : linkProfile2 });
  $('<h4>', { 'class' : 'media-heading', 'html' : data.head}).appendTo(divBodyRight);
  $('<p>', { 'html' : data.body }).appendTo(divBodyRight);
  divBodyRight.appendTo(divMediaOther);
  divProfileRight.appendTo(divMediaOther);

  var divProfileLeft = $('<div>', { 'class' : 'media-left', 'html' : linkProfile });
  var divBodyLeft = $('<div>', { 'class' : 'media-body text-left'});
  $('<h4>', { 'class' : 'media-heading', 'html' : data.head}).appendTo(divBodyLeft);
  $('<p>', { 'html' : data.body }).appendTo(divBodyLeft);
  divProfileLeft.appendTo(divMediaYou);
  divBodyLeft.appendTo(divMediaYou);
  var resul = (data._id == profileId) ? divMediaYou : divMediaOther;

  return resul;
}


    function notifBagdesController(data)
    {
      /*
       * data es un object con los siguientes datos:
       * num : Number( número de notificaciones añadir)
       * bagde : Text( id de la bagde a actualizar )
       *
       */
       var iMensajes = parseInt($('.' + data.bagde).text());
       $('.' + data.bagde).text(iMensajes + data.num);

    }

    function loadHistorial(total)
    {
        var resul = [];
        for (var i = total.mensajes.length - 1; i >= 0; i--)
        {

          var doc = total.mensajes[i];
          if(doc.msg_index != 0)
          {
            var dt = new Date(doc.created);
            var fecha = dt.toLocaleDateString();
            var hora = dt.toLocaleTimeString();
            var dtSmall = '<small> el ' + fecha + ' a las ' + hora + '</small>';
            var data = { _id : doc.perfil_id ,head : doc.nombre + dtSmall, body :  "ha dicho: " + doc.texto, img : 'img/', fecha : doc.created}
            resul.push(chatCompose(data));
            if(i == 0)
            {
              return resul;
            }
          }
          if(i == 0)
          {
            return resul;
          }
        }

    }
