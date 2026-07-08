import { render, screen, fireEvent } from "@testing-library/react";
import { TaskFilters } from "@/features/tasks/components/TaskFilters";
import { translations } from "@/i18n/translations";
const t = translations.en;

describe("TaskFilters", () => {
  it("renders search input and sort select", () => {
    const mockOnSearchChange = jest.fn();
    const mockOnSortChange = jest.fn();

    render(
      <TaskFilters
        search=""
        onSearchChange={mockOnSearchChange}
        sortBy="dueDate"
        onSortChange={mockOnSortChange}
      />
    );

    expect(screen.getByPlaceholderText(t.tasks.searchPlaceholder)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls onSearchChange when typing in the search input", () => {
    const mockOnSearchChange = jest.fn();
    const mockOnSortChange = jest.fn();

    render(
      <TaskFilters
        search=""
        onSearchChange={mockOnSearchChange}
        sortBy="dueDate"
        onSortChange={mockOnSortChange}
      />
    );

    const input = screen.getByPlaceholderText(t.tasks.searchPlaceholder);
    fireEvent.change(input, { target: { value: "React" } });

    expect(mockOnSearchChange).toHaveBeenCalledWith("React");
  });

  it("calls onSortChange when changing the sort select", () => {
    const mockOnSearchChange = jest.fn();
    const mockOnSortChange = jest.fn();

    render(
      <TaskFilters
        search=""
        onSearchChange={mockOnSearchChange}
        sortBy="dueDate"
        onSortChange={mockOnSortChange}
      />
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "priority" } });

    expect(mockOnSortChange).toHaveBeenCalledWith("priority");
  });
});
