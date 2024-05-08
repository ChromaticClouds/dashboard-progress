/* * This file receives a Serial value of "1" or "0" and changes the light based on * that value.  */  
// Define the port for the LED
int lightPin = 10;

unsigned long start_time = 0;
unsigned long end_time = 2000;
unsigned long blink_time;

String receivedString = "";

void setup() {     
  // Initialize the light pin
  pinMode(lightPin, OUTPUT);
  // Initialize the Serial  
  Serial.begin(9600);  
}

void loop() {
  blink_time = millis();

  while (Serial.available() > 0) {
      char c = Serial.read();
      if (c == '\n') {
      int intensity = receivedString.toInt();
      receivedString = ""; // Clear the string for the next value

      // Check if the conversion was successful
      if (intensity >= 0 && intensity <= 255) {
        // If yes, change the LED brightness
        analogWrite(lightPin, intensity);
      } else {
        blink_delay();
      }
    } 
    else {
      receivedString += c;
    }
  }
}

void blink_delay () {
  if (blink_time - start_time >= end_time * 2) {
    start_time = blink_time;
  }

  if ((blink_time - start_time) % end_time < end_time / 2){
    digitalWrite(lightPin, HIGH);
  } else {
    digitalWrite(lightPin, LOW);
  }
}
