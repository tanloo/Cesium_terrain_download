package com.cesium.demo.controller;

import com.cesium.demo.mapper.CodeMapper;
import com.cesium.demo.pojo.Code;
import com.cesium.demo.pojo.CodeParam;
import com.cesium.demo.utils.FileOps;
import com.cesium.demo.utils.ImgOps;
import com.cesium.demo.utils.UnZipFile;
import org.apache.commons.lang3.ArrayUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.net.URL;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * @author tanloo
 * on 2019/4/3
 */
@RestController
@RequestMapping("/code")
public class CodeController {

    private final CodeMapper codeMapper;

    @Autowired
    public CodeController(CodeMapper codeMapper) {
        this.codeMapper = codeMapper;
    }

    @PostMapping
    public Object getCodesInfo(@RequestBody CodeParam codeParam) {
        Map<Long, Code> map = new HashMap<>(codeParam.getCodes().length);
        Set<String> zipPaths = new HashSet<>();

        for (Long id : codeParam.getCodes()) {
            Code code = this.codeMapper.getOne(id);
            if (code != null) {
                if (new File(code.getPath()).exists()) {
                    map.put(id, code);
                    zipPaths.add(code.getPath());
                }
            }
        }
        if (zipPaths.size() == 0) {
            return map;
        }
        try {
            Set<String> imgPaths = UnZipFile.unZipFile(zipPaths);
            String imgPath = "";
            imgPath = ImgOps.mergeImg(imgPaths);
            ImgOps.img2terrain(imgPath, codeParam.getTileLevel());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return map;
    }
}
