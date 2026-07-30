package com.boardapp.boardapp.entities;

import com.boardapp.boardapp.enums.Role;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name="users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String username;
    private String email;
    private String password;
    private String expertise;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;
    @OneToMany(mappedBy = "manager", cascade = CascadeType.ALL)
    private List<User> reports = new ArrayList<>();
    public User() {
    }

    public User(UUID id, String username, String email, String password, String expertise, Role role, Team team, User manager, List<User> reports) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.expertise = expertise;
        this.role = role;
        this.team = team;
        this.manager = manager;
        this.reports = reports;
    }







    public UUID getId() {
        return id;
    }

    public void setId(UUID uuid) {
        this.id = uuid;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String name) {
        this.username = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public User getManager() {
        return manager;
    }

    public void setManager(User manager) {
        this.manager = manager;
    }

    public List<User> getReports() {
        return reports;
    }

    public void setReports(List<User> reports) {
        this.reports = reports;
    }

    public String getExpertise() {
        return expertise;
    }

    public void setExpertise(String expertise) {
        this.expertise = expertise;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id) && Objects.equals(username, user.username) && Objects.equals(email, user.email) && Objects.equals(password, user.password) && Objects.equals(expertise, user.expertise) && role == user.role && Objects.equals(team, user.team) && Objects.equals(manager, user.manager) && Objects.equals(reports, user.reports);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, username, email, password, expertise, role, team, manager, reports);
    }
}