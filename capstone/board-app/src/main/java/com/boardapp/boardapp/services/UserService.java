package com.boardapp.boardapp.services;

import com.boardapp.boardapp.dto.UserDto;
import com.boardapp.boardapp.entities.Team;
import com.boardapp.boardapp.entities.User;
import com.boardapp.boardapp.enums.Role;
import com.boardapp.boardapp.mappers.UserMapper;
import com.boardapp.boardapp.repositories.TeamRepository;
import com.boardapp.boardapp.repositories.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;


@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, TeamRepository teamRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.userMapper = userMapper;
    }
    public List<UserDto> getAllUsers(){
        List<User> allUsers = userRepository.findAll();
        return userMapper.toListDto(allUsers);
    }
    public List<UserDto> getTeamUsers(UUID uuid){
        List<User> teamUsers = userRepository.findByTeam_Id(uuid);
        return userMapper.toListDto(teamUsers);
    }

    public User insertUser(UserDto request) {
        User user = new User();
        Team team = teamRepository.findById(request.teamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));
        user.setRole(Role.valueOf(request.role()));
        user.setEmail(request.email());
        user.setTeam(team);



        return userRepository.save(user);
    }
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles("USER")
                .build();
    }
}
