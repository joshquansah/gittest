package com.boardapp.boardapp.services;

import com.boardapp.boardapp.dto.CreateProjectRequest;
import com.boardapp.boardapp.dto.ProjectDto;
import com.boardapp.boardapp.entities.Project;

import com.boardapp.boardapp.entities.Team;
import com.boardapp.boardapp.entities.User;
import com.boardapp.boardapp.mappers.ProjectMapper;
import com.boardapp.boardapp.repositories.ProjectRepository;
import com.boardapp.boardapp.repositories.TeamRepository;
import com.boardapp.boardapp.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final ProjectMapper projectMapper;


    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository, TeamRepository teamRepository, ProjectMapper projectMapper) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.projectMapper = projectMapper;
    }
    public List<ProjectDto> getAllProjects(){
        List<Project> allProjects = projectRepository.findAll();
        return projectMapper.toListDto(allProjects);
    }

    public List<ProjectDto> getTeamProjects(UUID uuid){
        List<Project> teamProjects = projectRepository.findByTeam_Id(uuid);
        return projectMapper.toListDto(teamProjects);
    }

    public ProjectDto getProject(UUID uuid){return projectRepository.findById(uuid)
            .map(projectMapper::toDto)
            .orElseThrow(() -> new RuntimeException("Project not found"));}
    public Project insertProject(CreateProjectRequest request) {
        User owner = userRepository.findById(request.ownerId())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        Team team = teamRepository.findById(request.teamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));

        Project project = new Project();
        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setOwner(owner);
        project.setTeam(team);
        project.setDueDate(request.dueDate());


        return projectRepository.save(project);
    }
}
