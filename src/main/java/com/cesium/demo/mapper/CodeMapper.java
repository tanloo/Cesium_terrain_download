package com.cesium.demo.mapper;

import com.cesium.demo.pojo.Code;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author tanloo
 * on 2019/4/12
 */
@Mapper
@Repository
public interface CodeMapper {
    @Select("select id, x1, y1, x2, y2, px1, py1, px2, py2, trim(path) as path from codes where id=#{id}")
    List<Code> getCodeInfo(long id);
}
