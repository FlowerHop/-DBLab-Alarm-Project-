#! /bin/bash

# the configure file of the device list
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

# Maybe it will need another configure file to set the interval of others frequency to overcome the low battery life.
# Now, intervall of scanning is 30s.
## loop for scan and connect 
while true 
do
  scannedStr=$(hcitool scan)
  scannedDevice=${scannedStr:14:${#scannedStr}}
  scannedDeviceFile=./ScannedDeviceListTempFile.txt

  for device in $deviceList
  do
    echo “Find this ${device}”
    echo “Scanned Device List ${scannedDevice}”
    echo ${scannedDevice} > ${scannedDeviceFile}

    finalStr=$(grep “${device}” ./ScannedDeviceListTempFile.txt)

    if [ “${finalStr}” != “” ]; then
      echo “Find ${device}”
      echo “Start to connect...”
      sudo rfcomm connect /dev/rfcomm0 ${device} 1
    else
      echo “No Result!”
    fi
  done

  sleep 30s
done


