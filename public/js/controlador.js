var socket_ops = { /*reconnectionDelay : 10000*/ },
	notif = io('/notif', socket_ops),
	chat,
	profile_id, // Jaja, algún día por cosas como esta me odiaré mucho
	profileId,	// No pienso decir la diferencia.
	conversacion_activa,
	modal_content;

	/*$touchArea = $('#touchArea'),*/
 var touchStarted = false, // detect if a touch event is sarted
 currX = 0,
 currY = 0,
 cachedX = 0,
 cachedY = 0;

$(document).ready(function()
{
		var options_popover =
		{
			content : 'No hay notificaciones, todavía' ,
			title : 'kz Notificaciones 0.7.3',
			placement : 'bottom',
			html : true
		}
		notif.emit('online_connection');

		$('#btnNotify').popover(options_popover);
		$('#btnAmigos').click(boton_amigos);
		$('#btnAmigos2').click(boton_listado);
		$('#btnChats').click(boton_chats);
		$('#btnHome').click(function(e)
		{
			e.preventDefault();
			check_visibility({kz : 'map'});
		});
		$('#btnPerfil').click(boton_perfil);
		$('#btnNotify').click(function(e)
		{
			e.preventDefault();
			//notif.emit('checkUpdate');
			//notif.emit('checked');
		});
		$('#btnLogout').click(function()
		{
			//notif.emit('checkUpdate');
			window.location.href = "/logout";
		});
});

/*
	* Aquí habrá que hacer unas funciones que se encarguen de recibir toda
* las acciones de navegación y posibles avisos o lo que sea que haya
* durante la ejecución de la app
*/

notif.on('connect', function()
{

});
notif.on('error', function(error)
{
	alert(error);
	notif = '';
	chat = '';
	reloadSocket();
});
notif.on('reconnect', function(datum)
	{
		var data = {
			contentType : 'json',
			async: true,
			dataType: "json",
			type: "put",
			url: "/authsocket",
			send : datum
		}
		ajaxCall(data, function(dataa)
		{
			if(dataa.status == 'ok!!!!')
			{
					notif.emit('weAreOn');
					chat = io('/chat', socket_ops);
					$('#ext-script').attr('src', dataa.script);
			}
			else alert(dataa.status);
		});
	});
notif.on('ok', function(txt)
{
		$('#dataChange').val(txt);
});

