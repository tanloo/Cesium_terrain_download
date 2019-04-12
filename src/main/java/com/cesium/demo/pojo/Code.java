package com.cesium.demo.pojo;

import lombok.*;
import lombok.experimental.Accessors;


/**
 * @author tanloo
 * on 2019/4/3
 */
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Accessors(chain = true)
public class Code {
    private Long id;
    private double x1;
    private double y1;
    private double x2;
    private double y2;
    private double px1;
    private double py1;
    private double px2;
    private double py2;
    private String path;
}
