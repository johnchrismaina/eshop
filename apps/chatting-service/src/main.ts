import express from 'express';
import cookieParser from 'cookie-parser';
import { createWebSocketServer } from './websocket';
import { startConsumer } from './chat-message.consumer';
import router from './routes/chat.routes';
import { logInfo, logError } from '@packages/utils/logger';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to chatting-service!' });
});

// routes
app.use('/api', router);

const port = process.env.PORT || 6006;

const server = app.listen(port, () => {
  logInfo(`Listening at http://localhost:${port}/api`);
});

// Websocket server
createWebSocketServer(server);

// start kafka consumer
startConsumer().catch((error: any) => {
  logError('Kafka consumer error:', error);
});

server.on('error', (error) => {
  logError('Server error:', error);
});
