from datetime import date, timedelta

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Todo
from .schemas import TodoCreate, TodoResponse, TodoUpdate


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Weekly Todo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/todos", response_model=list[TodoResponse])
def get_week_todos(
    week_start: date = Query(..., description="Sunday date for the current week"),
    filter: str | None = Query(None, description="Filter by status: active or completed"),
    search: str | None = Query(None, description="Search by todo content"),
    db: Session = Depends(get_db),
):
    week_end = week_start + timedelta(days=6)
    statement = select(Todo).where(Todo.date >= week_start, Todo.date <= week_end)
    
    # Apply filter
    if filter == "active":
        statement = statement.where(Todo.completed == False)
    elif filter == "completed":
        statement = statement.where(Todo.completed == True)
    
    # Apply search
    if search:
        statement = statement.where(Todo.content.contains(search))
    
    statement = statement.order_by(Todo.date.asc(), Todo.id.desc())

    return db.scalars(statement).all()


@app.post("/todos", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    new_todo = Todo(content=todo.content.strip(), date=todo.date, completed=False)

    if not new_todo.content:
        raise HTTPException(status_code=400, detail="Todo content is required.")

    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)

    return new_todo


@app.put("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, todo_update: TodoUpdate, db: Session = Depends(get_db)):
    todo = db.get(Todo, todo_id)

    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found.")

    update_data = todo_update.model_dump(exclude_unset=True)

    if "content" in update_data:
        content = update_data["content"].strip()

        if not content:
            raise HTTPException(status_code=400, detail="Todo content is required.")

        todo.content = content

    if "date" in update_data:
        todo.date = update_data["date"]

    if "completed" in update_data:
        todo.completed = update_data["completed"]

    db.commit()
    db.refresh(todo)

    return todo


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.get(Todo, todo_id)

    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found.")

    db.delete(todo)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
