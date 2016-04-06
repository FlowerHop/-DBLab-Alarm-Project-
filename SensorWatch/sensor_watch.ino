#include <SoftwareSerial.h>
#include <Wire.h>

SoftwareSerial BTSerial(11,10);

// ascii code in char {A, T, CR, LF}; 
byte AT[] = {0x41, 0x54, 0x0D, 0x0A};

// ascii code in char {A, T, +, I, N, I, T, CR, LF}
byte INIT[] = {0x41, 0x54, 0x2B, 0x49, 0x4E, 0x49, 0x54, 0x0D, 0x0A};

// ascii code in char {A, T, +, I, N, Q, CR, LF}
byte INQ[] = {0x41, 0x54, 0x2B, 0x49, 0x4E, 0x51, 0x0D, 0x0A};

// ascii code in char {A, T, +, S, T, A, T, E, CR, LF}
byte STATE[] = {0x41, 0x54, 0x2B, 0x53, 0x54, 0x41, 0x54, 0x45, 0x0D, 0x0A};

// note: char CR and LF is the end of the cmd, they must be added


int flag = 0;

void setup() {
  pinMode(9, OUTPUT);  // this pin will pull the HC-05 pin 34 (key pin) HIGH to switch module to AT mode
  digitalWrite(9, HIGH);
  Serial.begin(9600);
  Serial.println("Enter AT commands:");
  BTSerial.begin(38400);  // HC-05 default speed in AT command more
  
  BTSerial.write(INIT[0]);
  BTSerial.write(INIT[1]);
  BTSerial.write(INIT[2]);
  BTSerial.write(INIT[3]);
  BTSerial.write(INIT[4]);
  BTSerial.write(INIT[5]);
  BTSerial.write(INIT[6]);
  BTSerial.write(INIT[7]);
  BTSerial.write(INIT[8]);
  
  delay (200);
  
  BTSerial.write(INQ[0]);
  BTSerial.write(INQ[1]);
  BTSerial.write(INQ[2]);
  BTSerial.write(INQ[3]);
  BTSerial.write(INQ[4]);
  BTSerial.write(INQ[5]);
  BTSerial.write(INQ[6]);
  BTSerial.write(INQ[7]);
}

void loop()
{  
//  if (flag == 0) {
//    delay(1000);
//    BTSerial.write(INIT[0]);
//    BTSerial.write(INIT[1]);
//    BTSerial.write(INIT[2]);
//    BTSerial.write(INIT[3]);
//    BTSerial.write(INIT[4]);
//    BTSerial.write(INIT[5]);
//    BTSerial.write(INIT[6]);
//    BTSerial.write(INIT[7]);
//    BTSerial.write(INIT[8]);
//    flag++;
//  } else if (flag == 1) {
//    delay(1000);
//    BTSerial.write(INQ[0]);
//    BTSerial.write(INQ[1]);
//    BTSerial.write(INQ[2]);
//    BTSerial.write(INQ[3]);
//    BTSerial.write(INQ[4]);
//    BTSerial.write(INQ[5]);
//    BTSerial.write(INQ[6]);
//    BTSerial.write(INQ[7]);
//    flag++;
//  }

  // Keep reading from HC-05 and send to Arduino Serial Monitor
  if (BTSerial.available()) {
    
    Serial.write(BTSerial.read());
    BTSerial.write ("From HC-05\n"); 
    delay (1000);
  }
  
  
  // Keep reading from Arduino Serial Monitor and send to HC-05
  // if (Serial.available()) {
  //  char temp = Serial.read();
  //  if (temp == 'A') {
  //    BTSerial.write(AT[0]);
  //    BTSerial.write(AT[1]);
  //    BTSerial.write(AT[2]);
  //    BTSerial.write(AT[3]);
  //  } else if (temp == 'B') {
  //    BTSerial.write(INIT[0]);
  //    BTSerial.write(INIT[1]);
  //    BTSerial.write(INIT[2]);
  //    BTSerial.write(INIT[3]);
  //    BTSerial.write(INIT[4]);
  //    BTSerial.write(INIT[5]);
  //    BTSerial.write(INIT[6]);
  //    BTSerial.write(INIT[7]);
  //    BTSerial.write(INIT[8]);
  //  } else if (temp == 'C') {
  //    BTSerial.write(INQ[0]);
  //    BTSerial.write(INQ[1]);
  //    BTSerial.write(INQ[2]);
  //    BTSerial.write(INQ[3]);
  //    BTSerial.write(INQ[4]);
  //    BTSerial.write(INQ[5]);
  //    BTSerial.write(INQ[6]);
  //    BTSerial.write(INQ[7]);
  //  } else if (temp == 'D') {
  //    BTSerial.write (STATE[0]);
  //    BTSerial.write (STATE[1]);
  //    BTSerial.write (STATE[2]);
  //    BTSerial.write (STATE[3]);
  //    BTSerial.write (STATE[4]);
  //    BTSerial.write (STATE[5]);
  //    BTSerial.write (STATE[6]);
  //    BTSerial.write (STATE[7]);
  //    BTSerial.write (STATE[8]);
  //    BTSerial.write (STATE[9]);
  //  } else {
  //    BTSerial.write(AT[0]);
  //    BTSerial.write(AT[1]);
  //    BTSerial.write(AT[2]);
  //    BTSerial.write(AT[3]);
  //  }
  //} 
}

