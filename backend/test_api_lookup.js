const axios = require('axios');

async function testApi() {
    const phone = '0739039856';
    const baseUrl = 'http://localhost:3000/api';
    console.log(`Testing API at ${baseUrl} for participant ${phone}`);
    try {
        const response = await axios.get(`${baseUrl}/participant/${phone}`);
        console.log('API Response Success:', response.data);
    } catch (error) {
        console.error('API Response Error:', error.response ? error.response.status : error.message);
        if (error.response) console.error('Error Body:', error.response.data);
    }
}

testApi();
