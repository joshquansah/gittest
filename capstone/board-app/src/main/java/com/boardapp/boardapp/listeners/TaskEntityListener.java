package com.boardapp.boardapp.listeners;

import com.boardapp.boardapp.entities.Task;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class TaskEntityListener {

    @PrePersist
    public void onCreate(Task task) {
        task.setCreatedAt(LocalDateTime.now());
        task.setLastActivityAt(LocalDateTime.now());
    }

    @PreUpdate
    public void onUpdate(Task task) {
        task.setLastActivityAt(LocalDateTime.now());
    }
}