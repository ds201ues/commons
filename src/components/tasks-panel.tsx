"use client";

import { useState } from "react";
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

/** Task list only — assign via the composer Task tab (no duplicate form). */
export function TasksPanel({ roomId, seat, tasks, onUpdated }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleDone(taskId: string) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${roomId}/ops`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          as: seat,
          op: "complete_task",
          input: { taskId },
        }),
      });
      const json = (await res.json()) as OpsJson;
      if (!json.ok || !json.room) {
        setError(json.hint ?? "Request failed");
        return;
      }
      onUpdated(json.room);
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <section className="tasks-panel" aria-label="Tasks">
      <div className="tasks-panel__header">
        <h2>Tasks</h2>
      </div>

      {tasks.length === 0 ? (
        <p className="empty">Assign from the Task tab above.</p>
      ) : (
        <ul className="tasks-panel__list">
          {[...open, ...done].map((task) => (
            <li key={task.id} className={task.done ? "task task--done" : "task"}>
              <label className="task__row">
                <input
                  type="checkbox"
                  checked={task.done}
                  disabled={pending}
                  onChange={() => void toggleDone(task.id)}
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

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
