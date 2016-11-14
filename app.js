import Koa from 'koa';
import Router from 'koa-router';
import logger from 'koa-logger';
import json from 'koa-json';
import mongo from 'koa-mongo';
const app = new Koa();
const router = new Router();

// Logger
app.use(logger());
app.use(json());

app.use(mongo({
  host: 'localhost',
  port: 27017,
  db: 'test',
  max: 100,
  min: 1,
  timeout: 30000,
  log: false
}));

router.get('/api/v1/get', function *(next) {
  this.body = {demo: 'Demo'};
});

router.post('/api/v1/add', function *(next) {
  this.body = {demo: 'Demo'};
});

router.del('/api/v1/remove', function *(next) {
  this.body = {demo: 'Demo'};
});

router.put('/api/v1/done', function *(next) {
  yield this.mongo.db('test').collection('users').insert({ name: 'haha' });
});

app.use(router.routes())
  .use(router.allowedMethods());
  
  
app.listen(8000, () => console.log('server started 8000'));

export default app;
