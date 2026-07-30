package com.boardapp.boardapp.mappers;

import com.boardapp.boardapp.dto.OrgNodeDto;
import com.boardapp.boardapp.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrgNodeMapper {

    @Mapping(target = "teamName", source = "team.name")
    @Mapping(target = "children", source = "reports")
    OrgNodeDto userToOrgNodeDTO(User user);
}