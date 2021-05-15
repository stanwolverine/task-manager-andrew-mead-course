const app = require('./app');

const port = process.env.PORT;

app.listen(port, () => console.info('Server started on port ', port));
