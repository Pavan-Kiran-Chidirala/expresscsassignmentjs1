const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running...");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const priority_list = ["HIGH", "MEDIUM", "LOW"];
const status_list = ["TO DO", "IN PROGRESS", "DONE"];
const category_list = ["WORK", "HOME", "LEARNING"];
const checkStatus = (request, response, next) => {
  const { status } = request.query;
  if (status !== undefined) {
    if (!status_list.includes(`${status}`)) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      next();
    }
  } else {
    next();
  }
};
const checkPriority = (request, response, next) => {
  const { priority } = request.query;
  if (priority !== undefined) {
    if (!priority_list.includes(`${priority}`)) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      next();
    }
  } else {
    next();
  }
};
const checkCategory = (request, response, next) => {
  const { category } = request.query;
  if (category !== undefined) {
    if (!category_list.includes(`${category}`)) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      next();
    }
  } else {
    next();
  }
};
const checkDueDate = (request, response, next) => {
  const { date } = request.query;
  if (date === undefined) {
    next();
  } else {
    let date_list = date.split("-");
    let new_date_list = [];
    for (let i of date_list) {
      new_date_list.push(parseInt(i));
    }
    if (
      isValid(
        new Date(new_date_list[0], new_date_list[1] - 1, new_date_list[2])
      )
    ) {
      let new_due_date = format(
        new Date(new_date_list[0], new_date_list[1] - 1, new_date_list[2]),
        "yyyy-MM-dd"
      );
      request.new_due_date = new_due_date;
      console.log(new_due_date);
      next();
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
};
//
const checkStatus2 = (request, response, next) => {
  const { status } = request.body;
  if (status !== undefined) {
    if (!status_list.includes(`${status}`)) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      next();
    }
  } else {
    next();
  }
};
const checkPriority2 = (request, response, next) => {
  const { priority } = request.body;
  if (priority !== undefined) {
    if (!priority_list.includes(`${priority}`)) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      next();
    }
  } else {
    next();
  }
};
const checkCategory2 = (request, response, next) => {
  const { category } = request.body;
  if (category !== undefined) {
    if (!category_list.includes(`${category}`)) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      next();
    }
  } else {
    next();
  }
};
const checkDueDate2 = (request, response, next) => {
  const { dueDate } = request.body;
  if (dueDate === undefined) {
    next();
  } else {
    let date_list = dueDate.split("-");
    let new_date_list = [];
    for (let i of date_list) {
      new_date_list.push(parseInt(i));
    }
    if (
      isValid(
        new Date(new_date_list[0], new_date_list[1] - 1, new_date_list[2])
      )
    ) {
      let new_due_date = format(
        new Date(new_date_list[0], new_date_list[1] - 1, new_date_list[2]),
        "yyyy-MM-dd"
      );
      request.new_due_date = new_due_date;
      console.log(new_due_date);
      next();
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
};
//App1
app.get(
  "/todos/",
  checkStatus,
  checkPriority,
  checkCategory,
  async (request, response) => {
    const {
      search_q = "",
      category = "",
      priority = "",
      status = "",
      date = "",
    } = request.query;
    const query = `
  SELECT id,todo,priority,status,category,due_date AS dueDate
  FROM todo
  WHERE todo LIKE '%${search_q}%' AND category LIKE '%${category}%' AND status LIKE '%${status}%' AND priority LIKE '%${priority}%';
  `;
    const dbResponse = await db.all(query);
    response.send(dbResponse);
  }
);
//App2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `
        SELECT id,todo,priority,status,category,due_date AS dueDate
        FROM todo
        WHERE id= ${todoId};
    `;
  const dbResponse = await db.get(query);
  response.send(dbResponse);
});
//App3
app.get("/agenda/", checkDueDate, async (request, response) => {
  let date = request.new_due_date;
  const query = `
        SELECT id,todo,priority,status,category,due_date AS dueDate
        FROM todo
        WHERE due_date= date('${date}');
    `;
  const dbResponse = await db.all(query);
  response.send(dbResponse);
});
//App4
app.post(
  "/todos/",
  checkStatus2,
  checkPriority2,
  checkCategory2,
  checkDueDate2,
  async (request, response) => {
    const { id, todo, category, priority, status } = request.body;
    dueDate = request.new_due_date;
    const query = `
  INSERT INTO todo(id,todo,priority,status,category,due_date)
  VALUES (${id},'${todo}','${priority}','${status}','${category}',date('${dueDate}'));
  `;
    await db.run(query);
    response.send("Todo Successfully Added");
  }
);
//App5
app.put(
  "/todos/:todoId/",
  checkStatus2,
  checkPriority2,
  checkCategory2,
  checkDueDate2,
  async (request, response) => {
    let { todo, category, priority, status, dueDate } = request.body;
    const { todoId } = request.params;
    dueDate = request.new_due_date;
    if (todo !== undefined) {
      const query = `
        UPDATE todo
        SET todo= '${todo}'
        WHERE id= ${todoId};
        `;
      await db.run(query);
      response.send("Todo Updated");
    } else if (category !== undefined) {
      const query = `
        UPDATE todo
        SET category= '${category}'
        WHERE id= ${todoId};
        `;
      await db.run(query);
      response.send("Category Updated");
    } else if (priority !== undefined) {
      const query = `
        UPDATE todo
        SET priority= '${priority}'
        WHERE id= ${todoId};
        `;
      await db.run(query);
      response.send("Priority Updated");
    } else if (status !== undefined) {
      const query = `
        UPDATE todo
        SET status= '${status}'
        WHERE id= ${todoId};
        `;
      await db.run(query);
      response.send("Status Updated");
    } else if (dueDate !== undefined) {
      const query = `
        UPDATE todo
        SET due_date= date('${dueDate}')
        WHERE id= ${todoId};
        `;
      await db.run(query);
      response.send("Due Date Updated");
    }
  }
);
//App6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `
        DELETE FROM todo
        WHERE id= ${todoId};
    `;
  await db.run(query);
  response.send("Todo Deleted");
});
module.exports = app;
