const port = process.env.PORT || 6006;

// routes
app.use('/api', router);

// Websocket server
createWebSocketServer(server);

// start kafka consumer
startConsumer().catch((error: any) => {
  console.log(error);
});
