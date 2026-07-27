package com.boardapp.boardapp.services;

import com.boardapp.boardapp.ai.tools.AgentTools;
import com.boardapp.boardapp.dto.CreateProjectRequest;
import com.boardapp.boardapp.dto.ProjectDto;
import com.boardapp.boardapp.entities.Project;
import com.boardapp.boardapp.mappers.ProjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.stereotype.Service;

@Service
public class AgentService {
    private final ChatClient chatClient;
    private final ProjectMapper projectMapper;

    public AgentService(ChatClient.Builder chatClientBuilder, AgentTools agentTools, ProjectMapper projectMapper) {
        this.chatClient = chatClientBuilder
                .defaultSystem("You are a strict data extraction assistant. Extract fields into the requested JSON schema.")
                .build();
        this.projectMapper = projectMapper;
    }
    public CreateProjectRequest processProjectRequest(String userInput){
        return chatClient.prompt()
                .user(userInput)
                .call()
                .entity(CreateProjectRequest.class);
    }
}
