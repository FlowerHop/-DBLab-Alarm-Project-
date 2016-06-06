import sys
import serial
import time
import requests
import json

rfcommNumber = str(sys.argv[1])
roomName = str(sys.argv[2])
bioWatchId = str(sys.argv[3])

def parseSignal(rawSignal):
  pattern="From Bio Watch: "
  number="0123456789"

  pos=rawSignal.find(pattern)
  startPos=pos+len(pattern)

  endPos=0
  for c in range(startPos, len(rawSignal), 1): 
    if rawSignal[c] not in number:
      endPos=c
      break

  if (startPos == endPos): 
    return -1

  return int(rawSignal[startPos:endPos])

try: 
  bluetoothSerial = serial.Serial("/dev/rfcomm" + rfcommNumber, baudrate=9600)

  print("start")
  tStart = time.time()
  newMsg = bluetoothSerial.readline()
  tEnd = tStart

  while((tEnd-tStart) < 10):
    newMsg = bluetoothSerial.readline()
    pulse = parseSignal(newMsg)
    tEnd = time.time()

  headers = {'content-type': 'application/json'}
  url = 'http://140.115.155.103:1338/api/patients_status'
  payload = {'inPlace': roomName, 'bioWatchId': bioWatchId,'pulse': pulse, 'rssi': '-10'}

  print(pulse)

  r = requests.post(url, data=json.dumps (payload), headers=headers)
except serial.SerialException:
  print("No connection to the device could be established.")
except OSError:
  print("OSError")
except :
  print("Error.")
finally :
  bluetoothSerial.close()
