package com.boardapp.boardapp.controllers;

import com.boardapp.boardapp.entities.Task;
import com.boardapp.boardapp.services.TaskService;
import com.boardapp.boardapp.services.UpdateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/tasks")
public class TaskController {
    private final TaskService taskService;
    private final UpdateService updateService;

    public TaskController(TaskService taskService, UpdateService updateService) {
        this.taskService = taskService;
        this.updateService = updateService;
    }

    @PatchMapping("/{taskId}")
    public ResponseEntity<Task> patchTask(
            @PathVariable UUID taskId,
            @RequestBody Map<String, Object> fields) {
        Task updatedTask = taskService.patchTask(taskId, fields);
        updateService.broadcast(updatedTask);
        return ResponseEntity.ok(updatedTask);
    }
}
