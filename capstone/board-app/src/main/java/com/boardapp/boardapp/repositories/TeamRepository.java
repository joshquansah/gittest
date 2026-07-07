package com.boardapp.boardapp.repositories;

import com.boardapp.boardapp.entities.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {
    Optional<Team> findByName(String name);
    List<Team> findByDepartment(String department);


}