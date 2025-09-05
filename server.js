const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Промежуточное ПО
app.use(cors());
app.use(express.json());

// Explicit static file routes with correct MIME types
app.get('/styles.css', (req, res) => {
    const filePath = path.join(__dirname, 'styles.css');
    console.log(`Serving CSS from: ${filePath}`);
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error serving CSS:', err);
            res.status(404).send('CSS file not found');
        }
    });
});

app.get('/script.js', (req, res) => {
    const filePath = path.join(__dirname, 'script.js');
    console.log(`Serving JS from: ${filePath}`);
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error serving JS:', err);
            res.status(404).send('JS file not found');
        }
    });
});

// Fallback static middleware for other files
app.use(express.static(path.join(__dirname, '.'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Базовый URL GREEN-API
const GREEN_API_BASE_URL = 'https://api.green-api.com';

// Прокси эндпоинт для запросов GREEN-API
app.post('/api/green-api/:idInstance/:method/:apiToken', async (req, res) => {
    try {
        const { idInstance, method, apiToken } = req.params;
        
        // Проверить входные параметры
        if (!idInstance || !method || !apiToken) {
            return res.status(400).json({
                error: 'Неверный запрос',
                message: 'Отсутствуют обязательные параметры: idInstance, method или apiToken'
            });
        }

        // Проверить формат учетных данных (базовая проверка)
        if (idInstance === '123' || apiToken === 'asd') {
            return res.status(400).json({
                error: 'Неверные учетные данные',
                message: 'Пожалуйста, введите действительные idInstance и ApiTokenInstance из вашего аккаунта GREEN-API'
            });
        }

        const url = `${GREEN_API_BASE_URL}/waInstance${idInstance}/${method}/${apiToken}`;
        
        console.log(`Making request to: ${url}`);
        
        const options = {
            method: req.body.httpMethod || 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (req.body.data) {
            options.body = JSON.stringify(req.body.data);
        }

        const response = await fetch(url, options);
        
        // Проверить, является ли ответ JSON
        const contentType = response.headers.get('content-type');
        
        if (!contentType || !contentType.includes('application/json')) {
            // Если не JSON, получить текст чтобы увидеть что мы получили
            const text = await response.text();
            console.error('Получен не-JSON ответ:', text.substring(0, 200));
            
            return res.status(response.status || 500).json({
                error: 'Неверный ответ API',
                message: `GREEN-API вернул не-JSON ответ. Статус: ${response.status}. Обычно это означает неверные учетные данные или эндпоинт API.`,
                details: text.substring(0, 200) + (text.length > 200 ? '...' : '')
            });
        }

        const data = await response.json();

        res.status(response.status).json(data);
    } catch (error) {
        console.error('API Error:', error);
        
        // Более специфичная обработка ошибок
        if (error.message.includes('invalid json response body')) {
            res.status(400).json({ 
                error: 'Неверный ответ API', 
                message: 'GREEN-API вернул неверный ответ. Пожалуйста, проверьте ваши учетные данные (idInstance и ApiTokenInstance).',
                details: 'Убедитесь, что вы используете реальные учетные данные из вашего аккаунта GREEN-API, а не заполнители.'
            });
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            res.status(503).json({
                error: 'Сетевая ошибка',
                message: 'Невозможно подключиться к GREEN-API. Пожалуйста, проверьте ваше интернет-соединение.',
                details: error.message
            });
        } else {
            res.status(500).json({ 
                error: 'Внутренняя ошибка сервера', 
                message: error.message 
            });
        }
    }
});

// Обслуживать главную страницу
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});



// Эндпоинт проверки состояния
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint to check available files
app.get('/debug/files', (req, res) => {
    const fs = require('fs');
    try {
        const files = fs.readdirSync(__dirname);
        res.json({ 
            directory: __dirname,
            files: files,
            cssExists: fs.existsSync(path.join(__dirname, 'styles.css')),
            jsExists: fs.existsSync(path.join(__dirname, 'script.js'))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📱 Страница тестирования GREEN-API: http://localhost:${PORT}`);
});

module.exports = app; 