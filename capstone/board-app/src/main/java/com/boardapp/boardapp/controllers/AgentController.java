package com.boardapp.boardapp.controllers;

import com.boardapp.boardapp.dto.CreateProjectRequest;
import com.boardapp.boardapp.dto.ProjectDto;
import com.boardapp.boardapp.services.AgentService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai")
public class AgentController {
    private final AgentService agentService;

    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }
    @PostMapping("/parse")
    public CreateProjectRequest generatedProject(
            @RequestBody String input
    ){
       return agentService.processProjectRequest(input);
    }
}
