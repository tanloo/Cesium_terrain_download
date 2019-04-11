package com.cesium.demo.dao;

import com.cesium.demo.pojo.Code;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @author tanloo
 * on 2019/4/3
 */
@Repository
public interface CodeDao extends JpaRepository<Code, Long> {
}
