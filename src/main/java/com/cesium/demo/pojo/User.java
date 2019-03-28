package com.cesium.demo.pojo;

import lombok.*;
import lombok.experimental.Accessors;

import javax.persistence.*;

/**
 * @author tanloo
 * on 2019/3/6
 */
@Table(name="t_user")
@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Accessors(chain = true)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;
}
