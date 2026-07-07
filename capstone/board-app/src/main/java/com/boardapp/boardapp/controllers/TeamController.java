package com.boardapp.boardapp.controllers;

import com.boardapp.boardapp.dto.TeamDto;
import com.boardapp.boardapp.repositories.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/teams")
public class TeamController {

    @Autowired
    private TeamRepository teamRepository;

    @GetMapping
    public List<TeamDto> getAll() {
        return teamRepository.findAll()
                .stream()
                .map(t -> new TeamDto(t.getId(), t.getDepartment()))
                .toList();
    }
}