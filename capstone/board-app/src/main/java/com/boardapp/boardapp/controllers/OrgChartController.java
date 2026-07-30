package com.boardapp.boardapp.controllers;

import com.boardapp.boardapp.dto.OrgNodeDto;
import com.boardapp.boardapp.entities.User;
import com.boardapp.boardapp.mappers.OrgNodeMapper;
import com.boardapp.boardapp.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/orgchart")
public class OrgChartController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrgNodeMapper orgNodeMapper;

    @GetMapping
    public ResponseEntity<List<OrgNodeDto>> getFullOrgChart() {
        List<User> roots = userRepository.findByManagerIsNull();

        List<OrgNodeDto> chart = roots.stream()
                .map(orgNodeMapper::userToOrgNodeDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(chart);
    }

}
