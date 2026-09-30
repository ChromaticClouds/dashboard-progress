#include <string.h>
#include <DHT.h>

# define A_1A 5
# define A_1B 6
# define SOIL_HUMI A0 // 토양습도센서 핀 설정
# define WATER_LEV A1 // 수위감지센서 핀 설정
# define LIGHT_SENSOR A2
# define TRIG_PIN 7
# define ECHO_PIN 8

# define DHTPIN 4
# define DHTTYPE 11
DHT dht(DHTPIN, DHTTYPE);

int bluePin = 9;
int greenPin = 10;
int redPin = 11;
bool watering_init = false;

int soil, psoil;
int water_lev;

unsigned long watering_start = 0; 
unsigned long watering_end = 0;

// 전역변수를 먼저 선언하여 loop문에서 초기화가 되지 않도록 함
String control_status;
String led_type;
int intensity1;
int intensity2;
int intensity3;
int resistence;

int init_level;
int end_level;
int watering_amount = 0;

unsigned long pump_start = 0;
unsigned long duration = 0;
unsigned long pump_duration = 10000;
unsigned long waiting = 5000;

unsigned long serial_wait = 0;

void setup() {
  pinMode(bluePin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(redPin, OUTPUT);
  pinMode(A_1A, OUTPUT); // 모터드라이브 출력모드
  pinMode(A_1B, OUTPUT);
  pinMode(LIGHT_SENSOR, INPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  digitalWrite(A_1A, LOW); // 모터드라이브 초기값은 끈 상태
  digitalWrite(A_1B, LOW);

  dht.begin();

  Serial.begin(9600);

  // 초기값은 setup()문에서 전달바람
  intensity1 = 0;
  intensity2 = 0;
  intensity3 = 0;
  resistence = 0;
}

void loop() {
  double h = dht.readHumidity();
  double t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("failed to read from DHT sensor.");
    return;
  }

  soil = analogRead(SOIL_HUMI); // A0에서 읽은 값 저장
  psoil = map(soil, 1023, 0, 0, 100); // 0 ~ 100으로 soil값 매핑
  water_lev = analogRead(WATER_LEV);

  double distance = measureDistance();

  int lightValue = analogRead(LIGHT_SENSOR);
  int brightness = map(lightValue, 0, 1023, 0, 255);

  if (Serial.available() > 0) {
    // 유효한 문자열이나 값은 여기서 입력받길 바람
    String receivedString = "";

    while (Serial.available() > 0) {
      receivedString = Serial.readStringUntil('\n');
    }

    if (receivedString == "on") {
      control_status = "on";
    }
    else if (receivedString == "off") {
      control_status = "off";
    }

    if (receivedString.startsWith("led01_")) {
      String result = trimming(receivedString);

      if (try_parseInt(result)) {
        intensity1 = result.toInt();
      }
    }

    if (receivedString.startsWith("led02_")) {
      String result = trimming(receivedString);

      if (try_parseInt(result)) {
        intensity2 = result.toInt();
      }
    }

    if (receivedString.startsWith("led03_")) {
      String result = trimming(receivedString);

      if (try_parseInt(result)) {
        intensity3 = result.toInt();
      }
    }

    if (receivedString.startsWith("res_")) {
      String result = trimming(receivedString);

      if (try_parseInt(result)) {
        resistence = result.toInt();
      }
    }

    if (receivedString.startsWith("dur_")) {
      String result = trimming(receivedString);

      if (try_parseInt(result)) {
        duration = result.toInt();
      }
    }
  }

    // 전달받은 값은 이쪽에서 제어
  if (control_status == "on") {
    analogWrite(bluePin, intensity1);
    analogWrite(greenPin, intensity2);
    analogWrite(redPin, intensity3);
  }
  else if (control_status == "off") {
    analogWrite(bluePin, 1);
    analogWrite(greenPin, 1);
    analogWrite(redPin, 1);
  }

  if (watering_init && control_status == "on") {
    if (millis() - pump_start <= duration) {
      digitalWrite(A_1A, HIGH);
      analogWrite(A_1B, resistence);

      if (watering_start == 0) {
        watering_start = millis();
        init_level = water_lev;
      }

      watering_end = 0;
    }
    else if (millis() - pump_start <= duration + waiting) {
      digitalWrite(A_1A, LOW);
      digitalWrite(A_1B, LOW);

      if (watering_end == 0) {
        watering_end = millis();
        end_level = water_lev;
        watering_amount = init_level - end_level;
      }
    }
    else {
      pump_start = millis();
      watering_start = 0;
    }
  } 
  else if (control_status == "off" && psoil <= 40) {
    if (millis() - pump_start <= pump_duration) {
      digitalWrite(A_1A, HIGH);
      analogWrite(A_1B, resistence);

      if (watering_start == 0) {
        watering_start = millis();
        init_level = water_lev;
      }

      watering_end = 0;
    }
    else if (millis() - pump_start <= pump_duration + waiting) {
      digitalWrite(A_1A, LOW);
      digitalWrite(A_1B, LOW);

      if (watering_end == 0) {
        watering_end = millis();
        end_level = water_lev;
        watering_amount = init_level - end_level;
      }
    }
    else {
      pump_start = millis();
      watering_start = 0;
    }
  }
  else {
    digitalWrite(A_1A, LOW);
    digitalWrite(A_1B, LOW);

    if (watering_end == 0) {
      watering_end = millis();
      watering_amount = init_level - end_level;
      watering_start = 0;
    }
  }

  if (watering_amount < 0) {
    watering_amount = 0;
  }

  String data = "{ ";
  data += "\"temperature\": ";
  data += String(t, 2);
  data += ", ";

  data += "\"humidity\": ";
  data += String(h, 2);
  data += ", ";

  data += "\"water_level\": ";
  data += String(water_lev);
  data += ", ";

  data += "\"watering_amount\": ";
  data += String(watering_amount);
  data += ", ";

  data += "\"distance\": ";
  data += String(distance);
  data += ", ";

  data += "\"soil_humidity\": ";
  data += String(psoil);
  data += ", ";

  data += "\"led01\": ";
  data += String(intensity1);
  data += ", ";

  data += "\"led02\": ";
  data += String(intensity2);
  data += ", ";

  data += "\"led03\": ";
  data += String(intensity3);
  data += ", ";

  data += "\"pump_start\": ";
  data += String(pump_start / 1000);
  data += ", ";

  data += "\"millis()\": ";
  data += String(millis() / 1000);
  data += " }";

  if (millis() - serial_wait >= 2000) {
    Serial.println(data);
    watering_amount = 0;

    serial_wait = millis();
  }
}

double measureDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  unsigned long duration = pulseIn(ECHO_PIN, HIGH);
  double distance = ((duration * 0.0343) / 2); // 소리의 속도는 초당 343m, 왕복거리를 고려하여 나누기 2

  if (duration == 0) {
    return -1;
  }
  else {
    double height;

    if (25.8 - distance <= 0)
    {
      height = 0;
    }
    else {
      height = 25.8 - distance;
    }

    return height;
  }
}

bool try_parseInt (String str) {
  if (str == "0")
    return true;

  int num = atoi(str.c_str());
  return num != 0;
}

String trimming (String str) {
  String result;

  int index1 = str.indexOf('_');
  int index2 = str.length();
  String value = str.substring(index1 + 1, index2);

  if (index1 != -1) {
    result = value;
  }
  else {
    result = str;
  }

  return result;
}