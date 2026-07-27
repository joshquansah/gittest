package com.boardapp.boardapp.mappers;

import com.boardapp.boardapp.dto.ProjectDto;
import com.boardapp.boardapp.dto.TaskDto;
import com.boardapp.boardapp.entities.Project;
import com.boardapp.boardapp.entities.Task;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TaskMapper {
    TaskDto toDto(Task task);
    List<TaskDto> toListDto(List<Task> tasks);
    Task toEntity(TaskDto dto);
}