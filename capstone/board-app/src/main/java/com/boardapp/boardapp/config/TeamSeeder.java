package com.boardapp.boardapp.config;

import com.boardapp.boardapp.entities.Team;
import com.boardapp.boardapp.repositories.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TeamSeeder implements CommandLineRunner {

    @Autowired
    private TeamRepository teamRepository;

    @Override
    public void run(String... args) {
        if (teamRepository.count() == 0) {
            teamRepository.saveAll(List.of(
                    new Team("Treasury", "Finance"),
                    new Team("Data/AI", "IT"),
                    new Team("Social Media", "Marketing")
            ));
        }
    }
}