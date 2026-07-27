package com.boardapp.boardapp.controllers;

import com.boardapp.boardapp.dto.CreateTaskRequest;
import com.boardapp.boardapp.dto.TaskDto;
import com.boardapp.boardapp.dto.UpdateTaskRequest;
import com.boardapp.boardapp.entities.Task;
import com.boardapp.boardapp.mappers.TaskMapper;
import com.boardapp.boardapp.services.TaskService;
import com.boardapp.boardapp.services.UpdateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/projects/{projectId}/tasks")
public class TaskController {
    private final TaskService taskService;
    private final UpdateService updateService;
    private final TaskMapper taskMapper;

    public TaskController(TaskService taskService, UpdateService updateService, TaskMapper taskMapper) {
        this.taskService = taskService;
        this.updateService = updateService;
        this.taskMapper = taskMapper;
    }
    @PostMapping()
    public TaskDto createTask(
            @PathVariable UUID projectId,
            @RequestBody CreateTaskRequest createTaskRequest) {
        return taskService.insertTask(projectId, createTaskRequest);
    }
    @PatchMapping("/{taskId}")
    public TaskDto patchTask(
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @RequestBody UpdateTaskRequest updateTaskRequest) {

        return taskService.patchTask(taskId, updateTaskRequest);
    }
}
