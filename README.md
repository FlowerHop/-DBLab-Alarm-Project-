# -DBLab-Alarm-Project-
This project is for Medical Requirement that a device that can monitor the patient's bio info, if the patient is in danger, it could raise alarm. So, I want to make a system to reach this requirement.

## User Scenario
There are many Hops in the hospital. A Hop cover an area. The number of Hops will be considered how accurate you want. The patients wear our Sensor Watch, and it would get patients' bio info at the same time. These bio info would be transfered to the neareset Hop by bluetooth communication. Hop would receive bio info from many Sensor Watch, and Hop push these bio info to Server. The doctors and the nurses can view all patienets's body state by Web via PC or Mobile. If the patient is in danger, it would raise alarm automatically. 

## System Components
                                 (Internet)
                       Server ----------------- App
                       | | |
                      |  |  |        (Internet)
                     |   |   |
                   Hop..Hop..Hop     (Master Role)
                    |    |    |
                   |     |     |      (Bluetooth)
                  |      |      |
                 SW..SW..SW..SW..SW   (Slave Role)

### Sensor Watch
According to the low cost requirement, I choose Arduino to implement it. Ideally, Arduino mini, bluetooth module HC-05 and pulse sensor composed of this device.

### Hop 
To push the bio info which is got from the component, Sensor Watch, to the cloud, we need a hop to implement it. I use Raspberry Pi. Sensor Watch push the bio info to Hop by the bluetooth communication, and Hop collect these data and push them to the cloud, our Server.

### Server
All data would be saved in this component.

### App
The doctor or the nurse can use App to view the patient's current body state. If the patient is in danger, it would raise alarm. The way of this alarm needs more discussion. Ideally, I hope it can be done via WebRTC for the bug in Bugzilla (https://bugzilla.mozilla.org/show_bug.cgi?id=1234442). It would be implemented on Web so that can be used on all platforms.

## Problems

### 1. The way of the alarm
### 2. I'm not sure Sensor Watch's hardware can be done successfully.
### 3. Battery Life
### 4. The Frequency of fetching and sending the bio info.
### 5. Bluetooth automatically set up with the nearest components.
### 6. The accuracy of the pulse sensor
### 7. The rule that to determine if the patient is in danger

