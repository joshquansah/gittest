package com.boardapp.boardapp.dto;

import java.time.LocalDate;
import java.util.UUID;

public record CreateProjectRequest(
        String title,
        String description,
        UUID ownerId,
        UUID teamId,
        LocalDate dueDate
) {}