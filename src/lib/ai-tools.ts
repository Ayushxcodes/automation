export const tools = [
  {
    name: "create_task",
    description: "Create a new task",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        platform: { type: "string" },
        projectId: { type: "string" }
      },
      required: ["title", "projectId"]
    }
  },
  {
    name: "schedule_task",
    description: "Schedule a task",
    input_schema: {
      type: "object",
      properties: {
        taskId: { type: "string" },
        publishDate: { type: "string" }
      },
      required: ["taskId", "publishDate"]
    }
  }
]
