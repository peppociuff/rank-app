var db;
$(document).on("pageinit", this, function(e) {
        e.preventDefault();
        db = new localdb('Rankings');
        if (!db.tableExists('rank_list')) {
            db.createTable('rank_list');
        }
        if (!db.tableExists('rank_items')) {
            db.createTable('rank_items');
        }
	$.mobile.pushStateEnabled = false;
	$.mobile.defaultPageTransition = 'none'; 
});

$(document).on("pagebeforeshow", "#home", function() {
	printList();
	
	$(document).on('taphold', '.ran li',function(e) {
		if (e.handled !== true) {
			e.handled = true;
			chooseItem(this.id,'list');
		}
	});
	
	$(document).on('click', '#modifyList',function(e) {
		if (e.handled !== true) {
			$("#manageList").popup("close");
			e.handled = true;
            $.mobile.changePage("#new");	
		}
	});
		   
	$(document).on('click', '#deleteList',function(e) {
		if (e.handled !== true) {
			$("#manageList").popup("close");
			var removeId = window.localStorage.getItem("manage");
			db.removeById('rank_list', removeId);
			db.remove('rank_items', {'rank_oid': removeId});
			window.localStorage.removeItem("manage");
			$('.ran li#'+removeId).remove();
			$("#manageList").popup("close");
			e.handled = true;
			printList();
		}
	}); 	
	$(document).on('click', '#about',function(e) {
		if (e.handled !== true) {
			e.handled = true;
			openPopUp("info");
		}
	});	
});
$(document).on("pagebeforeshow", "#items", function() {
	printItems();
	
	$(document).on('click', '#deleteCompetitor',function(e) {
		if (e.handled !== true) {
			var removeId = window.localStorage.getItem("manage");
			db.removeById('rank_items', removeId);
			window.localStorage.removeItem("manage");
			$('li#'+removeId).remove();
			$("#manageItem").popup("close");
			e.handled = true;
			updateItems();
		}
	});
	
	$(document).on('click', '#modifyCompetitor',function(e) {
		if (e.handled !== true) {
			$("#manageItem").popup("close");
			$.mobile.changePage("#add_competitor");
			e.handled = true;
		}
	});
	
	$(document).on('taphold', '#sortable li',function(e) {
		if (e.handled !== true) {
			e.handled = true;
			chooseItem(this.id,'item');
		}
	});
});
		
$(document).on("pagebeforeshow", "#new", function() {
	if (window.localStorage.getItem("manage") != undefined){
		var id = window.localStorage.getItem("manage");
		window.localStorage.removeItem("manage");
		var result = db.findById('rank_list', id);
		 $('#title').val(result.title);
		 $('#desc').val(result.description);
		 $('#hiddenList').val(id);
	}else{
		$('form').find("input[type=text], textarea, hidden").val("");
		$('#hiddenList').val("");
	}
	window.localStorage.removeItem("key");
	$('#title').on('focus', function() {
		document.body.scrollTop = $(this).offset().top;
	});
	$('#desc').on('focus', function() {
		document.body.scrollTop = $(this).offset().top;
	});

	$(document).on('click', '#save',function(e) {
		if ((e.handled !== true) && ($("#newForm").valid())) {
			e.handled = true;
			addRank();
		}
	}); 	
	$( "#newForm" ).validate({
		messages: {
			title: "Title is required.",
		},
		focusInvalid: false
	});
	
});

