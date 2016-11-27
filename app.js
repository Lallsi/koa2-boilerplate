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

var idSchema = mongoose.Schema({
    id: Number
});


var Todo = mongoose.model("Todo", todoSchema);
var Id = mongoose.model("Id", idSchema);

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
	  });
  });
  var res = {todos: todos};
  console.log(res);
  this.body = res;
});

router.post('/api/v1/add', function *(next) {
	var taskId = 0;
  yield Id.find().exec(
    function (err, id) {
      if(err) console.log(err);
	  if(!id[0]) {
		var newId = new Id({id: 0});
		newId.save(function(err,res){
		  if(err)
			console.log("Error adding new id to database");
		});
	  }
	  else {
		Id.update({id: id[0].id}, {id: id[0].id+1}).exec();
		taskId = id[0].id+1;
	  }
	}
  );
  
  var todo = {
	  id: taskId,
	  title: this.request.body.title,
	  done: false
  };

  this.body = todo;
  
  var newTodo = new Todo({
	id: todo.id,
	title: todo.title,
	done: todo.done
  });

  yield newTodo.save(function(err, res){
	if(err)
	  console.log("Error adding entry to database");
	else
	  console.log( "Added task "+ JSON.stringify(todo));
  });
});

router.delete('/api/v1/remove/:id', function *(next) {
  var task = yield Todo.find({id: this.params.id}).exec();
  yield Todo.remove({id: this.params.id}).exec();
  this.body = { id: this.params.id, removed: true };
  var print = {
	  id: task[0].id,
	  title: task[0].title,
	  done: task[0].done
  };
  console.log("Deleted task " + JSON.stringify(print));
});

router.put('/api/v1/done', function *(next) {
  yield Todo.update({id: this.request.body.id}, {done: this.request.body.done}).exec();
  var updated = yield Todo.find({id: this.request.body.id}).exec();
  this.body = {
	  id: updated[0].id,
	  title: updated[0].title,
	  done: updated[0].done
  };
  console.log("Updated task " + JSON.stringify(this.body) );
});

app.use(router.routes())
  .use(router.allowedMethods());
  
  
app.listen(8000, () => console.log('server started 8000'));

export default app;
