import Koa from 'koa';
import Router from 'koa-router';
import logger from 'koa-logger';
import json from 'koa-json';
import mongoose from 'mongoose';
import cors from 'koa-cors';
import body from 'koa-body';
const app = new Koa();
const router = new Router();

// Logger
app.use(logger());
app.use(json());
app.use(cors());
app.use(body());

mongoose.connect('mongodb://localhost:27017/test');

var todoSchema = mongoose.Schema({
    id: Number,
    title: String,
    done: Boolean
});

var Todo = mongoose.model("Todo", todoSchema);

router.get('/api/v1/get', function *(next) {
	
  var todos = [];
  yield Todo.find().exec(
    function(err,res) {
	  if (err) console.log(err);
      res.forEach(function(elem){
	    var todo = {
	     id: elem.id,
		 title: elem.title,
		 done: elem.done
		};
	    todos.push(todo);
	    console.log(todo); 
	  });
  });
  var res = {todos: todos};
  console.log(res);
  this.body = res;
});

router.post('/api/v1/add', function *(next) {
  console.log(this.request.body);
  
  var newId = 0;
  
  yield Todo.find().sort({id: -1}).limit(1).exec(
    function (err, todo) {
      if(err) console.log(err);
	  if(todo[0]) newId = todo[0].id+1;
    }
  );
  var todo = {
	  id: newId,
	  title: this.request.body.title,
	  done: false
  };

  console.log(todo);

  this.body = todo;
  
  var newTodo = new Todo({
	id: todo.id,
	title: todo.title,
	done: todo.done
  });
  
  yield newTodo.save(function(err, res){
	if(err)
	  console.log("DB ERROR");
	else
	  console.log("NEW TASK ADDED");
  });
});

router.delete('/api/v1/remove', function *(next) {
  console.log(this.request.body);
  this.body = this.request.body;
});

router.put('/api/v1/done', function *(next) {
  console.log(this.request.body);
  this.body = this.request.body;
});

app.use(router.routes())
  .use(router.allowedMethods());
  
  
app.listen(8000, () => console.log('server started 8000'));

export default app;
