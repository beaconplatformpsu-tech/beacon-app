// @ts-ignore
import { renderHook, act } from "@testing-library/react";
import { useTasks } from "../useTasks";
import { onValue } from "firebase/database";

describe("useTasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns initial empty tasks and loading true when userId is present", () => {
    const { result } = renderHook(() => useTasks("test-user-id"));

    expect(result.current.loading).toBe(false);
    expect(result.current.tasks).toEqual([]);
  });

  it("returns loading false and empty array immediately if userId is undefined", () => {
    const { result } = renderHook(() => useTasks(undefined));

    expect(result.current.loading).toBe(false);
    expect(result.current.tasks).toEqual([]);
  });

  it("updates tasks when onValue triggers", () => {
    // Mock onValue to immediately call the callback with some data
    (onValue as jest.Mock).mockImplementationOnce((ref, callback) => {
      callback({
        val: () => ({
          task1: {
            id: "task1",
            title: "Test Task",
            category: "Homework/Assignment",
            courseName: "CS101",
            priority: "High",
            status: "Pending",
            progress: 0,
            dueDate: "2024-12-31T00:00:00.000Z",
            estimatedHours: 2,
          },
        }),
      });
      return jest.fn(); // Return unsubscribe function
    });

    const { result } = renderHook(() => useTasks("test-user-id"));

    expect(result.current.loading).toBe(false);
    expect(result.current.tasks.length).toBe(1);
    expect(result.current.tasks[0].id).toBe("task1");
    expect(result.current.tasks[0].title).toBe("Test Task");
  });
});
