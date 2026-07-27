package com.boardapp.boardapp.dto;

import com.boardapp.boardapp.entities.Project;
import com.boardapp.boardapp.entities.User;
import com.boardapp.boardapp.enums.Priority;
import com.boardapp.boardapp.enums.TaskStatus;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TaskDto(UUID id, String title, String description, User owner, TaskStatus status,
                      Priority priority, LocalDate dueDate, LocalDateTime createdAt, LocalDateTime lastActivityAt, boolean isStale, int escalationLevel, LocalDateTime lastEscalatedAt){
}
