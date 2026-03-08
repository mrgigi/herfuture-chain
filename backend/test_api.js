const axios = require('axios');
axios.get('http://localhost:3000/api/courses')
  .then(res => {
     let course = res.data[0];
     console.log("Course ID:", course.id);
     return axios.get(`http://localhost:3000/api/courses/${course.id}/modules`);
  })
  .then(res => {
     let lessonId = res.data[0]?.lessons?.[0]?.id;
     console.log("Lesson ID:", lessonId);
     if (lessonId) return axios.get(`http://localhost:3000/api/lessons/${lessonId}`);
  })
  .then(res => {
     console.log("Lesson data keys:", res ? Object.keys(res.data) : null);
     console.log("Lesson data learning outcomes:", res?.data?.learning_outcomes);
  })
  .catch(err => console.error(err.message));
