var mail;
if(window.location.href==="file:///D:/GUI/public/examples/indexx.html"){
	mail=document.getElementById('email').value;
	console.log(mail);
}
if(window.location.href==="file:///D:/GUI/public/examples/admin.html"){
	document.getElementById('admin_name').innerHTML=mail;
}