var db;
$(document).on("pageinit", this, function(e) {
	try{
		e.preventDefault();
		db = new localdb('Rankings');
		if (!db.tableExists('rank_list')){
			db.createTable('rank_list');
		}
		if (!db.tableExists('rank_items')){
			db.createTable('rank_items');
		}
	}catch(err){
		if(navigator.notification && navigator.notification.alert){
			navigator.notification.alert(
			'No no ma che fai leopiti!?',
			function(){},
			'Error'
		);
		}else{
			console.log("Error");
		}
	}	

 
 
/*var page_id = $.mobile.activePage.attr('id');
if (page_id == 'home'){
printList();
}
if (page_id == 'items'){
printItems();
}
if (page_id == 'new'){
$('form').find("input[type=text], textarea").val("");
window.localStorage.removeItem("key");
}
if (page_id == 'add_competitor'){
$('form').find("input[type=text], textarea").val("");
}*/	                
});

$(document).on("pageshow", this, function(e) {
	e.preventDefault();
	try{
		if($.mobile.activePage.attr('id') == 'home'){
			printList();
		}
		if ($.mobile.activePage.attr('id') == 'items'){
			printItems();
		}
		if ($.mobile.activePage.attr('id') == 'new'){
			$('form').find("input[type=text], textarea").val("");
			window.localStorage.removeItem("key");
		}
		if ($.mobile.activePage.attr('id') == 'add_competitor'){
			$('form').find("input[type=text], textarea").val("");
		}
	}catch(err){
		if(navigator.notification && navigator.notification.alert){
			navigator.notification.alert(
			'No no c eravamo quasi forse',
			function(){},
			'Error'
		);
		}else{
			console.log("Error");
		}
	}
	

});
/*
document.addEventListener("DOMContentLoaded", function() {
//event.preventDefault();
$('#save').click(addRank); 
$('#add').click(insertItem);
},false);*/
function addRank(){
	try{
		//event.preventDefault();
		var title = $('#title').val();
		var desc = $('textarea#desc').val();
		console.log("INSERT");
		var id = db.insert('rank_list', {'title': title, 'description': desc});
		window.localStorage.setItem("key", id);
		$.mobile.changePage("#items", { transition: "flip"} );
	}catch(err){
		if(navigator.notification && navigator.notification.alert){
			navigator.notification.alert(
			'No no...vai via vai via',
			function(){},
			'Error'
		);
		}else{
			console.log("Error");
		}
	}
}

function printList(){
	try{
		$("#list").empty();
		var result = db.find('rank_list');
		var ris = '<h2>Your Rankings</h2>'; 
		var i = 0;
		while (i < result.length){
			var desc = '';
			var id = result[i].ID;
			if ((result[i].description != null) && (result[i].description != '') && (result[i].description != undefined)){
				desc = result[i].description;
			}
			ris +='<ul class="ran" data-role="listview" data-inset="true" data-divider-theme="f"><li data-role="list-divider"><h1>'+result[i].title+'</h1></li><li><a class="list-rank" id="'+id+'" href="#" onclick="select_link('+id+')"><p>'+desc+'</p></a></li></ul>';					
		i++;
		}
		if (i == 0){
			ris +='<h3>You do not have added any ranking yet</p>';
		}
		$('#list').append(ris);		
		$('.ran').listview().listview("refresh");	
	}catch(err){
		if(navigator.notification && navigator.notification.alert){
			navigator.notification.alert(
			'No no...vai via vai via',
			function(){},
			'Error'
		);
		}else{
			console.log("Error");
		}
	}
}


function insertItem(){
	console.log("ITEM");
	try{
		var name = $('#title_competitor').val();
		var note = $('textarea#note').val();
		var vote = $('#vote').val();
		var rank_oid = window.localStorage.getItem("key");
		var position = 1;
		var result = db.find('rank_items', {'rank_oid': rank_oid});

		if (result != ''){

			result.sort(order);

			position= 1+ Number(result[result.length-1].position);
		}
		var id = db.insert('rank_items', {'name': name, 'note': note,'position': position, 'vote': vote, 'rank_oid': rank_oid});

		$.mobile.changePage("#items", { transition: "flip"} );

	}catch(err){
		if(navigator.notification && navigator.notification.alert){
			navigator.notification.alert(
			'No no...che pizza',
			function(){},
			'Error'
		);
		}else{
			console.log("Error");
		}
	}
}



function printItems(){
//event.preventDefault();
try{
var result = null;
var ris = '';
var i = 0;


result = db.find('rank_items',{'rank_oid': window.localStorage.getItem("key")});

result.sort(order);
if (result.length < 10){
ris = '<a style="float:right" href="index.html#add_competitor" rel="external"  data-role="button" data-theme="d"  data-icon="plus">Add</a>'; 
}

while (i < result.length){
if (i == 0){
ris +='<div style="width:80%;"><ul style="clear:both" data-role="listview" data-inset="true" data-theme="d" id="sortable"><li data-role="list-divider">Official Ranking</li>';
}
var note = '';
var vote = '';
var id = result[i].ID;
var position = result[i].position;
if ((result[i].note != null) && (result[i].note != '') && (result[i].note != undefined)){
note = result[i].note;
}

if ((result[i].vote != null) && (result[i].vote != '') && (result[i].vote != undefined)){
vote = '<p><h3>Vote: <b>'+result[i].vote+'</b></h3></p>';
}
ris +='<li id="'+id+'"><img src="themes/images/icon-'+position+'.png"/><h1>'+result[i].name+'</h1><p>'+note+'</p>'+vote+'</li>';
i++;
}
if (i == 0){
ris+='<h3>This ranking is empty</h3>';
}else{
ris +='</ul></div>';
}


$('#items_main').html(ris);		
$('#sortable').listview().listview("refresh");
$('#items_main').trigger('create');
$( "#sortable" ).sortable();
$( "#sortable" ).disableSelection();

$( "#sortable" ).bind( "sortstop", function(event, ui) {
$("#sortable li").each(function(index) {   
if (index != 0){
var  $current = $(this);
db.updateById('rank_items', {'position': index}, $current.attr("id"));
}		

});
printItems();

});
}catch(err){
		if(navigator.notification && navigator.notification.alert){
			navigator.notification.alert(
			'dai quasi quasi',
			function(){},
			'Error'
		);
		}else{
			console.log("Error");
		}
	}
}	

function select_link(id){
window.localStorage.setItem("key", id);
$.mobile.changePage("#items", { transition: "flip"} );
};

function order(a,b){

if (a.position < b.position){
return -1;
}
if (a.position > b.position){
return 1;
}
return 0;

}