$(document).on("pagebeforeshow", "#add_competitor", function() {
	if (window.localStorage.getItem("manage") != undefined){
		var id = window.localStorage.getItem("manage");
		window.localStorage.removeItem("manage");
		var result = db.findById('rank_items', id);
		if (result != undefined){
			$('#vote').val(result.vote).selectmenu('refresh');
			$('#title_competitor').val(result.name);
			$('#note').val(result.note);
			$('#imageView').attr("src", result.image);
			$('#hiddenOid').val(id);
		}
	
	}else{
		$('form').find("input[type=text], textarea, hidden").val("");
		$('#vote').val("").selectmenu('refresh');
		$("#imageView").attr("src", "");
		$('#hiddenOid').val("");
	}
	
	$('#title_competitor').on('focus', function() {
		document.body.scrollTop = $(this).offset().top;
	});
	
	$('#note').on('focus', function() {
		document.body.scrollTop = $(this).offset().top;
	});
	
	$(document).on('click', '#addItem',function(e) {
		if ((e.handled !== true) && ($("#newItem").valid())) {
			e.handled = true;
			insertItem();
		}
	});
	
	$(document).on('click', '#photoFromGallery',function(e) {
		if (e.handled !== true) {
			e.handled = true;
			$("#photoTypeSelection").popup("close");
			getPhoto(true);
		}
	});
	
	$(document).on('click', '#photoFromCamera',function(e) {
		if (e.handled !== true) {
			e.handled = true;
			$("#photoTypeSelection").popup("close");
			getPhoto(false);
		}
	});
	$( "#newItem" ).validate({
		messages: {
			competitor: "Name is required.",
		},
		focusInvalid: false
	});
});




function addRank() {
	var oid = $('#hiddenList').val();
	var title = $('#title').val();
	var desc = $('textarea#desc').val();
	if (oid != ""){
		db.updateById('rank_list', {
			'title': title,
			'description':desc,
		}, oid);
		$('#hiddenList').val("");
		window.localStorage.removeItem("key");
		$.mobile.changePage("#home");
	}else{
		var id = db.insert('rank_list', {
			'title': title,
			'description': desc
		});
		window.localStorage.setItem("key", id);
		$.mobile.changePage("#items");
	}
	return;
}

function printList() {
	$("#list").empty();
	var result = db.find('rank_list');
	var ris = '';
	var i = 0;
	while (i < result.length) {
		if (i == 0) {
			ris += '<ul style="margin-left: auto; margin-right: auto;" class="ran" data-inset="true"  data-role="listview"><li role="heading" data-role="list-divider"  data-theme="f">Your Rankings</li>';
		}
		var resultPhoto = db.find('rank_items', {'rank_oid': result[i].ID});
		resultPhoto.sort(order);
		var photo = null;
		if (resultPhoto.length != 0) {
			photo = resultPhoto[0].image;
		}
		var desc = "";
		var id = result[i].ID;
		if ((result[i].description != null) && (result[i].description != '') && (result[i].description != undefined)) {
			desc = result[i].description;
		}
		var img = '<img style="width:80px; height:80px;" src="themes/images/null2.png"/>';
		if ((photo != null) && (photo != '') && (photo != undefined)) {
			img = '<img style="width:80px; height:80px;" src="'+photo+'"/>';
		}
		
		ris += '<li class="minHeight" id="'+id+'"><a href="#" onclick="select_link(' + id + ')">'+img+'<h3>' + result[i].title + '</h3><p>' + desc + '</p></a></li>';
		i++;
	}
	if (i == 0) {
		ris += '<h3>You do not have added any ranking yet</h3>';
	}else{
		ris += '</ul>';
	}
	$('#list').append(ris);
	$('.ran').listview().listview("refresh");
	return;
}


function insertItem() {
	var oid = $('#hiddenOid').val();
	var name = $('#title_competitor').val();
	var note = $('textarea#note').val();
	var vote = $('#vote').val();
	var photo = $('#imageView').attr("src");
	var rank_oid = window.localStorage.getItem("key");
	var position = 1;
	if (oid != ""){
		db.updateById('rank_items', {
			'name': name,
			'vote': vote,
			'note':note,
			'image':photo,
		}, oid);
		$('#hiddenOid').val("");
	}else{
		var result = db.find('rank_items', {
			'rank_oid': rank_oid
		});

		/*if (result != '') {
			result.sort(order);
			position = 1 + Number(result[result.length - 1].position);
		}*/
		var id = db.insert('rank_items', {
			'name': name,
			'note': note,
			//'position': position,
			'vote': vote,
			'image': photo,
			'rank_oid': rank_oid
		});
	}
	$.mobile.changePage("#items");

return;
}



