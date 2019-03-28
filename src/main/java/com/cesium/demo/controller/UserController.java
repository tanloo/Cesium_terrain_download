package com.cesium.demo.controller;

import com.cesium.demo.dao.UserDao;
import com.cesium.demo.pojo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author tanloo
 * on 2019/3/6
 */
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserDao userDao;

    @GetMapping
    public List<User> getAll(){
        return this.userDao.findAll();
    }

    @PostMapping
    public Object saveUser(@RequestBody User user) {
        this.userDao.save(user);
        return true;
    }

    @DeleteMapping("/{id}")
    public Object deleteUser(@PathVariable Long id) {
        this.userDao.deleteById(id);
        return true;
    }


}
