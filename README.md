# Assignment 3

기존 React 기반 Todo 앱을 Next.js로 마이그레이션한 과제입니다.

## 백엔드

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```


## 프론트엔드

```bash
cd frontend
npm install
npm run dev
```


## API

- `GET /todos?week_start=YYYY-MM-DD`: 특정주의 모든 Todo를 가져옵니다
- `POST /todos`: Todo를 생성하여 DB에 저장합니다
- `PUT /todos/{todo_id}`: DB에 있는 Todo를 ID를 기준으로 찾아서, 수정합니다
- `DELETE /todos/{todo_id}`: DB에 있는 Todo를 ID를 기준으로 찾아서 삭제합니다
