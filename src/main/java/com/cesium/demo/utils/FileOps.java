package com.cesium.demo.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * @author tanloo
 * on 2019/4/10
 */
public class FileOps {

    private static void copyFile(String oldPath, String newPath) throws IOException {
        File oldFile = new File(oldPath);
        File file = new File(newPath);
        FileInputStream in = new FileInputStream(oldFile);
        FileOutputStream out = new FileOutputStream(file);

        byte[] buffer = new byte[2097152];
        int readByte = 0;
        while ((readByte = in.read(buffer)) != -1) {
            out.write(buffer, 0, readByte);
        }

        in.close();
        out.close();
    }

    static void copyDir(String sourcePath, String newPath) throws IOException {
        File file = new File(sourcePath);
        String[] filePath = file.list();

        if (!(new File(newPath)).exists()) {
            (new File(newPath)).mkdir();
        }
        if (filePath != null) {
            for (String s : filePath) {
                if ((new File(sourcePath + File.separator + s)).isDirectory()) {
                    copyDir(sourcePath + File.separator + s,
                            newPath + File.separator + s);
                }

                if (new File(sourcePath + File.separator + s).isFile()) {
                    copyFile(sourcePath + File.separator + s, newPath + File.separator + s);
                }

            }
        }

    }

    static void deleteFiles(String path) {
        File f = new File(path);
        if (f.isDirectory()) {
            String[] list = f.list();
            if (list != null) {
                for (String s : list) {
                    deleteFiles(path + "//" + s);
                }
            }

        }
        f.delete();
    }


}
