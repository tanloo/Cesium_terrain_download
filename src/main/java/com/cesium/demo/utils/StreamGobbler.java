package com.cesium.demo.utils;


import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * @author tanloo
 * on 2019/5/31
 */
public class StreamGobbler extends Thread {
    public InputStream is;

    public String type;

    public StreamGobbler(InputStream is, String type) {
        this.is = is;
        this.type = type;
    }

    @Override
    public void run() {
        try {
            InputStreamReader isr = new InputStreamReader(is);
            BufferedReader br = new BufferedReader(isr);
            String line = null;
            while ((line = br.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException ioe) {
            ioe.printStackTrace();
        }
    }
}
