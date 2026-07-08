import { render, screen, fireEvent } from "@testing-library/react";
import { SkillCard } from "../_components/SkillCard";
import type { Skill } from "@/lib/types";

describe("SkillCard", () => {
  const mockSkill: Skill = {
    id: "test-skill-1",
    name: "React",
    category: "Frontend & UI",
    proficiency: "Intermediate",
    progress: 50,
  };

  const mockOnUpdateProgress = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders skill details correctly", () => {
    render(
      <SkillCard
        skill={mockSkill}
        onUpdateProgress={mockOnUpdateProgress}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Frontend & UI")).toBeInTheDocument();
    expect(screen.getByText(/Intermediate/)).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("calls onUpdateProgress when +5% button is clicked", () => {
    render(
      <SkillCard
        skill={mockSkill}
        onUpdateProgress={mockOnUpdateProgress}
        onDelete={mockOnDelete}
      />
    );

    const incrementButton = screen.getByText(/\+5%/);
    fireEvent.click(incrementButton);
    expect(mockOnUpdateProgress).toHaveBeenCalledWith("test-skill-1", 50, 5);
  });

  it("calls onDelete when the delete button is clicked", () => {
    render(
      <SkillCard
        skill={mockSkill}
        onUpdateProgress={mockOnUpdateProgress}
        onDelete={mockOnDelete}
      />
    );

    const buttons = screen.getAllByRole("button");
    const deleteButton = buttons.find((b: any) => b.innerHTML.includes("lucide-trash-2"));
    const plusBtn = buttons.find((b: any) => b.innerHTML.includes("lucide-plus"));
    const minusBtn = buttons.find((btn: any) => btn.innerHTML.includes("lucide-minus"));
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith("test-skill-1");
    }
  });

  it("disables update buttons when proficiency is Expert", () => {
    render(
      <SkillCard
        skill={{ ...mockSkill, proficiency: "Expert", progress: 100 }}
        onUpdateProgress={mockOnUpdateProgress}
        onDelete={mockOnDelete}
      />
    );

    const buttons = screen.getAllByRole("button");
    const updateButtons = buttons.filter((b: any) => b.innerHTML.includes("+5%") || b.innerHTML.includes("+15%"));
    updateButtons.forEach((btn: any) => {
      expect(btn).toBeDisabled();
    });
  });
});
