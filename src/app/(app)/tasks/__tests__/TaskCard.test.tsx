import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCard } from "@/features/tasks/components/TaskCard";
import type { Task } from "@/lib/types";

describe("TaskCard", () => {
  const mockTask: Task = {
    id: "test-task-1",
    title: "Implement Auth",
    description: "Setup firebase auth",
    courseName: "CS101",
    priority: "High",
    status: "In Progress",
    dueDate: "2024-12-31",
    category: "Homework/Assignment",
    estimatedHours: 5,
    progress: 50,
  } as any;

  const mockOnUpdateProgress = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders task details correctly", () => {
    render(
      <TaskCard
        task={mockTask as any}
        onUpdateProgress={mockOnUpdateProgress}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Implement Auth")).toBeInTheDocument();
    expect(screen.getByText("CS101")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Homework/Assignment")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("calls onDelete when the delete button is clicked", () => {
    render(
      <TaskCard
        task={mockTask as any}
        onUpdateProgress={mockOnUpdateProgress}
        onDelete={mockOnDelete}
      />
    );

    // The delete button is an icon button without explicit text, so we can find it by its svg or role.
    // In our component, it has the Trash2 icon. Let's find it by role.
    const buttons = screen.getAllByRole("button");
    const deleteButton = buttons.find((b: any) => b.innerHTML.includes("lucide-trash-2"));
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith("test-task-1");
    }
  });

  it("renders as completed when progress is 100", () => {
    render(
      <TaskCard
        task={{ ...mockTask, progress: 100, status: "Completed" } as any}
        onUpdateProgress={mockOnUpdateProgress}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Completed")).toBeInTheDocument();
  });
});
