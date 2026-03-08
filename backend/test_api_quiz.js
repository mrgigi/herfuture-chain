const axios = require('axios');
axios.get('https://herfuture.vercel.app/api/lessons/3e450056-8e4c-4168-86e8-cb9d03f91dc1/quiz')
  .then(res => console.log("LIVE API quiz response:", res.data))
  .catch(err => console.error("LIVE API Quiz Error:", err.message, err.response?.data));
