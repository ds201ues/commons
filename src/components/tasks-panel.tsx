"use client";

import { useState, type FormEvent } from "react";
import type { Room, Seat, Task } from "@/lib/types";

type Props = {
  roomId: string
  seat: Seat
  tasks: Task[]
  onUpdated: (room: Room) => void
};

type OpsJson = {
  ok: boolean
  room?: Room
  hint?: string
};

export function TasksPanel({ roomId, seat, tasks, onUpdated }: Props) {
  const [text, setText] = useState("");
  const [assignee, setAssignee] = useState<Seat>(seat === "owner" ? "contributor" : "owner");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function postOp(op: "add_task" | "complete_task", input: Record<string, string>) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${roomId}/ops`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seat, as: seat, op, input }),
      });
      const json = (await res.json()) as OpsJson;
      if (!json.ok || !json.room) {
        setError(json.hint ?? "Request failed");
        return false;
      }
      onUpdated(json.room);
      return true;
    } catch {
      setError("Network error");
      return false;
    } finally {
      setPending(false);
    }
  }

  async function onAdd(event: FormEvent) {
    event.preventDefault();
    const ok = await postOp("add_task", { text: text.trim(), assignee });
    if (ok) setText("");
  }

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <section className="tasks-panel" aria-label="Tasks">
      <div className="tasks-panel__header">
        <p className="eyebrow">Assigned work</p>
        <h2>Tasks</h2>
        <p className="tasks-panel__hint">
          Hand work to a seat — its agent picks it up from the workspace.
        </p>
      </div>

      {tasks.length === 0 ? (
        <p className="empty">No tasks yet. Assign the first one below.</p>
      ) : (
        <ul className="tasks-panel__list">
          {[...open, ...done].map((task) => (
            <li key={task.id} className={task.done ? "task task--done" : "task"}>
              <label className="task__row">
                <input
                  type="checkbox"
                  checked={task.done}
                  disabled={pending}
                  onChange={() => void postOp("complete_task", { taskId: task.id })}
                />
                <span className="task__text">{task.text}</span>
              </label>
              <span
                className={`task__assignee task__assignee--${task.assignee}`}
                title={`Assigned to the ${task.assignee} seat`}
              >
                {task.assignee === seat ? "your agent" : `${task.assignee}'s agent`}
              </span>
            </li>
          ))}
        </ul>
      )}

      <form className="tasks-panel__add" onSubmit={(e) => void onAdd(e)}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task…"
          disabled={pending}
          required
          aria-label="Task text"
        />
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value as Seat)}
          disabled={pending}
          aria-label="Assign to seat"
        >
          <option value="owner">Owner</option>
          <option value="contributor">Contributor</option>
        </select>
        <button type="submit" disabled={pending || !text.trim()}>
          Assign
        </button>
      </form>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
