// server/server.mjs
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const app = express();
const PORT = process.env.PORT || 4000;

// ===== ESM 환경에서 __dirname 구하기 =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite build 결과(dist) 폴더 경로
const distPath = path.join(__dirname, '..', 'dist');

app.use(cors());
app.use(express.json());

// ===================== API 라우트들 ===================== //

// 0) 테스트용
app.get('/api/hello', (req, res) => {
  res.json({ ok: true, message: 'API 서버 잘 돌아가는 중!' });
});

// 1) DB 연결 풀 만들기
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'busrute',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 2) 테스트용 라우트 (서버 + DB 둘 다 확인용)
app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS result');
    res.json({ ok: true, db: rows });
  } catch (err) {
    console.error('DB Test Error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// 1) 대중교통 경로 (ODsay searchPubTransPathT)
app.get('/api/transit', async (req, res) => {
  try {
    const { fromLat, fromLng, toLat, toLng } = req.query;
    if (!fromLat || !fromLng || !toLat || !toLng) {
      return res.status(400).json({ error: 'fromLat, fromLng, toLat, toLng 필요' });
    }

    const apiKey = encodeURIComponent(process.env.ODSAY_API_KEY);
    const url = `https://api.odsay.com/v1/api/searchPubTransPathT?SX=${fromLng}&SY=${fromLat}&EX=${toLng}&EY=${toLat}&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('TRANSIT ERROR:', err);
    res.status(500).json({ error: 'ODsay 경로 호출 실패' });
  }
});

// 2) 상세 경로 (ODsay loadLane)
app.get('/api/route-lane', async (req, res) => {
  try {
    const { mapObject } = req.query;
    if (!mapObject) {
      return res.status(400).json({ error: 'mapObject 필요' });
    }

    const apiKey = encodeURIComponent(process.env.ODSAY_API_KEY);
    const url = `https://api.odsay.com/v1/api/loadLane?mapObject=${mapObject}&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('ROUTE-LANE ERROR:', err);
    res.status(500).json({ error: 'ODsay loadLane 호출 실패' });
  }
});

// 3) 날씨 (OpenWeatherMap)
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat, lon 필요' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.error('WEATHER ERROR:', err);
    res.status(500).json({ error: 'Weather API 호출 실패' });
  }
});

// ===================== 정적 파일 서빙 (프론트) ===================== //

// dist 폴더(static) 서빙
app.use(express.static(distPath));

// Express 5에서는 '*' 대신 이렇게 써야 함
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중 (프론트 + API)`);
});

