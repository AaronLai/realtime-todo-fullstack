"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, Input, Button } from "@nextui-org/react";

export default function BoardPage() {
  const [todos, setTodos] = useState<string[]>([]);
  const [newTodo, setNewTodo] = useState("");

  const handleAddTodo = () => {
    if (newTodo.trim() !== "") {
      setTodos([...todos, newTodo]);
      setNewTodo("");
    }
  };

  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-lg font-bold">Add New Todo</h2>
      </CardHeader>
      <CardBody>
          <div className="flex gap-2">
            <Input
              placeholder="Enter a new todo"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
            />
            <Button onClick={handleAddTodo}>Add</Button>
    </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold">Todo List</h2>
        </CardHeader>
        <CardBody>
          {todos.length === 0 ? (
            <p>No todos yet. Add some above!</p>
          ) : (
            <ul className="list-disc pl-5">
              {todos.map((todo, index) => (
                <li key={index}>{todo}</li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}