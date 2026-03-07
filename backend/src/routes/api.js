const express = require('express');
const router = express.Router();

const { createWallet, getParticipant } = require('../controllers/walletController');
const { getCourses, getCourseModules, getLessonQuiz, completeLesson, getProgressOverview, getAllParticipantsWithProgress, updateCourseStatus, getSystemSettings, updateSystemSetting, getLesson, updateCourse, updateModule, updateLesson, createCourse, deleteCourse, createModule, deleteModule, createLesson, deleteLesson } = require('../controllers/lmsController');
const { issueCredential, verifyCredential, getCredentialsByAddress } = require('../controllers/credentialController');
const { releaseGrant, getGrants, getGlobalImpactStats, getRecentGrants } = require('../controllers/grantController');

// Define API Endpoints

// 1. Participant Routes
router.post('/create-wallet', createWallet);
router.get('/participant/:phone', getParticipant);

// 2. LMS Routes
router.get('/courses', getCourses);
router.get('/courses/:courseId/modules', getCourseModules);
router.get('/lessons/:lessonId/quiz', getLessonQuiz);
router.post('/complete-lesson', completeLesson);
router.get('/lessons/:lessonId', getLesson);
router.get('/progress-overview/:participantId', getProgressOverview);

// 3. Admin & System Management
router.get('/admin/participants', getAllParticipantsWithProgress);
router.post('/admin/courses', createCourse);
router.post('/admin/course-status', updateCourseStatus);
router.post('/admin/courses/:courseId', updateCourse);
router.delete('/admin/courses/:courseId', deleteCourse);

router.post('/admin/modules', createModule);
router.post('/admin/modules/:moduleId', updateModule);
router.delete('/admin/modules/:moduleId', deleteModule);

router.post('/admin/lessons', createLesson);
router.post('/admin/lessons/:lessonId', updateLesson);
router.delete('/admin/lessons/:lessonId', deleteLesson);
router.get('/admin/settings', getSystemSettings);
router.post('/admin/settings', updateSystemSetting);

// 3. Credential Routes
router.post('/issue-credential', issueCredential);
router.get('/verify-credential/:credentialId', verifyCredential);
router.get('/credentials/:address', getCredentialsByAddress);

// 4. Grant Routes
router.post('/release-grant', releaseGrant);
router.get('/grants/:participantId', getGrants);

// 5. Impact & Analytics (Public)
router.get('/impact/stats', getGlobalImpactStats);
router.get('/impact/recent-grants', getRecentGrants);

module.exports = router;
