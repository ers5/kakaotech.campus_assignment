# Assignment 3

Next.js App Router frontend and FastAPI backend for the weekly Todo app.

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs on `http://localhost:8000`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

## API

- `GET /todos?week_start=YYYY-MM-DD`: returns todos from the given Sunday through Saturday.
- `POST /todos`: creates a todo.
- `PUT /todos/{todo_id}`: updates a todo by id.
- `DELETE /todos/{todo_id}`: deletes a todo by id.
