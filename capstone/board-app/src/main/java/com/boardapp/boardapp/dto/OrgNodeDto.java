package com.boardapp.boardapp.dto;

import java.util.List;
import java.util.UUID;

public record OrgNodeDto(
        UUID id,
        String username,
        String email,
        String role,
        String teamName,
        List<OrgNodeDto> children
) {}