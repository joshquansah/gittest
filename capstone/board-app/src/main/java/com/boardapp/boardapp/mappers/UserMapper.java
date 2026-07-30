package com.boardapp.boardapp.mappers;


import com.boardapp.boardapp.dto.UserDto;
import com.boardapp.boardapp.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "teamId", source = "team.id")
    UserDto toDto(User user);
    @Mapping(target = "teamId", source = "team.id")
    List<UserDto> toListDto(List<User> users);
}