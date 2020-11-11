import RPi.GPIO as GPIO
import picamera
import time
import boto3
import json
import pyrebase
from botocore.client import Config
import multiprocessing

#*********************__FirebaseAuth__*********************************
config = {
    'apiKey': "AIzaSyDMqtC1eiN2AUU0_tWv55T9DGERnslRjIo",
    'authDomain': "gujaratindustrialhackathon.firebaseapp.com",
    'databaseURL': "https://gujaratindustrialhackathon.firebaseio.com",
    'projectId': "gujaratindustrialhackathon",
    'storageBucket': "gujaratindustrialhackathon.appspot.com",
    'messagingSenderId': "329966389650"
}


firebase = pyrebase.initialize_app(config)
# Get a reference to the auth service
auth = firebase.auth()

# Log the user in
user = auth.sign_in_with_email_and_password('shiyanirutvik@gmail.com', '12345678')

# Get a reference to the database service
db = firebase.database()
userInfo = auth.get_account_info(user['idToken'])
userId = userInfo['users'][0]['localId']
userdb = db.child("users").child(userId)
#*****************************************************************************
global slotNumber
totalSlots=10
#db = firebase.FirebaseApplication('https://sgpSem3.firebaseio.com', None)
#slot = [False,False,False,False,False,False,False,False,False,False]
#*********__AWS CONFIG__**************
ACCESS_KEY_ID='AKIAJKF5EK3YI2ZXQR7Q'
ACCESS_SECRET_KEY='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'
BUCKET_NAME='akshay5560'
REGION='us-east-1'

#********__R.PI PIN SETUP__***************
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
PIR_PIN=12
US_ECHO=7
US_TRIG=11
SERVO=13
#*******__I/O SETUP__**************
GPIO.setup(PIR_PIN,GPIO.IN)
GPIO.setup(US_ECHO,GPIO.IN)
GPIO.setup(US_TRIG,GPIO.OUT)
GPIO.setup(SERVO,GPIO.OUT)

camera = picamera.PiCamera()
pwm=GPIO.PWM(SERVO,50)
pwm.start(2.25+8)

#CHECKS SLOT STATUS LOCALLY
def checkEmptySlot():
    slotData=userdb.child('parkingSlots').get(user['idToken'].val())
    for i in range(1, totalSlots+1):
        slot[i]=slotData['slot'+str(i)]['slot'+str(i)]
    for i in range(1,totalSlots+1):
        if slot[i]==False:
            return True
    print('we are full!')
    return False;


def allotSlot():
    for i in range(1,totalSlots+1):
        if slot[i]==False:
            return i
    return -1;
    
        
#opens the gate
def openGate():
    pwm.ChangeDutyCycle(2.25+4)

#closes the gate
def closeGate():
    pwm.ChangeDutyCycle(2.25+8)

#measures distance between gate and car
def measureDistance():
    GPIO.output(US_TRIG,True)
    time.sleep(0.00001)
    GPIO.output(US_TRIG,False)
    while GPIO.input(US_ECHO) == False:
            pulse_start=time.time()

    while GPIO.input(US_ECHO) == True:
            pulse_end=time.time()

    duration=pulse_end -pulse_start

    return round(duration/.000058,3)


def detectMotion():
    try:
        while True:
            if GPIO.input(PIR_PIN):
                return true;
            time.sleep(1)

    except KeyboardInterrupt:
        print("Quit")
        





try:
    while True:
            if GPIO.input(PIR_PIN):
                print("motion detected.....")
                #st=time.time()
                if checkEmptySlot():
                    
                    distance=measureDistance()
                    while distance > 10:
                        time.sleep(0.5)
                        distance=measureDistance()
                        print(distance)
                    print(distance)
                    time.sleep(2)
                    camera.capture('./NumImage3.JPG')
                    print("Image Successfully Captured!!\nSending the image to the API for OCR!!")
                    #********************__Image Recognition__*******************************************
                    
                    data = open('./NumImage2.JPG','rb')

                    s3= boto3.resource(
                        's3',
                        aws_access_key_id=ACCESS_KEY_ID,
                        aws_secret_access_key=ACCESS_SECRET_KEY,
                        region_name=REGION,
                        config=Config(signature_version='s3v4'))

                    s3.Bucket(BUCKET_NAME).put_object(Key='./NumImage2.JPG', Body=data)
                    print("The file Successfully uploaded to the Bucket...... \nWaiting for the API to extract text from the image!!")
                    photo='./NumImage2.JPG'
                    client=boto3.client('rekognition',
                                        aws_access_key_id=ACCESS_KEY_ID,
                                        aws_secret_access_key=ACCESS_SECRET_KEY,
                                        region_name=REGION,
                                        config=Config(signature_version='s3v4'))
                    response=client.detect_text(Image={'S3Object':{'Bucket':BUCKET_NAME,'Name':photo}})
                    textDetections=response['TextDetections']
                    number='string'

                    for text in textDetections:
                        number=text['DetectedText']
                        print(number)
                        
                        if number[:2].isupper() and number[2:4].isnumeric() and number[4:6].isupper() and number[6:].isnumeric():
                            print('valid number')
                            slotNumber=allotSlot();
                            print("Your Parking Slot is:"+str(slotNumber+1))
                            openGate()
                            starttime=time.time()
                            #slotNumber=allotSlot();
                            #result=db.put('/smartParking/parkingSlots','slot'+str(slotNumber),{'slot'+str(slotNumber):True})
                            userdb.child('parkingSlots').child('slot'+str(slotNumber)).set({'slot'+str(slotNumber):True}, user['idToken'])
                            
                            INtime=time.strftime("%H:%M:%S")
                            INdate=time.strftime("%d-%m-%Y")
                            data = {"Vehicle Registration Number": number,
                                "slot": slotNumber}
                            userdb.child('entryDetail/'+INdate+'/'+INtime).set(data, user['idToken'])
                            #db.put('/smartParking/entryDetail/'+INdate,INtime,data)
                            data = {"slot": slotNumber,
                                    "In time": INdate+";"+INtime
                                    "Reg No": number}
                            userdb.child('vehicles').child(number).set(data, user['idToken'])
                            #db.put('/smartParking/vehicles/',number,{"slot":slotNumber,"In time:": INdate+";"+INtime})
                            #exportStatus=db.get('smartParking/entryDetail/'+INdate+'/'+INtime,'Export')
                            #print("Data export to firebase:"+str(exportStatus))
                            endtime=time.time()
                            uploadTime= endtime - starttime
                            
                            if uploadTime<12.0
                                time.sleep(12-(endtime-starttime))
                            
                            closeGate()
                            break
                    
                else:print("no Slots empty")    
            time.sleep(1)

except KeyboardInterrupt:
    print("Quit");
    

GPIO.cleanup()
