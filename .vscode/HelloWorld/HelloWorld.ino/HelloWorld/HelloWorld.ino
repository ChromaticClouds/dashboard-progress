#include <Wire.h>
#include <Adafruit_NeoPixel.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <DS1302.h>

#define NUM_LEDS 12
#define LED_PIN 3
#define DHTPIN 2 // DHT 핀 설정
#define DHTTYPE DHT22
#define TRIG_PIN 9 // TRIG 핀 설정
#define ECHO_PIN 8 // ECHO 핀 설정
#define FAN1 46
#define FAN2 48
#define FAN3 50
#define SOIL_HUMI A0 // 토양습도센서 핀 설정
#define WATER_LEV A1 // 수위감지센서 핀 설정
#define A_1A 5 // 모터드라이버 A_1A 단자 연결 핀번호(워터펌프)
#define A_1B 6 // 모터드라이버 A_1B 단자 연결 핀번호

unsigned long pumpStartTime = 0; // 워터펌프 동작 시작 시간
unsigned long pumpRunTime = 10000; // 워터펌프 동작 시간 10초 (ms)
unsigned long pumpStopTime = 5000; // 워터펌프 멈춤 시간 5초 (ms)

Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);
LiquidCrystal_I2C lcd(0x27, 16, 2); // LCD I2C 통신 설정(주소, 글자수, 줄수)
DHT dht(DHTPIN, DHTTYPE); // 온습도센서 사용 설정

int soil, psoil;
int water_lev;

const int CLK = 10;    // Clock을 5번핀 설정
const int DAT = 11;    // Data를 6번핀 설정
const int RST = 12;    // Reset을 7번핀 설정

DS1302 myrtc(RST, DAT, CLK);

void setup() {
  myrtc.halt(false); // 동작 모드로 설정
  myrtc.writeProtect(true); // 시간 변경을 가능하게 설정

  Serial.begin(9600);

  pixels.begin();
  pixels.setBrightness(50);
  colorWipe(pixels.Color(255, 255, 255), 50); // 항시 백광 출력

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  pinMode(FAN1, OUTPUT);
  pinMode(FAN2, OUTPUT);
  pinMode(FAN3, OUTPUT);
  digitalWrite(FAN1, HIGH);
  digitalWrite(FAN2, HIGH);
  digitalWrite(FAN3, HIGH);

  pinMode(A_1A, OUTPUT); // 모터드라이브 출력모드
  pinMode(A_1B, OUTPUT);
  digitalWrite(A_1A, LOW); // 모터드라이브 초기값은 끈 상태
  digitalWrite(A_1B, LOW);

  pumpStartTime = millis();

  lcd.init();
  lcd.clear();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Smart Farm");
  lcd.setCursor(0, 1);
  lcd.print("Starting.");
  delay(1000);
  lcd.setCursor(0, 1);
  lcd.print("Starting..");
  delay(1000);
  lcd.setCursor(0, 1);
  lcd.print("Starting...");
  delay(1000);
  dht.begin();
}

void loop() {
  Time time = myrtc.getTime();

  water_lev = analogRead(WATER_LEV);
  soil = analogRead(SOIL_HUMI); // A0에서 읽은 값 저장
  psoil = map(soil, 1023, 0, 0, 100); // 0 ~ 100으로 soil값 매핑

  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) {
    Serial.println("DHT센서 값 읽기 실패");
    return;
  }

  float distance = measureDistance();

  lcd.init();
  lcd.clear();
  lcd.backlight();
  lcd.display();
  lcd.setCursor(0, 0);
  lcd.print("S: ");
  lcd.print(psoil);
  lcd.print("%");
  lcd.setCursor(0, 1);
  lcd.print("T: ");
  lcd.print(t, 0);
  lcd.print("C");
  lcd.setCursor(8, 1);
  lcd.print("H: ");
  lcd.print(h, 0);
  lcd.print("%");
  
  if(water_lev < 500) {
    lcd.setCursor(15,1);
    lcd.print("!");
  }
  else {
    lcd.setCursor(15,1);
    lcd.print("");
  }

  Serial.print("수분량: ");
  Serial.print(psoil);
  Serial.print("%");

  Serial.print("  거리: ");
  Serial.print(distance);
  Serial.print("cm");

  Serial.print("  온도: ");
  Serial.print(t);
  Serial.print("C");

  Serial.print("  습도: ");
  Serial.print(h);
  Serial.print("%");

  Serial.print("  수위: ");
  Serial.print(water_lev);

  Serial.print(" 시작시간: ");
  Serial.print(pumpStartTime / 1000);
  Serial.print(" 경과시간: ");
  Serial.println(millis() / 1000);
  
  Serial.print(" 현재 시간: ");
  Serial.print(time.hour);
  Serial.print(":");
  Serial.print(time.min);
  Serial.print(":");
  Serial.print(time.sec);

  Serial.println();

  while (t <= 25) { // 온도 25 미만일 시, 진입
    while (t <= 30) {
      digitalWrite(FAN1, LOW); // 히터 ON
      digitalWrite(FAN2, LOW); // 히터팬 ON

      float t = dht.readTemperature();
      float h = dht.readHumidity();

      Serial.print("온도: ");
      Serial.print(t);
      Serial.print("C");

      Serial.print("  습도: ");
      Serial.print(h);
      Serial.print("%");
      Serial.println();
    }
    break;
  }

  if (psoil < 41) { // 토양수분값이 65미만이면
    if (pumpStartTime != 0 && millis() - pumpStartTime <= pumpRunTime) {
      digitalWrite(A_1A, HIGH); // 값을 변화(0~255)시키면서 호스에서 나오는 물의 양을 적절하게 설정
      analogWrite(A_1B, 0);
    }

    if (millis() - pumpStartTime > pumpRunTime && millis() - pumpStartTime <= pumpRunTime + pumpStopTime) {
      digitalWrite(A_1A, LOW); // 워터펌프 중단
      digitalWrite(A_1B, LOW);
    }

    if (millis() - pumpStartTime > pumpRunTime + pumpStopTime) {
      pumpStartTime = millis();
    }
  }
  else{  // 그 외 토양수분값이 측정되면 워터모터를 끄고 워터펌프 동작 시작 시간 초기화
    digitalWrite(A_1A, LOW);
    digitalWrite(A_1B, LOW);
    pumpStartTime = 0;
  }

  delay(1000);
}

float measureDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  unsigned long duration = pulseIn(ECHO_PIN, HIGH);
  float distance = ((duration * 0.0343) / 2); // 소리의 속도는 초당 343m, 왕복거리를 고려하여 나누기 2

  float height;
  if (25.8 - distance <= 0)
  {
    height = 0;
  }
  else {
    height = 25.8 - distance;
  }

  return height;
}

void colorWipe(uint32_t color, int wait) {
  for(int i = 0; i < pixels.numPixels(); i++) {
    pixels.setPixelColor(i, color);
    pixels.show();
    delay(wait);
  }
}
