package com.boardapp.boardapp.dto;

import com.boardapp.boardapp.entities.User;
import com.boardapp.boardapp.enums.Priority;
import com.boardapp.boardapp.enums.TaskStatus;

import java.time.LocalDate;
import java.util.UUID;

public record CreateTaskRequest(String title, String description, TaskStatus status, Priority priority, LocalDate dueDate, UUID ownerId) {
}
