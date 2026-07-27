package com.boardapp.boardapp.controllers;

import com.boardapp.boardapp.dto.CreateProjectRequest;
import com.boardapp.boardapp.dto.ProjectDto;
import com.boardapp.boardapp.entities.Project;
import com.boardapp.boardapp.repositories.ProjectRepository;
import com.boardapp.boardapp.services.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/projects")
public class ProjectController {
    private final ProjectService projectService;
    private final ProjectRepository projectRepository;

    public ProjectController(ProjectService projectService, ProjectRepository projectRepository) {
        this.projectService = projectService;
        this.projectRepository = projectRepository;
    }
    @GetMapping
    public List<ProjectDto> getAllProjects(){
        return projectService.getAllProjects();
    }
    @GetMapping("/{projectId}")
    public ProjectDto getProject(
            @PathVariable UUID projectId
    ){
        return projectService.getProject(projectId);
    }
    @PostMapping
    public ResponseEntity<Project> addProject(
            @RequestBody CreateProjectRequest request) {

        Project saved = projectService.insertProject(request);
        return ResponseEntity.status(201).body(saved);
    }
}
