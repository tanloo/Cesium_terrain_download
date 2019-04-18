package com.cesium.demo.pojo;

import lombok.*;

/**
 * @author tanloo
 * on 2019/4/17
 */
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CodeParam {
    private Long[] codes;
    private Integer tileLevel;
}
