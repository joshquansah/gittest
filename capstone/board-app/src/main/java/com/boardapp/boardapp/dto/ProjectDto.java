package com.boardapp.boardapp.dto;


import com.boardapp.boardapp.entities.Task;
import com.boardapp.boardapp.entities.Team;
import com.boardapp.boardapp.entities.User;
import com.boardapp.boardapp.enums.ProjectStatus;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ProjectDto(UUID id, String title, String description, User owner, Team team, ProjectStatus projectStatus,
                         LocalDate dueDate, LocalDateTime createdAt, LocalDateTime lastActivityAt, List<TaskDto> tasks) {}