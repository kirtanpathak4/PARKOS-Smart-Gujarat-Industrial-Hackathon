
	var rootRef=firebase.database().ref().child("Users");
	rootRef.on("child_added", snap =>{
	var name=snap.child("Name").val();
	var sid=snap.child("ID").val();
	$("#table_body").append("<div class=\"col-lg-4\"<div class=\"panel panel-green\"><div class=\"panel-heading\">Slot 1</div><div class=\"panel-body\"><p>"+ name +"</p></div><div class=\"panel-footer\">Panel Footer</div></div>");
});