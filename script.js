// Используем локальный бэкенд прокси вместо прямых вызовов GREEN-API
const BASE_URL = '/api/green-api';

function getInstanceData() {
    const idInstance = document.getElementById('idInstance').value.trim();
    const apiTokenInstance = document.getElementById('apiTokenInstance').value.trim();
    
    if (!idInstance || !apiTokenInstance) {
        updateResponse('Ошибка: Пожалуйста, введите idInstance и ApiTokenInstance', 'error');
        return null;
    }
    
    return { idInstance, apiTokenInstance };
}

function updateResponse(data, type = 'success') {
    const responseArea = document.getElementById('responseArea');
    const timestamp = new Date().toLocaleString();
    
    let formattedData;
    if (typeof data === 'object') {
        formattedData = JSON.stringify(data, null, 2);
    } else {
        formattedData = data;
    }
    
    responseArea.value = `[${timestamp}] ${formattedData}`;
    responseArea.className = `response-area ${type}`;
    
    // Прокрутить к началу области ответа для показа нового содержимого
    responseArea.scrollTop = 0;
}

async function makeApiRequest(endpoint, httpMethod = 'GET', requestData = null) {
    const instanceData = getInstanceData();
    if (!instanceData) return;

    const { idInstance, apiTokenInstance } = instanceData;
    const url = `${BASE_URL}/${idInstance}/${endpoint}/${apiTokenInstance}`;

    updateResponse('Загрузка...', 'loading');

    try {
        const options = {
            method: 'POST', // Always POST to our backend proxy
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                httpMethod: httpMethod,
                data: requestData
            })
        };

        const response = await fetch(url, options);
        const data = await response.json();

        if (response.ok) {
            updateResponse(data, 'success');
        } else {
            updateResponse(`Ошибка ${response.status}: ${JSON.stringify(data)}`, 'error');
        }
    } catch (error) {
        updateResponse(`Сетевая ошибка: ${error.message}`, 'error');
    }
}

async function getSettings() {
    await makeApiRequest('getSettings', 'GET');
}

async function getStateInstance() {
    await makeApiRequest('getStateInstance', 'GET');
}

function formatPhoneNumber(phone) {
    // Удалить все не-цифровые символы
    let cleaned = phone.replace(/\D/g, '');
    
    // Если начинается с +, удалить его (уже очищено выше)
    // Если начинается с 00, удалить это
    if (cleaned.startsWith('00')) {
        cleaned = cleaned.substring(2);
    }
    
    // Если не начинается с кода страны, предполагаем что он нужен
    // Это базовая проверка - возможно потребуется настройка для вашего региона
    if (cleaned.length === 10) {
        // Предполагаем номер США, добавляем код страны 1
        cleaned = '1' + cleaned;
    }
    
    return cleaned;
}

async function sendMessage() {
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const messageText = document.getElementById('messageText').value.trim();

    if (!phoneNumber || !messageText) {
        updateResponse('Ошибка: Пожалуйста, введите номер телефона и текст сообщения', 'error');
        return;
    }

    // Форматировать номер телефона
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Проверить формат номера телефона
    if (!/^\d{10,15}$/.test(formattedPhone)) {
        updateResponse('Ошибка: Номер телефона должен содержать 10-15 цифр в международном формате (например, 1234567890 для США, 77771234567 для Казахстана)', 'error');
        return;
    }

    const requestData = {
        chatId: `${formattedPhone}@c.us`,
        message: messageText
    };

    await makeApiRequest('sendMessage', 'POST', requestData);
}

async function sendFileByUrl() {
    const phoneNumber = document.getElementById('phoneNumberFile').value.trim();
    const fileUrl = document.getElementById('fileUrl').value.trim();

    if (!phoneNumber || !fileUrl) {
        updateResponse('Ошибка: Пожалуйста, введите номер телефона и URL файла', 'error');
        return;
    }

    // Форматировать номер телефона
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Проверить формат номера телефона
    if (!/^\d{10,15}$/.test(formattedPhone)) {
        updateResponse('Ошибка: Номер телефона должен содержать 10-15 цифр в международном формате (например, 1234567890 для США, 77771234567 для Казахстана)', 'error');
        return;
    }

    // Проверить формат URL
    if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
        updateResponse('Ошибка: URL файла должен начинаться с http:// или https://', 'error');
        return;
    }

    const requestData = {
        chatId: `${formattedPhone}@c.us`,
        urlFile: fileUrl,
        fileName: 'file.png'
    };

    await makeApiRequest('sendFileByUrl', 'POST', requestData);
}



// Инициализировать с пустой областью ответов
document.addEventListener('DOMContentLoaded', function() {
    const responseArea = document.getElementById('responseArea');
    responseArea.value = '';
    responseArea.placeholder = 'Ответы API будут отображаться здесь...';
}); 