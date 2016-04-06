#! /bin/bash
hc05=”30:15:01:09:02:78”
scannedStr=$(hcitool scan)
scannedDevice=${scannedStr:14:${#scannedStr}}
scannedDeviceFile=./ScannedDeviceListTempFile.txt

echo “Find this ${hc05}”
echo “Scanned Device List ${scannedDevice}”
echo ${scannedDevice} > ${scannedDeviceFile}

finalStr=$(grep “${hc05}” ./ScannedDeviceListTempFile.txt)

if [ “${finalStr}” != “” ]; then
  echo “Find ${hc05}”
  echo “Start to connect...”
  sudo rfcomm connect /dev/rfcomm0 ${hc05} 1
else
  echo “No Result!”
fi
