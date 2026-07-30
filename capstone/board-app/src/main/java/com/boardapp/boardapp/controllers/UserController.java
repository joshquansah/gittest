package com.boardapp.boardapp.controllers;

import com.boardapp.boardapp.dto.UserDto;
import com.boardapp.boardapp.entities.User;
import com.boardapp.boardapp.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;


    public UserController(UserService userService) {
        this.userService = userService;

    }

    @GetMapping
    public List<UserDto> getUsers(){
        return userService.getAllUsers();

    }
    @GetMapping("/team/{teamId}")
    public List<UserDto> getTeamMembers(
            @PathVariable UUID teamId
    ){
        return userService.getTeamUsers(teamId);
    }
    @PostMapping
    public ResponseEntity<User> addNewUser(
            @RequestBody UserDto request) {
        User saved = userService.insertUser(request);
        return ResponseEntity.status(201).body(saved);
    }

}