package com.boardapp.boardapp.services;

import com.boardapp.boardapp.entities.Project;
import com.boardapp.boardapp.entities.Task;
import com.boardapp.boardapp.repositories.TaskRepository;

import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.client.ResourceAccessException;

import java.lang.reflect.Field;
import java.util.Map;
import java.util.UUID;

@Service
public class TaskService {
    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }
    public Task patchTask(UUID uuid, Map<String, Object> fields) {
        Task existingTask = taskRepository.findById(uuid)
                        .orElseThrow(() -> new ResourceAccessException("Task not found with this id: " + uuid));
        fields.forEach((key, value) -> {
            Field field = ReflectionUtils.findField(Task.class, key);
            if(field != null){
                field.setAccessible(true);

                ReflectionUtils.setField(field, existingTask, value);
            }
        });
        return taskRepository.save(existingTask);
    }
}
