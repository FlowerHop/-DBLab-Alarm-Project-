#! /bin/bash

# the configure file of the device list
# it must get list from server
configures=$(curl http://140.115.155.103:1338/api/configures)
# configures=$(curl http://localhost:1338/api/configures)

registeredDeviceList=$(echo $configures | tr "," " ")

# display all the devices in the configure
echo "Registered device list: "
for device in $registeredDeviceList
do
  echo "  $device"
done

# get the room name
exec < ./RoomInfo.txt
read roomName

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

while true 
do
  # it must update the registered devices from server
  scannedStr=$(hcitool scan)
  scannedDevice=${scannedStr:14:${#scannedStr}}

  for device in $registeredDeviceList
  do
    echo "Check $device"
    echo "Scanned Device List ${scannedDevice}"
    
    # update connection status
    rfcommStatus=$(sudo rfcomm)
    deviceStatus=$(echo $rfcommStatus | grep "${device}")    

    if [ "${deviceStatus}" != "" ]; then
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
      sudo python ./../ReceiveAndPush/hop_to_receive_and_push.py ${rfcommNumber} ${roomName} ${device} &
      sleep 10s
      # it possibly needs to update rssi info
    else
      turnOn=$(echo $scannedDevice | grep "${device}")

      if [ "${turnOn}" != ""  ]; then
        getAvailableRfcommNumber
        echo "Start connecting $device on rfcomm$rfcommNumber"
        sudo rfcomm connect /dev/rfcomm${rfcommNumber} ${device} 1 &
        sleep 3s
         
        sudo python ./../ReceiveAndPush/hop_to_receive_and_push.py ${rfcommNumber} ${roomName} ${device} &
        sleep 10s
      else
        echo "No result!"  
      fi
    fi
  done
done


