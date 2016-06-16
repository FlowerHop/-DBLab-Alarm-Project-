# -DBLab-Alarm-Project-
This project is for Medical Requirement that a device that can monitor the patient's bio info, if the patient is in danger, it could raise the alarm. So, I want to build a system to reach this requirement.

## User Scenario
There are many Gateways in the hospital. A Gateway covers an area. The number of Gateways will be considered how accurate you want. The patients wear our Sensor Watch, and it would get patients' bio info at the same time. These bio info would be transfered to the neareset Gateway by bluetooth communication. Gateway would receive bio info from many Sensor Watch, and Gateway push these bio info to Server. The doctors and the nurses can view all patienets's body state by Web via PC or Mobile. If the patient is in danger, it would raise alarm automatically. 

## System Components
                                 (Internet)
                       Server ----------------- App
                       | | |
                      |  |  |        (Internet)
                     |   |   |
             Gateway..Gateway..Gateway     (Master Role)
                    |    |    |
                   |     |     |      (Bluetooth)
                  |      |      |
                 SW..SW..SW..SW..SW   (Slave Role)

### Sensor Watch
According to the low cost requirement, I choose Arduino to implement it. Ideally, [Arduino Micro](https://www.arduino.cc/en/Main/ArduinoBoardMicro), bluetooth module [HC-11](https://world.taobao.com/item/35537355090.htm) (or [HC-10](https://www.taiwaniot.com.tw/shop/module-sensor/comm/hm-10-%E8%97%8D%E8%8A%BD-4-0-%E6%A8%A1%E7%B5%84-%E9%80%8F%E6%98%8E%E4%B8%B2%E5%8F%A3-%E8%97%8D%E7%89%994-0%E6%A8%A1%E5%A1%8A-%E8%97%8D%E7%89%99%E4%B8%B2%E5%8F%A3-%E5%B8%B6%E9%82%8F%E8%BC%AF%E9%9B%BB/)) and [pulse sensor](https://github.com/WorldFamousElectronics/PulseSensor_Amped_Arduino) composed of this device.

### Gateway 
To push the bio info which is got from the component, Sensor Watch, to the cloud, we need a Gateway to implement it. I use Raspberry Pi 2. Sensor Watch push the bio info to Gateway by the bluetooth communication, and Gateway collect these data and push them to the cloud, our Server.

### Server (140.115.155.103)
All data would be saved in this component.
I use node and express.
#### server.js 
handle routers (RESTful API)
  1. GET: '/', return the index.html (but now, it has't been implemented) 
  2. POST: '/api/patients_status/', to post the bio signal
  3. POST: '/api/scanedResult', update the current bio watches distance
  4. GET: 'api/bioWatchList', return json of the bio watch list
  5. GET: 'api/configures', return registered bio watch list


  For Test:
  1. GET: '/test/update_status/:inPlace/:bioWatchId/:pulse/:dateAndTime', to post the bio siganl by GET Method
  2. GET: '/test/scanedResult/:inPlace/:bioWatchId/:rssi/', to post the bio watches' distance by GET Method

##### BioSignalDatabase
save all the data
##### BioWatchManager
handle operations of BioSignalDatabase

### App
The doctor or the nurse can use App to view the patient's current body state. If the patient is in danger, it would raise alarm. The way of this alarm needs more discussion. Ideally, I hope it can be done via WebRTC for the bug in Bugzilla ([1234438](https://bugzilla.mozilla.org/show_bug.cgi?id=1234438)). It would be implemented on Web so that can be used on all platforms.

## Problems

### 1. The way of the alarm
### 2. Battery Life
### 3. The Frequency of fetching and sending the bio info. (Now, the interval is about 10s.)
### 4. Bluetooth automatically set up with the nearest components.
### 5. The accuracy of the pulse sensor
### 6. The rule that to determine if the patient is in danger
### 7. I have no idea how many Sensor Watch our Gateway can be connecting at the same time.


## Current State
Now, according to the requirement that the Sensor Watch and the Gateway must be connected automatically no matter where the Sensor Watch  is as long as it is within the range of the Gateways. To fix the pairing problem, I wrote the shell script (bluetoothe_auto_connected.sh) on Gateway. It can search and connect to the Sensor Watch that is near it, and I also wrote some code on Aruino to make Arduino can be initiated the bluetooth automatically. So, I make the AT command programmable. When they are connected, the python code (Gateway_to_receive_and_push.py) on the Gateway can start to receive data from the Sensor Watch. It works, but the initialization is too long (within about 3-min).

Next, I would optimize the first connecting performance and check current how long our battery life is. I use 9V battery. Then, I want to buy [Arduino Micro](https://www.arduino.cc/en/Main/ArduinoBoardMicro), bluetooth module [HC-11](https://world.taobao.com/item/35537355090.htm) (or [HC-10](https://www.taiwaniot.com.tw/shop/module-sensor/comm/hm-10-%E8%97%8D%E8%8A%BD-4-0-%E6%A8%A1%E7%B5%84-%E9%80%8F%E6%98%8E%E4%B8%B2%E5%8F%A3-%E8%97%8D%E7%89%994-0%E6%A8%A1%E5%A1%8A-%E8%97%8D%E7%89%99%E4%B8%B2%E5%8F%A3-%E5%B8%B6%E9%82%8F%E8%BC%AF%E9%9B%BB/)). Maybe I could use the way like iBeacon to avoid connection settings. No matter which way, HC-11 or HC-10 is BLE, it definitely help me fix the problem of battery life. 

So, there are 4 parts of the codes.
####1. Shell Script
####2. SensorWatch
####3. ReceiveAndPush
####4. Server
