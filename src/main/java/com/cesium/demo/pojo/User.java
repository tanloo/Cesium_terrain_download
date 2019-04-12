package com.cesium.demo.pojo;

import lombok.*;
import lombok.experimental.Accessors;


/**
 * @author tanloo
 * on 2019/3/6
 */
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Accessors(chain = true)
public class User {
    private Long id;

    private String name;
}
