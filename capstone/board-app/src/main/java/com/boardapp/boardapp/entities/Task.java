package com.boardapp.boardapp.entities;

import com.boardapp.boardapp.enums.Priority;
import com.boardapp.boardapp.enums.TaskStatus;
import com.boardapp.boardapp.listeners.ProjectEntityListener;
import com.boardapp.boardapp.listeners.TaskEntityListener;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "tasks")
@EntityListeners(TaskEntityListener.class)
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    private String description;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Enumerated(EnumType.STRING)
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;

    private LocalDate dueDate;

    private LocalDateTime createdAt;
    private LocalDateTime lastActivityAt;

    private boolean isStale = false;
    private int escalationLevel = 0;
    private LocalDateTime lastEscalatedAt;

    public Task() {
    }

    public Task(UUID id, String title, String description, Project project, User owner, TaskStatus status, Priority priority, LocalDate dueDate, LocalDateTime createdAt, LocalDateTime lastActivityAt, boolean isStale, int escalationLevel, LocalDateTime lastEscalatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.project = project;
        this.owner = owner;
        this.status = status;
        this.priority = priority;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
        this.lastActivityAt = lastActivityAt;
        this.isStale = isStale;
        this.escalationLevel = escalationLevel;
        this.lastEscalatedAt = lastEscalatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }

    public void setLastActivityAt(LocalDateTime lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }

    public boolean isStale() {
        return isStale;
    }

    public void setStale(boolean stale) {
        isStale = stale;
    }

    public int getEscalationLevel() {
        return escalationLevel;
    }

    public void setEscalationLevel(int escalationLevel) {
        this.escalationLevel = escalationLevel;
    }

    public LocalDateTime getLastEscalatedAt() {
        return lastEscalatedAt;
    }

    public void setLastEscalatedAt(LocalDateTime lastEscalatedAt) {
        this.lastEscalatedAt = lastEscalatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Task task = (Task) o;
        return isStale == task.isStale && escalationLevel == task.escalationLevel && Objects.equals(id, task.id) && Objects.equals(title, task.title) && Objects.equals(description, task.description) && Objects.equals(project, task.project) && Objects.equals(owner, task.owner) && status == task.status && priority == task.priority && Objects.equals(dueDate, task.dueDate) && Objects.equals(createdAt, task.createdAt) && Objects.equals(lastActivityAt, task.lastActivityAt) && Objects.equals(lastEscalatedAt, task.lastEscalatedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, description, project, owner, status, priority, dueDate, createdAt, lastActivityAt, isStale, escalationLevel, lastEscalatedAt);
    }
}