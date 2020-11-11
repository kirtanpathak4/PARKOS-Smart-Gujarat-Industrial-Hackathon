
var slt
var time;
var vno;
var count;
count=0;
var str;
var free;
var earnings;
earnings=0;
str="<b>Occupied Slots:</b>";
	var rootRef=firebase.database().ref().child("smartParking/parkingSlots");
	rootRef.on("child_added", snap =>{
		for (var i = 1; i <= 10; i++) {
			var slot=snap.child("slot"+i).val();
			if (slot==false) {
				$('#slot'+i).append("<td><b>"+i+"</b></td><td><b>-</b></td><td><b>-</b></td><td><button type=\"button\" class=\"btn btn-danger\">INACTIVE</button></td>");
			}
		}	
	});
	var rootRef2=firebase.database().ref().child("smartParking/vehicles");
				rootRef2.on("child_added", snap =>{
					slt=snap.child("slot").val();
					time=snap.child("In time:").val();
					vno=snap.child("Reg No").val();
					$('#slot'+slt).append("<td><b>"+slt+"</b></td><td><b>"+vno+"</b></td><td><b>"+time.substring(11,19)+"</b></td><td><button type=\"button\" class=\"btn btn-success\">ACTIVE</button></td>");
					count++;
					earnings=earnings+40;
					free=9-count;
					document.getElementById('occupied_slots').innerHTML="";
	  				$('#occupied_slots').append("<b>"+free+"</b>")
	  				document.getElementById('earnings').innerHTML="";
	  				$('#earnings').append("<b>"+earnings+"</b>");
				});


	var ref=firebase.database().ref().child('smartParking/parkingSlots')	// Get the data on a post that has changed
	ref.on("child_changed", function(snapshot) {
	  var changedPost = snapshot.val();
	  var key=snapshot.key;//stores slot1
	  var key_val=snapshot.child(key).val() //stores true or false
	  if(key_val==true){
	  	document.getElementById(key).innerHTML="";
	  	$('#'+key).append("<td><b>"+key.substring(4,5)+"</b></td><td><b>"+vno+"</b></td><td><b>"+time.substring(11,19)+"</b></td><td><button type=\"button\" class=\"btn btn-success\">ACTIVE</button></td>");
	  	count=count+1;
	  	earnings=earnings+40;
	  	free=9-count;
	  	document.getElementById('occupied_slots').innerHTML="";
	  	$('#occupied_slots').append("<b>"+free+"</b>")
	    document.getElementById('earnings').innerHTML="";
	  	$('#earnings').append("<b>"+earnings+"</b>");
	  }
	  if(key_val==false){
	  	document.getElementById(key).innerHTML="";
	  	$('#'+key).append("<td><b>"+key.substring(4,5)+"</b></td><td><b>-</b></td><td><b>-</b></td><td><button type=\"button\" class=\"btn btn-danger\">INACTIVE</button></td>");
	  	count=count-1;
	  	free=9-count;
	  	document.getElementById('occupied_slots').innerHTML="";
	  	$('#occupied_slots').append("<b>"+free+"</b>")
	  }

	  console.log("Occupied Slots: " + count);
	});
