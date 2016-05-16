import sys
import serial
import time
import requests
import json

rfcommNumber = str(sys.argv[1])
roomName = str(sys.argv[2])
bioWatchId = str(sys.argv[3])

headers = {'content-type': 'application/json'}
url = 'http://140.115.155.103:1338/api/patients_status'
payload = {'inPlace': roomName, 'bioWatchId': bioWatchId,'pulse': '78', 'dateAndTime': '100', 'rssi': '-10'}

try: 

  bluetoothSerial = serial.Serial("/dev/rfcomm" + rfcommNumber, baudrate=9600)

  print("start")
  tStart = time.time()
  newMsg = bluetoothSerial.readline()
  tEnd = time.time()

  while ((tEnd-tStart) < 5):
    newMsg = "From HC-05"
    tEnd = time.time()


  print(newMsg)

  r = requests.post(url, data=json.dumps(payload), headers=headers)

  print('response: ' + r.text)
  print("post end")
  #while(newMsg):
   # print(newMsg)
   # newMsg = bluetoothSerial.readline()
except serial.SerialException:
  print ("No connection to the device could be established.")
except :
  print ("Error.")
