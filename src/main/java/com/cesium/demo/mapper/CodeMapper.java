package com.cesium.demo.mapper;

import com.cesium.demo.pojo.Code;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

/**
 * @author tanloo
 * on 2019/4/12
 */
@Mapper
@Repository
public interface CodeMapper {

    @Select("select * from codes where id=#{id}")
    Code getOne(long id);
}
