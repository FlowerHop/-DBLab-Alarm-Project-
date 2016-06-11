#! /bin/bash
x0=1
x1=0
x2=0
x3=0
x30=1
x31=0
x32=0
x33=0
x34=0
x35=0

connected=0
isAvailableDevices=0
isTurnOn=0

# Maybe it will need another configure file to set the interval of others frequency to overcome the low battery life.
# Now, intervall of scanning is 30s.
## loop for scan and connect 
rfcommNumber=0

getAvailableRfcommNumber() {
  rfcommStatus=$(sudo rfcomm)
  echo ${rfcommStatus}

  rfcommStatusData=$(echo $rfcommStatus | sed 's/rfcomm/\n/g' | sed 's/:.*//g')

  counter=0
  for row in $rfcommStatusData
  do
    counter=$((counter+1))
    
    if [ ${row} != ${counter} ]; then
      rfcommNumber=$counter
      return
    fi
  done

  rfcommNumber=$((counter+1))
}


sendReceivedSignalWithPOSTMethod(){
  echo "send GET method \n"
  # the configure file of the device list
  # it must get list from server
  # configures=$(curl http://140.115.155.103:1338/api/configures)
  configures=$(curl http://localhost:1338/api/configures)
  # echo ${configures} > ./device_list.txt

  # # read the device list
  # exec < $deviceListFile
  # read deviceListData

  registeredDeviceList=$(echo $configures | tr "," " ")
  # display all the devices in the configure
  echo "Registered device list: "
  for device in $registeredDeviceList
  do
    echo "  $device"
  done

  # registeredDeviceList=(${deviceList// / })
  # registeredDeviceListLength=${#deviceList[@]}

  # get the room name
  exec < ./RoomInfo.txt
  read roomName
}

scanAvailableDevices(){
  scannedStr=$(hcitool scan)
  scannedDevice=${scannedStr:14:${#scannedStr}}

  if [ "${scannedDevice}" != " " ]; then
    isAvailableDevices=1
  else
    isAvailableDevices=0
  fi
}


init(){
  deviceIndex=0
}

updateConnectionStatus(){
  rfcommStatus=$(sudo rfcomm)
}

selectDevice(){
  device=${registeredDeviceList[$deviceIndex]}
  deviceStatus=$(echo $rfcommStatus | grep "${device}")

  if [ "${deviceStatus}" != "" ]; then
    connected=1
    closed=$(echo $deviceStatus | grep "closed")

    rfcommNumber=$(echo $deviceStatus | sed 's/rfcomm/\n/g' | sed 's/:.*//g')

    # remove the prefix "\n"
    for row in $rfcommNumber
    do
      rfcommNumber=$row
    done
      
    if [ "${closed}" != "" ]; then
      echo "channel closed"
      #sudo rfcomm connect /dev/rfcomm${rfcommNumber} ${device} 1 &
      #sleep 3s
    fi

    echo "$device in rfcomm$rfcommNumber connection"
  else
    connected=0
    turnOn=$(echo $scannedDevice | grep "${device}")
    if [ "${turnOn}" != ""  ]; then
      isTurnOn=1
    else
      isTurnOn=0
    fi 
  fi
}

sendConnectionRequest(){
  getAvailableRfcommNumber
  echo "Start connecting $device on rfcomm$rfcommNumber"
  sudo rfcomm connect /dev/rfcomm${rfcommNumber} ${device} 1 &
  sleep 3s
}

sendPOSTMethod(){
  sudo python ./../ReceiveAndPush/hop_to_receive_and_push.py ${rfcommNumber} ${roomName} ${device} &
  sleep 10s
}

nextLoop(){
  let deviceIndex+=1
}

action() {
  if [ ${x1} == 1 ]; then
    sendGETMethod
  elif [ ${x2} == 1 ]; then
    scanAvailableDevices
  elif [ ${x3} == 1 ]; then
    subGrafcet
  fi
}

subAction() {
  if [ ${x30} == 1 ]; then
    init
  elif [ ${x31} == 1 ]; then
    updateConnectionStatus
  elif [ ${x32} == 1 ]; then
    selectDevice
  elif [ ${x33} == 1 ]; then
    sendConnectionRequest
  elif [ ${x34} == 1 ]; then
    sendReceivedSignalWithPOSTMethod
  elif [ ${x35} == 1 ]; then
    nextLoop
  fi
}

subGrafcet() {
  if [ ${x30} == 1 ] && [ $deviceIndex < ${deviceListLength} ]; then
    x30=0
    x31=1
  elif [ ${x30} == 1 ] && [ $deviceIndex >= ${deviceListLength} ]; then  
    x3=0
    x2=1
  elif [ ${x31} == 1 ]; then
    x31=0
    x32=1
  elif [ ${x32} == 1 ] && [ ${connected} == 0 ] && [ ${isTurnOn} == 0 ]; then
    x32=0
    x35=1
  elif [ ${x32} == 1 ] && [ ${connected} == 0 ] && [ ${isTurnOn} == 1 ]; then
    x32=0
    x33=1
  elif [ ${x32} == 1 ] && [ ${connected} == 1 ]; then
    x32=0
    x35=1
  elif [ ${x33} == 1 ]; then
    x33=0
    x34=1
  elif [ ${x34} == 1 ]; then
    x34=0
    x35=1
  elif [ ${x35} == 1 ] && [ $deviceIndex < ${deviceListLength} ]; then
    x35=0
    x31=1
  elif [ ${x35} == 1 ] && [ $deviceIndex >= ${deviceListLength} ]; then
    x35=0
    x30=1
    x3=0
    x2=1
  fi

  subAction
}

grafcet() {
  if [ ${x0} == 1 ]; then
    x0=0
    x1=1
  elif [ ${x1} == 1 ]; then
    x1=0
    x2=1
  elif [ ${x2} == 1 ] && [ ${isAvailableDevices} == 1 ]; then
    x2=0
    x3=1
  elif [ ${x3} == 1 ]; then
    x3=1
  fi

  action
}

while true
do
  grafcet
done 
