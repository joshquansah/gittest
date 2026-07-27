package com.boardapp.boardapp.repositories;

import com.boardapp.boardapp.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);
    List<User> findByTeam_Id(UUID uuid);
}

