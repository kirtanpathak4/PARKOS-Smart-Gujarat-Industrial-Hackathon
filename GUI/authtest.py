import pyrebase
import json
import test

config = {
    "apiKey": "AIzaSyA9kXw6nmuB4T4R9PweOCSbcqTC1-OWSNo",
    "authDomain": "testingmachine101.firebaseapp.com",
    "databaseURL": "https://testingmachine101.firebaseio.com",
    "projectId": "testingmachine101",
    "storageBucket": "testingmachine101.appspot.com",
}


firebase = pyrebase.initialize_app(config)
# Get a reference to the auth service
auth = firebase.auth()

# Log the user in
user = auth.sign_in_with_email_and_password(
    'shiyanirutvik+1@gmail.com', 'fire@1234')

# Get a reference to the database service
db = firebase.database()

# data to save
data = {
    "name": "Rutvik '1' Shiyani"
}

# Pass the user's idToken to the push method
data = {"name": "Mortimer Smith"}
userInfo = auth.get_account_info(user['idToken'])
userId = userInfo['users'][0]['localId']
print(userId)
db.child("users").child(userId).set(data, user['idToken'])
