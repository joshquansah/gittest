package com.boardapp.boardapp.mappers;


import com.boardapp.boardapp.dto.UserDto;
import com.boardapp.boardapp.entities.User;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);
    List<UserDto> toListDto(List<User> users);
}