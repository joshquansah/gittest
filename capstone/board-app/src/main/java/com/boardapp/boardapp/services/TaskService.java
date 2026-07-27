package com.boardapp.boardapp.services;

import com.boardapp.boardapp.dto.CreateTaskRequest;
import com.boardapp.boardapp.dto.TaskDto;
import com.boardapp.boardapp.dto.UpdateTaskRequest;
import com.boardapp.boardapp.entities.Project;
import com.boardapp.boardapp.entities.Task;
import com.boardapp.boardapp.entities.User;
import com.boardapp.boardapp.enums.Priority;
import com.boardapp.boardapp.enums.TaskStatus;
import com.boardapp.boardapp.mappers.TaskMapper;
import com.boardapp.boardapp.repositories.ProjectRepository;
import com.boardapp.boardapp.repositories.TaskRepository;

import com.boardapp.boardapp.repositories.UserRepository;
import org.antlr.v4.runtime.misc.LogManager;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.client.ResourceAccessException;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TaskMapper taskMapper;
    private final UpdateService updateService;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository, TaskMapper taskMapper, UpdateService updateService, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.taskMapper = taskMapper;
        this.updateService = updateService;
        this.userRepository = userRepository;
    }
    public TaskDto insertTask(UUID uuid, CreateTaskRequest request){
        Project project = projectRepository.findById(uuid)
                .orElseThrow(() -> new RuntimeException("Project not found with this id: " + uuid));
        User owner = userRepository.findById(request.ownerId())
                .orElseThrow(() -> new RuntimeException("User not found with this id: " + uuid));

        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status() != null ? request.status() : TaskStatus.TODO);
        task.setPriority(request.priority() != null ? request.priority() : Priority.MEDIUM);
        task.setDueDate(request.dueDate());
        task.setProject(project);
        task.setOwner(owner);

        Task saved = taskRepository.save(task);

        project.setLastActivityAt(LocalDateTime.now());
        projectRepository.save(project);
        updateService.broadcast(saved);
        return taskMapper.toDto(saved);
    }
    public TaskDto patchTask(UUID uuid, UpdateTaskRequest request) {
        Task task = taskRepository.findById(uuid)
                .orElseThrow(() -> new RuntimeException("Task not found with this id: " + uuid));
        if (request.title() != null) task.setTitle(request.title());
        if (request.description() != null) task.setDescription(request.description());
        if (request.status() != null) task.setStatus(request.status());
        if (request.priority() != null) task.setPriority(request.priority());
        if (request.dueDate() != null) task.setDueDate(request.dueDate());
        Task saved = taskRepository.save(task);
        Project project = saved.getProject();
        project.setLastActivityAt(LocalDateTime.now());
        projectRepository.save(project);
        updateService.broadcast(saved);
        return taskMapper.toDto(saved);
    }
}
