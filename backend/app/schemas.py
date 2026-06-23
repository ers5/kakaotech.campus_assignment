from datetime import date as Date

from pydantic import BaseModel, ConfigDict, Field


class TodoBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=100)
    date: Date


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    content: str | None = Field(default=None, min_length=1, max_length=100)
    date: Date | None = None
    completed: bool | None = None


class TodoResponse(TodoBase):
    id: int
    completed: bool

    model_config = ConfigDict(from_attributes=True)
