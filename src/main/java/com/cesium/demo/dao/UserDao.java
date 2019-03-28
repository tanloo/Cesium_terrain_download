package com.cesium.demo.dao;

import com.cesium.demo.pojo.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @author tanloo
 * on 2019/3/6
 */
@Repository
public interface UserDao extends JpaRepository<User,Long> {
}
