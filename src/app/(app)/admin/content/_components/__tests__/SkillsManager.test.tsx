import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SkillsManager } from "@/app/(app)/admin/content/_components/SkillsManager";

jest.mock("firebase/database", () => ({
  ref: jest.fn(),
  push: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

jest.mock("@/hooks/use-custom-toast", () => ({
  useCustomToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  }),
}));

const mockSkills = [{ id: "skill1", name: "React" }];
const mockPaths: any[] = [];
const mockResources: any[] = [];
const mockCategories: any[] = [];

describe("SkillsManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders existing skills", () => {
    render(<SkillsManager skills={mockSkills} paths={mockPaths} resources={mockResources} categories={mockCategories} />);
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("opens 'New Skill' dialog on Add Skill click", () => {
    render(<SkillsManager skills={mockSkills} paths={mockPaths} resources={mockResources} categories={mockCategories} />);
    fireEvent.click(screen.getByText("Add Skill"));
    expect(screen.getByText("New Skill")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. React.js")).toBeInTheDocument();
  });

  it("allows submitting a new skill", async () => {
    render(<SkillsManager skills={mockSkills} paths={mockPaths} resources={mockResources} categories={mockCategories} />);
    fireEvent.click(screen.getByText("Add Skill"));
    
    const nameInput = screen.getByPlaceholderText("e.g. React.js");
    fireEvent.change(nameInput, { target: { value: "Next.js" } });
    
    fireEvent.click(screen.getByText("Save Skill"));
    
    const { push } = require("firebase/database");
    await waitFor(() => {
      expect(push).toHaveBeenCalled();
    });
  });
});
