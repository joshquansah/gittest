package com.boardapp.boardapp.controllers;

import com.boardapp.boardapp.services.UpdateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/updates")
public class UpdateController {

    @Autowired
    private UpdateService updateService;

    @GetMapping("/stream")
    public SseEmitter stream() {
        return updateService.addEmitter();
    }
}

