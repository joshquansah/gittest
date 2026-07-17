package com.boardapp.boardapp.controllers;

import com.boardapp.boardapp.dto.UserDto;
import com.boardapp.boardapp.entities.User;
import com.boardapp.boardapp.repositories.UserRepository;
import com.boardapp.boardapp.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> getUsers(){
        return userService.getAllUsers();

    }
    @PostMapping
    public ResponseEntity<User> addNewUser(
            @RequestBody UserDto request) {
        User saved = userService.insertUser(request);
        return ResponseEntity.status(201).body(saved);
    }

}