notif.on('churifluri', function(datum)
{
		var data = {
			contentType : 'json',
			async: true,
			dataType: "json",
			type: "put",
			url: "/authsocket",
			send : datum
		}
		ajaxCall(data, function(dataa)
		{
			if(dataa.status == 'ok!!!!')
			{
					notif.emit('weAreOn');
					chat = io('/chat', socket_ops);
					$('#ext-script').attr('src', dataa.script);
			}
			else alert(dataa.status);
		});
});
notif.on('notif_amistad', function(obj)
{
	popoverNotif(obj);
	chat.emit('joinChatRoom', obj.room);
})
notif.on('notif', function(obj)
	{
		popoverNotif(obj);
	});
	notif.on('ext_conn', function(txt)
	{
			var popover = $('#btnNotify').attr('data-content',txt).data('bs.popover');
			popover.setContent();
			popover.$tip.addClass(popover.options.placement);
			$('#btnNotify').popover('toggle');
	});

	$('#btnNotify').on('shown.bs.popover', function ()
	{
			setTimeout(function()
				{
					$('#btnNotify').popover('hide');
				},
				4000);
	});


	$('#modalMascota').on('show.bs.modal', function (e)
	{
			$(this).html(mascota);
	});

	$('#modalGeneral').on('show.bs.modal', function (e)
	{
		  $(this).html(modal_content);
	});

	$(document).on('click','.agenda',function()
   {
      if($(this).hasClass('active'))
      {
         $(this).removeClass('active')
      }
      else
      {
         $(this).addClass('active')
      }
   });

	/*$(document).on('click touchstart','.menu_superior',function()
   {
      $(this).addClass('active')
   });

	$(document).on('mouseup touchend','.menu_superior',function(e)
   {
      $(this).removeClass('active').children('a').click();
   });*/

	$(document).on('click','.getMascota', function(e)
	{
		e.preventDefault();
		var data = {
			contentType : 'html',
			dataType : '',
			type: "get",
			url: this.href
		}
		ajaxCall(data, function(dataa)
		{
			mascota = dataa;
			$('#modalMascota').modal('show');
		});
	});

	$(document).on('click','.addFriend', function(e)
   {
		e.preventDefault();
		var data = {
			contentType : 'json',
			dataType: "html",
			type: "post",
			url: '/friend_request',
			send : { req_prfl : this.value}
		}
		ajaxCall(data, function(dataa)
		{
			$(this).attr('text','Petición enviada!');
			//$('#modalMascota').modal('show');
		});
   });

	$('#main_menu').on('show.bs.collapse', function(e)
   {
      $('#status_menu').removeClass('glyphicon-triangle-bottom').addClass('glyphicon-triangle-top');
   });
	$('#main_menu').on('hide.bs.collapse', function(e)
	{
	   $('#status_menu').removeClass('glyphicon-triangle-top').addClass('glyphicon-triangle-bottom');
	});

	$(document).on('click','#btnAddProfiles',function(e)
	{
		e.preventDefault();
		$('#friendContainer .list-group-item').each(function(i)
		{
			if($(this).hasClass('active'))
			{
				var swapper = this.cloneNode(true);;
				$(swapper).removeClass('active');
				$('#integrantesContainer').prepend(swapper);
			}
		});
		$('#modalGeneral').modal('hide')
	});


	$(document).on('click','#addGroupProfile', function(e)
	{
		e.preventDefault();
		var data = {
	contentType : 'html',
	dataType : '',
	url : '/getFriendsList/agenda',
	type : 'get'
	}
	ajaxCall(data, function(resul)
		{
				modal_content = resul;
				$('#modalGeneral').modal('show');
		})
	});

	$(document).on('submit','#frmGrupo',function(e)
	{
		var btn = this;
		e.preventDefault();
		var data = {
		type : 'post',
		contentType : 'json',
		url : '/post_new_group',
		send : $("#frmGrupo").serialize()
		};
		ajaxCall(data,function(resul)
			{
				$(btn).addClass('disabled').html('Salvado correctamente!');
			})
	});

	$(document).on('click','.btnMensaje',function(e)
	{
		var conversacion = this.value;
		conversacion_activa = conversacion;
		var data = {
		contentType : 'html',
		dataType : '',
		url : '/chat/' + conversacion,
		type : 'get'
		}
		ajaxCall(data, function(result)
		{
			$('#kz-container').html(result);
			chat.emit('joinChatRoom', conversacion);
		});
		e.preventDefault();
		return false;
	});
	$(document).on('click', 'a.list-group-item.friend_link',function(e)
	{
		e.preventDefault();
		setProfileURL(this);
		//alert(this.id);
	});
	$(document).on('click','button.btnAction', function(e)
	{
		e.preventDefault();
		var id,
			data;
		if(this.value == 'remove')
		{
			id = $(this).parent().attr('id');
			data = {
				contentType : 'json',
				dataType : 'json',
				url : '/delete_friend',
				type : 'put',
				send : { 'id' : id },
			}
			ajaxCall(data, function(result)
			{
				console.dir(result);
			});
		}
		else if(this.value == 'remove_group')
		{
			id = $(this).parent().attr('id');
			data = {
				contentType : 'json',
				dataType : 'json',
				url : '/leave_group',
				type : 'put',
				send : { 'id' : id },
			}
			ajaxCall(data, function(result)
			{
				console.dir(result);
			});
		}
		else
		{
			id= $(this).siblings(':hidden').attr('value');
			containerRequested = this;
			data = {
				contentType : 'json',
				dataType : 'json',
				url : '/friend_request',
				type : 'put',
				send : { 'id' : id, 'response' : this.value },
			}
			ajaxCall(data, function(resultado)
			{
				if(typeof resultado == 'object')
				{
					console.dir(data);
					var friendContainer = "<a id='"+ id +"' class='list-group-item'><img src='img/default_p.jpg' class='img-mascota img-circle' />" + resultado.nombre + "<button value='" + resultado._id + "' class='btnMensaje btn btn-success btn-md btn-link' ><span class='glyphicon glyphicon-envelope'></span></button><button value='remove' class='btnAction btn btn-danger btn-md btn-link'><span class='glyphicon glyphicon-remove'></span></button>";
					//$('#kz-container').html(result);
					$('#friendContainer').append(friendContainer);

					containerRequested.fadeOut(1000, function()
					{

					});
				}
			});

		}

		return false;
	});

	$(document).on('click','button.btnActionGrupo', function(e)
{
	e.preventDefault();
	var id,
		data;
	/*if(this.value == 'remove')
	{
		id = $(this).parent().attr('id');
		data = {
			contentType : 'json',
			dataType : 'json',
			url : '/delete_group',
			type : 'put',
			send : { 'id' : id },
		}
		ajaxCall(data, function(result)
		{
			console.dir(result);
		});
	}
	else
	{*/

		id= $(this).siblings(':hidden').attr('value');
		containerRequested = this;
		data = {
			contentType : 'json',
			dataType : 'json',
			url : '/put_action_group',
			type : 'put',
			send : { 'id' : id, 'response' : this.value },
		}
		ajaxCall(data, function(resultado)
		{
			if(typeof resultado == 'object')
			{
				console.dir(data);
				var groupContainer = "<a id='"+ id +"' class='list-group-item'><img src='img/default_p.jpg' class='img-mascota img-circle' />" + resultado.nombre + "<button value='" + resultado._id + "' class='btnMensaje btn btn-success btn-md btn-link' ><span class='glyphicon glyphicon-envelope'></span></button><button value='remove' class='btnAction btn btn-danger btn-md btn-link'><span class='glyphicon glyphicon-remove'></span></button>";
				//$('#kz-container').html(result);
				$('#groupContainer').append(groupContainer);
				containerRequested.fadeOut(1000, function()
				{

				});
			}
		});

	//}

	return false;
});



	$(document).on('click','#crearGrupo', function(e)
	{
		var data = {
				contentType : 'html',
				dataType : '',
				url : '/new_group',
				type : 'get'
		}
		e.preventDefault();
		ajaxCall(data, function(result)
		{
				$('#kz-container').html(result)
				//$('#modalGeneral').modal('show');
		});
	});


	/*$('a.list-group-item').click(function(e)
	{
		e.preventDefault();
		var data = {
			contentType : 'html',
			dataType : '',
			url : '/profile/' + this.id,
			type : 'get'
		}
		ajaxCall(data, function(result)
		{
			$('#kz-container').html(result);
		});
		//alert(this.id);
	});*/





