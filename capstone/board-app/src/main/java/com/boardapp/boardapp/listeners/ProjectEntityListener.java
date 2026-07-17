package com.boardapp.boardapp.listeners;

import com.boardapp.boardapp.entities.Project;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ProjectEntityListener {

    @PrePersist
    public void onCreate(Project project) {
        project.setCreatedAt(LocalDateTime.now());
        project.setLastActivityAt(LocalDateTime.now());
    }

    @PreUpdate
    public void onUpdate(Project project) {
        project.setLastActivityAt(LocalDateTime.now());
    }
}