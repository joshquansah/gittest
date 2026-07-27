package com.boardapp.boardapp.ai.tools;

import com.boardapp.boardapp.dto.ProjectDto;
import com.boardapp.boardapp.entities.Project;
import com.boardapp.boardapp.mappers.ProjectMapper;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class AgentTools {

    private final ProjectMapper projectMapper;

    public AgentTools(ProjectMapper projectMapper) {
        this.projectMapper = projectMapper;
    }

    @Tool(description = "Creates a new project with only these fields and returns it to the front end for it fill in the fields. Do not guess or provide other fields")
    public ProjectDto createProjectTool(
            @ToolParam(description = "Title of the project") String title,
            @ToolParam(description = "Description of the project") String description,
            @ToolParam(description = "The due date of the project") LocalDate dueDate

    ){
        Project project = new Project();
        project.setTitle(title);
        project.setDescription(description);
        project.setDueDate(dueDate);
        return projectMapper.toDto(project);
    }
}
