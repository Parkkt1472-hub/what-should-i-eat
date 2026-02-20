/**
 * Weather Service Utility
 * 날씨 정보를 가져와 추천에 반영하는 유틸리티
 */

export interface WeatherData {
  temperature: number; // Celsius
  condition: 'clear' | 'rain' | 'snow' | 'cloudy' | 'unknown';
}

export interface WeatherMultiplier {
  soup: number;
  spicy: number;
  cold: number; // 차가운 음식
}

/**
 * Open-Meteo API를 사용하여 현재 위치의 날씨 가져오기
 * 무료, 서버리스, API 키 불필요
 */
export async function getCurrentWeather(): Promise<WeatherData | null> {
  try {
    // 위치 정보 가져오기
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return null;
    }

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 5000,
        maximumAge: 300000, // 5분 캐시
      });
    });

    const { latitude, longitude } = position.coords;

    // Open-Meteo API 호출 (무료, API 키 불필요)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    
    if (!response.ok) {
      throw new Error('Weather API failed');
    }

    const data = await response.json();
    const current = data.current_weather;

    // 날씨 코드를 condition으로 변환
    const weatherCode = current.weathercode;
    let condition: WeatherData['condition'] = 'unknown';
    
    if (weatherCode === 0 || weatherCode === 1) {
      condition = 'clear'; // Clear or mainly clear
    } else if (weatherCode >= 51 && weatherCode <= 67) {
      condition = 'rain'; // Rain
    } else if (weatherCode >= 71 && weatherCode <= 77) {
      condition = 'snow'; // Snow
    } else {
      condition = 'cloudy'; // Cloudy or other
    }

    return {
      temperature: current.temperature,
      condition,
    };
  } catch (error) {
    console.warn('Failed to get weather:', error);
    return null;
  }
}

/**
 * 날씨에 따른 가중치 계산
 */
export function getWeatherMultiplier(weather: WeatherData | null): WeatherMultiplier {
  // 날씨 정보 없으면 중립 가중치
  if (!weather) {
    return { soup: 1.0, spicy: 1.0, cold: 1.0 };
  }

  const { temperature, condition } = weather;
  const multiplier: WeatherMultiplier = { soup: 1.0, spicy: 1.0, cold: 1.0 };

  // 온도 기반 가중치
  if (temperature < 10) {
    // 추울 때: 국물, 매운 음식 선호
    multiplier.soup = 1.3;
    multiplier.spicy = 1.2;
    multiplier.cold = 0.7;
  } else if (temperature > 25) {
    // 더울 때: 시원한 음식, 가벼운 음식 선호
    multiplier.soup = 0.8;
    multiplier.spicy = 0.9;
    multiplier.cold = 1.3;
  }

  // 날씨 조건 기반 가중치
  if (condition === 'rain' || condition === 'snow') {
    // 비/눈: 따뜻한 음식 선호 (comfort food)
    multiplier.soup = multiplier.soup * 1.2;
    multiplier.spicy = multiplier.spicy * 1.1;
  }

  return multiplier;
}

/**
 * 날씨 설명 텍스트 생성 (다양한 문구)
 */
export function getWeatherDescription(weather: WeatherData | null): string | null {
  if (!weather) return null;

  const { temperature, condition } = weather;

  // 추운 날씨 (<10°C)
  if (temperature < 10) {
    if (condition === 'rain' || condition === 'snow') {
      const messages = [
        '추운 날씨에 비까지... 따뜻한 국물이 딱이겠어요! ☔',
        '이런 날엔 뜨끈한 국밥 한 그릇이 보약이죠 🥘',
        '밖은 춥고 비까지! 집에서 따끈하게 드세요 ☔❄️',
        '날씨가 이래서야... 몸 녹일 따뜻한 음식 필수! 🌧️',
        '우산도 들고 몸도 추운 날, 국물로 힐링하세요 ☔',
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    const messages = [
      '쌀쌀한 날씨네요. 따뜻한 음식 어때요? 🌡️',
      '오늘 날씨 보니까 얼큰한 게 땡기는데요? 🥵',
      '추울 땐 역시 뜨끈한 국물이죠! ☕',
      '이런 날 집 밖 나가기 싫다면... 배달 ㄱㄱ 🛵',
      '몸이 으슬으슬? 따뜻한 음식으로 체온 상승! 🔥',
      '겨울엔 국물이 최고! 김치찌개 어때요? 🍲',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // 더운 날씨 (>25°C)
  if (temperature > 25) {
    const messages = [
      '더운 날씨! 시원하고 가볍게 먹기 좋은 날이에요 ☀️',
      '와... 덥다! 시원한 냉면 어때요? 🍜',
      '이 더위에는 차가운 음식이 최고죠 🧊',
      '더워 죽겠다... 아이스 아메리카노 한잔 ㄱ? ☕',
      '여름엔 역시 시원한 거! 냉면, 콩국수 추천! 🌊',
      '더위 먹기 전에 가볍게 드세요 🌞',
      '에어컨 틀고 배달음식 최고 아닙니까? 🛵',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // 비 오는 날
  if (condition === 'rain') {
    const messages = [
      '비 오는 날엔 따끈한 음식이 제맛! 🌧️',
      '비 오는 날 파전에 막걸리... 낭만 아닙니까? 🍶',
      '우산 챙기셨어요? 음식도 챙기세요! ☔',
      '빗소리 들으며 먹는 라면... 꿀맛 🍜',
      '비가 와서 그런가, 뭔가 따뜻한 게 땡기네요 🌧️',
      '이런 날엔 집콕하고 맛있는 거 시켜먹죠 뭐 🏠',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // 적당한 날씨 (10-25°C)
  const messages = [
    '딱 좋은 날씨네요! 뭐든 맛있을 것 같아요 😊',
    '날씨 좋을 때 밖에 나가서 드실래요? 🚶',
    '오늘 같은 날엔 외식도 좋겠어요! 🍽️',
    '완벽한 날씨! 맛있는 거 먹으러 갈까요? ☺️',
    '날씨도 좋은데, 기분 좋게 한 끼 하세요! 🎵',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
