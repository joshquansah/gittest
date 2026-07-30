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
                            // Technology
                            new Team("Platform Engineering", "Technology"),
                            new Team("Data & AI", "Technology"),
                            new Team("Cybersecurity", "Technology"),
                            new Team("Digital Banking", "Technology"),

                            // Operations
                            new Team("Compliance", "Operations"),
                            new Team("Risk Management", "Operations"),
                            new Team("Business Operations", "Operations"),
                            new Team("Fraud & Investigations", "Operations"),

                            // Retail Banking
                            new Team("Consumer Lending", "Retail Banking"),
                            new Team("Deposits & Accounts", "Retail Banking"),
                            new Team("Wealth Management", "Retail Banking"),
                            new Team("Customer Experience", "Retail Banking"),

                            // Commercial Banking
                            new Team("Business Lending", "Commercial Banking"),
                            new Team("Commercial Real Estate", "Commercial Banking"),
                            new Team("Treasury Services", "Commercial Banking"),

                            // Finance
                            new Team("Corporate Finance", "Finance"),
                            new Team("Financial Reporting", "Finance"),
                            new Team("Internal Audit", "Finance"),

                            // People & Strategy
                            new Team("Talent Acquisition", "People & Strategy"),
                            new Team("Learning & Development", "People & Strategy"),
                            new Team("Corporate Strategy", "People & Strategy")
                    )
            );
        }
    }
}