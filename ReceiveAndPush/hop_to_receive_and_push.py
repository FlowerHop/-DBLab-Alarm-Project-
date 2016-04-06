import serial
from time import sleep
bluetoothSerial = serial.Serial (“/dev/rfcomm0”, baudrate=9600)

print (“start”)
newMsg = bluetoothSerial.readLine ()
while (newMsg):
  print (newMsg)
  newMsg = blietoothSerial.readLine ()
