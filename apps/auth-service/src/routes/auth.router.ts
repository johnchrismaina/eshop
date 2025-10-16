import express, { Router } from 'express';
import { userRegistration } from '../controller/auth.controller';

const router: Router = express.Router();

router.post('/userRegistration', userRegistration);

export default router;
