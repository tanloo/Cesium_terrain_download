package com.cesium.demo.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * @author tanloo
 * on 2019/4/10
 */
public class CopyFiles {

    public static void copyFile(String oldPath, String newPath) throws IOException {
        File oldFile = new File(oldPath);
        File file = new File(newPath);
        FileInputStream in = new FileInputStream(oldFile);
        FileOutputStream out = new FileOutputStream(file);;

        byte[] buffer=new byte[2097152];
        int readByte = 0;
        while((readByte = in.read(buffer)) != -1){
            out.write(buffer, 0, readByte);
        }

        in.close();
         out.close();
    }
    public  static void copyDir(String sourcePath, String newPath) throws IOException {
        File file = new File(sourcePath);
        String[] filePath = file.list();

        if (!(new File(newPath)).exists()) {
            (new File(newPath)).mkdir();
        }

        for (int i = 0; i < filePath.length; i++) {
            if ((new File(sourcePath + File.separator + filePath[i])).isDirectory()) {
                copyDir(sourcePath  + File.separator  + filePath[i],
                        newPath  + File.separator + filePath[i]);
            }

            if (new File(sourcePath  + File.separator + filePath[i]).isFile()) {
                copyFile(sourcePath + File.separator + filePath[i], newPath + File.separator + filePath[i]);
            }

        }
    }



}
