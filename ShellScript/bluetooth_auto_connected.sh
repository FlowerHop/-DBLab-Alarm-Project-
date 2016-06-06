#! /bin/bash

# the configure file of the device list
# it must get list from server
deviceListFile=./device_list.txt

# read the device list
exec < $deviceListFile
read deviceListData

deviceList=$(echo $deviceListData | tr "," " ")

# display all the devices in the configure
echo "Device list: "
for device in $deviceList
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
rfcommStatusTempFile=./rfcommStatusTempFile.txt

getAvailableRfcommNumber() {
  rfcommStatus=$(sudo rfcomm)
  echo ${rfcommStatus}
  echo ${rfcommStatus} > ${rfcommStatusTempFile}
  
  exec < $rfcommStatusTempFile
  read rfcommStatusData

  rfcommStatusData=$(echo $rfcommStatusData | sed 's/rfcomm/\n/g' | sed 's/:.*//g')

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
  scannedDeviceFile=./ScannedDeviceListTempFile.txt

  for device in $deviceList
  do
    echo "Check $device"
    echo "Scanned Device List ${scannedDevice}"
    echo ${scannedDevice} > ${scannedDeviceFile}
    
    # update connection status
    rfcommStatus=$(sudo rfcomm)
    echo ${rfcommStatus} > ./rfcommStatusTempFile.txt
    deviceStatus=$(grep "${device}" ./rfcommStatusTempFile.txt)    

    if [ "${deviceStatus}" != "" ]; then
      echo ${deviceStatus} > ./rfcommDeviceTemp.txt
      closed=$(grep "closed" ./rfcommDeviceTempFile.txt)

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
      turnOn=$(grep "${device}" ./ScannedDeviceListTempFile.txt)

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


