
	var rootRef=firebase.database().ref().child("Users");
	rootRef.on("child_added", snap =>{
	var name=snap.child("Name").val();
	var sid=snap.child("ID").val();
	$("#table_body").append("<tr><td>"+ name +"</td><td>"+ sid +"</td></tr>");
});