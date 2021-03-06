#include <SoftwareSerial.h>
#include <Wire.h>

static SoftwareSerial BTSerial (11,10);
// ascii code in char {A, T, CR, LF};
byte AT[] = {0x41, 0x54, 0x0D, 0x0A};

// ascii code in char {A, T, +, I, N, I, T, CR, LF}
byte INIT[] = {0x41, 0x54, 0x2B, 0x49, 0x4E, 0x49, 0x54, 0x0D, 0x0A};

// ascii code in char {A, T, +, I, N, Q, CR, LF}
byte INQ[] = {0x41, 0x54, 0x2B, 0x49, 0x4E, 0x51, 0x0D, 0x0A};

// ascii code in char {A, T, +, S, T, A, T, E, CR, LF}
byte STATE[] = {0x41, 0x54, 0x2B, 0x53, 0x54, 0x41, 0x54, 0x45, 0x0D, 0x0A};

// note: char CR and LF is the end of the cmd, they must be added// ascii code in char {A, T, CR, LF};

//  Variables
int pulsePin = 0;                 // Pulse Sensor purple wire connected to analog pin 0

// Volatile Variables, used in the interrupt service routine!
volatile int BPM;                   // int that holds raw Analog in 0. updated every 2mS
volatile int Signal;                // holds the incoming raw data
volatile int IBI = 600;             // int that holds the time interval between beats! Must be seeded!
volatile boolean Pulse = false;     // "True" when User's live heartbeat is detected. "False" when not a "live beat".
volatile boolean QS = false;        // becomes true when Arduoino finds a beat.

int x0 = 1, x1 = 0, x2 = 0, x3 = 0;

void setup () {
}

//  Where the Magic Happens
void loop () {
    grafcet();
    delay (20);                             //  take a break
}

void grafcet() {
    if (x0 == 1) {
        x0 = 0;
        x1 = 1;
    } else if (x1 == 1) { // A Heartbeat Was Found
        x1 = 0;
        x2 = 1;
    } else if (x2 == 1) {
        x2 = 0;
        x3 = 1;
    } else if (x3 == 1) {
        x3 = 0;
        x2 = 1;
    }
    action();
}

void action() {
    if (x0 == 1) {
    } else if(x1 == 1) {  
        Serial.begin (115200);             // we agree to talk fast!
        while (!Serial);                   // this is necessary for Leonardo to find the serialport.
        delay (100);
        initBTSerial ();
        interruptSetup ();                 // sets up to read Pulse Sensor signal every 2mS
    } else if (x2 == 1) {
        if (QS == true) {
            QS = false;
        } else {
            BPM = -1;
        }
    } else if (x3 == 1) {
        // BPM and IBI have been Determined
        // Quantified Self "QS" true when arduino finds a heartbeat
        sendDataToSerial (BPM); // A Beat Happened, Output that to serial.
    }
}

void initBTSerial () {
    pinMode (9, OUTPUT);  // this pin will pull the HC-05 pin 34 (key pin) HIGH to switch module to AT mode
    digitalWrite (9, HIGH);
    BTSerial.begin (38400);  // HC-05 default speed in AT command more
    
    delay (200);
    for (int i = 0; i < sizeof (INIT); i++) {
        BTSerial.write (INIT[i]);
    }
    delay (200);
    for (int i = 0; i < sizeof (INQ); i++) {
        BTSerial.write (INQ[i]);
    }
}

void sendDataToSerial (int data){
  if (data != -1) {
    char pulse[4];

    sprintf (pulse, "%03i", data);

    char result_prefix[17] = "From Bio Watch: ";
    char result_postfix[2] = "\n";
    char result[25];

    for (int i = 0; i < sizeof (result_prefix) - 1; i++) {
        result[i] = result_prefix[i];
    }

    for (int i = 0; i < sizeof (pulse) - 1; i++) {
        result[i + 16] = pulse[i];
    }

    result[19] = result_postfix[0];
    result[20] = result_postfix[1];
    Serial.println ("T");
    Serial.print (result);
    BTSerial.write (result);
  }
}