function setProfileURL(data)
{
	if(data.id == profileId)
	{
		var data = {
				contentType : 'html',
				dataType : '',
				url : '/home',
				type : 'get'
		}
	}
	else
	{
		var data = {
			contentType : 'html',
			dataType : '',
			url : '/profile/' + data.id,
			type : 'get'
		}
	}

	ajaxCall(data, function(result)
	{
			$('#kz-container').html(result);
			check_visibility({kz : 'container'});
	});
}

function ajaxCall(data, next)
{
	$.ajax({
			async : true,
			cache : false,
			dataType : data.dataType,
			contenType : data.contentType,
			type: data.type,
			crossDomain : false,
			url : data.url,
			data : data.send,
			beforeSend : function(XHR, settings)
			{

			},
			error : function(XHR, status, err)
			{
				console.log(err);
			},
			complete : function(XHR, status)
			{

				var objMenu = $('#main_menu');
				objMenu.collapse('hide')
				/*$('#personal ul').each('li',function(item)
				{
					if($(item).hasClass('active'))
					{
						$(item).removeClass('active');
					}
				});*/


				return true;
			},
			success : function(data, status, xhr)
			{
				profileId = '';
				next(data);
			}
	});
}

function popoverNotif(obj)
{
	var popover = $('#btnNotify').attr('data-content', obj.txt).data('bs.popover');
	popover.setContent();
	popover.$tip.addClass(popover.options.placement);
	$('#btnNotify').popover('toggle');
}


function boton_show_mapa()
{
	check_visibility({kz : 'map'});
}

function boton_amigos()
{
	//e.preventDefault();
	//$(this).addClass('active')
	var data = {
			contentType : 'html',
			dataType : '',
			url : '/getFriendsList/default',
			type : 'get'
	};
	ajaxCall(data, function(data)
	{
		$('#kz-container').html(data);
		check_visibility({kz : 'container'});
	})
}

function boton_listado()
{
	//e.preventDefault();
	var data = {
			contentType : 'html',
			dataType : '',
			url : '/getProfilesList/default',
			type : 'get'
	}
	ajaxCall(data, function(data)
	{
		$('#kz-container').html(data);
		check_visibility({kz : 'container'});

	})
}

function boton_home(e)
{
	if(typeof e == 'object')
	{
		e.preventDefault();
		//$(this).addClass('active')
	}
	else
	{
		profile_id = e;
	}

	var data = {
			contentType : 'html',
			dataType : '',
			url : '/map',
			type : 'get'
			}
	ajaxCall(data, function(data)
	{
			$('#kz-map').html(data);
			check_visibility({kz : 'map'});
	});
}

function boton_perfil()
{
	var data = {
			contentType : 'html',
			dataType : '',
			url : '/profile',
			type : 'get'
	}
	ajaxCall(data, function(data)
	{
		$('#kz-container').html(data);
		$(this).removeClass('active')
		check_visibility({kz : 'container'});
	});

}

function check_visibility(obj)
{
	//Se está llamando a una vista que se cargará en el contenedor kz-container
	if(obj.kz == 'container')
	{
		if($('#kz-container').hasClass('hidden'))
		{
			$('#kz-container').removeClass('hidden')
		}
		$('#kz-map').addClass('hidden')
	}
	else if(obj.kz == 'map')//se está cargando contenido para el mapa
	{
		if($('#kz-map').hasClass('hidden'))
		{
			$('#kz-map').removeClass('hidden');
		}
		$('#kz-container').addClass('hidden')
	}

}
function boton_chats()
{
	var data = {
			contentType : 'html',
			dataType : '',
			url : '/chats',
			type : 'get'
	}
	ajaxCall(data, function(data)
	{
		$('#kz-container').html(data);
		$(this).removeClass('active')
		check_visibility({kz : 'container'});
	});
}

function reloadSocket()
{
	notif = io('/notif', socket_ops);
}
