package com.boardapp.boardapp.entities;

import jakarta.persistence.*;

import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "teams")
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String department;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private User manager;

    public Team() {
    }

    public Team(String name, String department) {
        this.name = name;
        this.department = department;
    }

    public Team(UUID id, String name, String department, User manager, Team parentTeam) {
        this.id = id;
        this.name = name;
        this.department = department;
        this.manager = manager;

    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public User getManager() {
        return manager;
    }

    public void setManager(User manager) {
        this.manager = manager;
    }



    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Team team = (Team) o;
        return Objects.equals(id, team.id) && Objects.equals(name, team.name) && Objects.equals(department, team.department) && Objects.equals(manager, team.manager);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, department, manager);
    }
}