function printItems() {
	var result = null;
	var ris = '';
	var i = 0;

	result = db.find('rank_items', {
		'rank_oid': window.localStorage.getItem("key")
	});

	result.sort(order);
	if (result.length < 10) {
		ris = '<a style="float:right" href="#add_competitor"  data-role="button" data-theme="d"  data-icon="plus">Add</a>';
	}

	while (i < result.length) {
		if (i == 0) {
			ris += '<div><ul style="clear:both" data-role="listview" data-inset="true" data-icon="false" id="sortable"><li id="divider" data-theme="f" data-role="list-divider" role="heading">Official Ranking</li>';
		}
		var note = '';
		var vote = '';
		var id = result[i].ID;
		var position = result[i].position;
		var photo = result[i].image;
		if ((result[i].note != null) && (result[i].note != '') && (result[i].note != undefined)) {
			note = result[i].note;
		}

		if ((result[i].vote != null) && (result[i].vote != '') && (result[i].vote != undefined)) {
			vote = '<p><h4 style="color:orange;">Vote: <b>' + result[i].vote + '</b></h4></p>';
		}
		if ((photo != null) && (photo != '') && (photo != undefined)) {
			photo = '<img style="width:80px; height:80px;" src="' + photo + '"/>';
		} else {
			photo = '<img style="width:80px; height:80px;" src="themes/images/null2.png"/>';
		}
		ris += '<li class="minHeight" id="' + id + '"><a href="#">' + photo + '<h3><img src="themes/images/icon-' + (i+1) + '.png"/>&nbsp;'+ result[i].name + '</h3><p>' + note + '</p>' + vote + '</li>';
		i++;
	}
	if (i == 0) {
		ris += '<h3>This ranking is empty</h3>';
	} else {
		ris += '</ul></div>';
	}

	$('#items_main').html(ris);
	//$('#sortable').listview().listview("refresh");
	$('#items_main').trigger('create');
	///$("#sortable").sortable({items: '> li:not(#divider)'});
	//$("#sortable").disableSelection();

	/*$("#sortable").bind("sortstop", function(event, ui) {
		event.preventDefault();
		updateItems();
	});*/
return;
}

function updateItems() {
	/*$("#sortable li").each(function(index) {
		if (index != 0) {
			var $current = $(this);
			db.updateById('rank_items', {
				'position': index
			}, $current.attr("id"));
		}

	});*/
	printItems();
}
function select_link(id) {
    window.localStorage.setItem("key", id);
    $.mobile.changePage("#items");
};

function order(a, b) {
    /*if (a.position < b.position) {
        return -1;
    }
    if (a.position > b.position) {
        return 1;
    }
    return 0;*/
	var tmpA = parseFloat (a.vote);
	var tmpB = parseFloat (b.vote);
	 if (tmpA < tmpB) {
        return 1;
    }
    if (tmpA > tmpB) {
        return -1;
    }
	if (tmpA == tmpB) {
        if (a.name > b.name) {
			return 1;
		}else{
			return -1;
		}
    }
}

function openPopUp(id) {
    var i = "#" + id;
    $(i).popup("open");
}

function getPhoto(fromGallery) {
    var source = Camera.PictureSourceType.CAMERA;
    if (fromGallery) {
        source = Camera.PictureSourceType.PHOTOLIBRARY;
    }
    navigator.camera.getPicture(
        photoSuccess,
        photoError, {
            quality: 30,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: source,
            correctOrientation: true,
			saveToPhotoAlbum: true,
			encodingType: Camera.EncodingType.JPEG
        });
}

function photoSuccess(newFilePath) {
    $("#imageView").show();  
    $("#imageView").attr("src", newFilePath);
}

function photoError(error) {
    alert("error photo " + error);
}

function chooseItem(id, page) {
	window.localStorage.setItem("manage", id);
	if (page == 'item'){
		openPopUp("manageItem");
	}else{
		openPopUp("manageList");
	}
}


 