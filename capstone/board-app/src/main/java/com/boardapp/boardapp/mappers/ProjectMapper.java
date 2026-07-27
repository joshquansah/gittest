package com.boardapp.boardapp.mappers;

import com.boardapp.boardapp.dto.ProjectDto;
import com.boardapp.boardapp.entities.Project;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProjectMapper {
    ProjectDto toDto(Project project);
    List<ProjectDto> toListDto(List<Project> projects);
}
